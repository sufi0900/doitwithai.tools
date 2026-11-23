"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Info, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  browserAccounts,
  accountsConfigured,
  safeReturnPath,
} from "./supabase";
import { tools } from "../tool-catalog/catalog";

const valid = new Set(tools.map((t) => t.id));

function read(key: string): string[] {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data)
      ? data.filter((x) => typeof x === "string" && valid.has(x)).slice(0, 100)
      : [];
  } catch {
    return [];
  }
}

export type WorkspaceView = "all" | "saved" | "recent";

function parseHashView(): WorkspaceView | null {
  if (typeof window === "undefined") return null;
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const v = params.get("view");
  if (v === "saved" || v === "recent" || v === "all") return v;
  return null;
}

type Workspace = {
  user: User | null;
  saved: string[];
  recent: string[];
  likes: string[];
  counts: Record<string, number>;
  ready: boolean;
  message: string;
  dismissMessage: () => void;
  pending: string[];
  toggle: (id: string, kind: "bookmark" | "like") => void;
  signIn: () => void;
  signOut: () => void;
  visit: (id: string) => void;
  sync: () => void;
  localCount: number;
  signingIn: boolean;
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
  selectView: (view: WorkspaceView) => void;
  activeTopic: string;
  setActiveTopic: (topic: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
};

const Context = createContext<Workspace | null>(null);
export const useWorkspace = () => useContext(Context);

export default function WorkspaceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const existing = useContext(Context);
  if (existing) {
    return <>{children}</>;
  }
  return <WorkspaceStateRoot>{children}</WorkspaceStateRoot>;
}

function WorkspaceStateRoot({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [saved, setSaved] = useState<string[]>([]),
    [recent, setRecent] = useState<string[]>([]),
    [likes, setLikes] = useState<string[]>([]),
    [counts, setCounts] = useState<Record<string, number>>({}),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState<string[]>([]),
    [localCount, setLocalCount] = useState(0),
    [signingIn, setSigningIn] = useState(false),
    [view, setView] = useState<WorkspaceView>("all"),
    [activeTopic, setActiveTopic] = useState(""),
    [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const identity = useRef<string | null>(null),
    busy = useRef(new Set<string>());

  // Sync view with URL hash on mount, hashchange, and popstate
  useEffect(() => {
    const syncFromLocation = () => {
      const parsed = parseHashView();
      setView(parsed || "all");
    };
    syncFromLocation();
    window.addEventListener("hashchange", syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncFromLocation);
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, []);

  // Auto-dismiss transient status messages so they never block the workspace
  useEffect(() => {
    if (
      !message ||
      /could|failed|unavailable|not available|expired|wait/i.test(message)
    )
      return;
    const timer = window.setTimeout(() => {
      setMessage("");
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const selectView = useCallback((nextView: WorkspaceView) => {
    setView(nextView);
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/tools") {
        const nextHash = `#view=${nextView}`;
        if (window.location.hash !== nextHash) {
          window.history.replaceState(null, "", `/tools${nextHash}`);
        }
      }
      window.dispatchEvent(
        new CustomEvent("tools:viewchange", { detail: { view: nextView } }),
      );
    }
  }, []);

  useEffect(() => {
    setSaved(read("tools:saved"));
    setLocalCount(read("tools:saved").length);
    setRecent(read("tools:recent"));
    let active = true;
    let dispose = () => {};
    browserAccounts()
      .then((client) => {
        if (!active) return;
        if (!client) {
          setReady(true);
          return;
        }
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((_event, session) => {
          if (active) {
            const nextId = session?.user.id || null;
            if (identity.current !== nextId || _event === "INITIAL_SESSION") {
              identity.current = nextId;
              setSaved(session ? [] : read("tools:saved"));
              setLikes([]);
              setReady(!session);
              setMessage("");
            }
            setUser(session?.user || null);
          }
        });
        dispose = () => subscription.unsubscribe();
      })
      .catch(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
      dispose();
    };
  }, []);

  useEffect(() => {
    let active = true;
    const id = user?.id;
    if (!id) return;
    setReady(false);
    browserAccounts()
      .then(async (client) => {
        if (!client) return;
        const [bookmarks, votes] = await Promise.all([
          client.from("tool_bookmarks").select("tool_id"),
          client.from("tool_likes").select("tool_id"),
        ]);
        if (!active || identity.current !== id) return;
        if (bookmarks.error || votes.error) {
          setMessage(
            "Your saved tools could not load. Reload this page to retry.",
          );
          return;
        } else {
          setSaved((bookmarks.data || []).map((x) => x.tool_id));
          setLikes((votes.data || []).map((x) => x.tool_id));
        }
        setReady(true);
      })
      .catch(() => {
        if (active) {
          setMessage(
            "Account saving is temporarily unavailable. Reload this page to retry.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let active = true;
    let dispose = () => {};
    browserAccounts()
      .then(async (client) => {
        if (!client || !active) return;
        const refresh = async () => {
          const { data } = await client
            .from("tool_stats")
            .select("tool_id,like_count");
          if (active && data)
            setCounts(
              Object.fromEntries(
                tools.map((tool) => [
                  tool.id,
                  Number(
                    data.find((x) => x.tool_id === tool.id)?.like_count || 0,
                  ),
                ]),
              ),
            );
        };
        await refresh();
        if (!active) return;
        const channel = client
          .channel("public-tool-counts")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "tool_stats" },
            () => {
              void refresh();
            },
          )
          .subscribe();
        dispose = () => {
          void client.removeChannel(channel);
        };
      })
      .catch(() => {});
    return () => {
      active = false;
      dispose();
    };
  }, []);

  async function signIn() {
    if (signingIn) return;
    setMessage("");
    if (!accountsConfigured) {
      setMessage(
        "Sign-in is not available yet. You can still use every tool and save bookmarks on this device.",
      );
      return;
    }
    try {
      const client = await browserAccounts();
      sessionStorage.setItem(
        "tools:return",
        safeReturnPath(location.pathname + location.search + location.hash),
      );
      setSigningIn(true);
      const result = await client!.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: location.origin + "/auth/callback" },
      });
      if (result.error) throw result.error;
    } catch {
      setSigningIn(false);
      setMessage("Google sign-in could not start. Please try again.");
    }
  }

  async function action(
    id: string,
    kind: "bookmark" | "like",
    active: boolean,
  ) {
    const uid = identity.current;
    if (!uid) return false;
    const key = kind + id;
    if (busy.current.has(key)) return false;
    busy.current.add(key);
    setPending([...busy.current]);
    try {
      const client = await browserAccounts();
      const { data } = await client!.auth.getSession();
      const response = await fetch("/api/tools/community", {
        method: "POST",
        signal: AbortSignal.timeout(20000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session?.access_token || ""}`,
        },
        body: JSON.stringify({ toolId: id, kind, active }),
      });
      if (!response.ok)
        throw Error(
          (await response.json()).error || "Your change could not be saved.",
        );
      if (identity.current !== uid) return false;
      const setter = kind === "bookmark" ? setSaved : setLikes;
      setter((old) =>
        active
          ? Array.from(new Set([...old, id]))
          : old.filter((x) => x !== id),
      );
      if (kind === "like") {
        const { data: total } = await client!
          .from("tool_stats")
          .select("like_count")
          .eq("tool_id", id)
          .maybeSingle();
        if (total && identity.current === uid)
          setCounts((old) => ({ ...old, [id]: Number(total.like_count) }));
      }
      if (identity.current !== uid) return false;
      setMessage(
        active
          ? kind === "like"
            ? "Thanks for your vote."
            : "Tool saved to your workspace."
          : kind === "like"
            ? "Vote removed."
            : "Removed from saved tools.",
      );
      return true;
    } catch (error) {
      if (identity.current === uid)
        setMessage(
          error instanceof Error
            ? error.message
            : "Your change could not be saved.",
        );
      return false;
    } finally {
      busy.current.delete(key);
      setPending([...busy.current]);
    }
  }

  function toggle(id: string, kind: "bookmark" | "like") {
    if (!valid.has(id)) return;
    if (!user) {
      if (kind === "like") {
        void signIn();
        return;
      }
      setSaved((old) => {
        const isRemoving = old.includes(id);
        const next = isRemoving ? old.filter((x) => x !== id) : [...old, id];
        try {
          localStorage.setItem("tools:saved", JSON.stringify(next));
          setLocalCount(next.length);
          setMessage(
            isRemoving
              ? "Removed from saved tools."
              : "Tool saved on this device.",
          );
        } catch {
          setMessage("This browser could not save your bookmark.");
        }
        return next;
      });
      return;
    }
    if (!ready) return;
    void action(id, kind, !(kind === "bookmark" ? saved : likes).includes(id));
  }

  function visit(id: string) {
    if (!valid.has(id)) return;
    setRecent((old) => {
      const next = [id, ...old.filter((x) => x !== id)].slice(0, 12);
      try {
        localStorage.setItem("tools:recent", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  async function sync() {
    const uid = identity.current;
    if (!uid || !ready) return;
    for (const id of read("tools:saved")) {
      if (identity.current !== uid) return;
      if (!saved.includes(id) && !(await action(id, "bookmark", true))) return;
    }
    try {
      localStorage.removeItem("tools:saved");
      setLocalCount(0);
    } catch {}
    setMessage("Your device bookmarks are now saved to your account.");
  }

  return (
    <Context.Provider
      value={{
        user,
        saved,
        recent,
        likes,
        counts,
        ready,
        message,
        dismissMessage: () => setMessage(""),
        pending,
        toggle,
        signIn: () => {
          void signIn();
        },
        signOut: () => {
          void browserAccounts()
            .then(async (c) => {
              const result = await c?.auth.signOut();
              if (result?.error) throw result.error;
            })
            .catch(() => setMessage("Sign-out failed. Please try again."));
        },
        visit,
        sync: () => {
          void sync();
        },
        localCount,
        signingIn,
        view,
        setView,
        selectView,
        activeTopic,
        setActiveTopic,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-3 z-[10040] flex max-w-[min(24rem,calc(100vw-1.5rem))] items-center gap-3 rounded-2xl border border-[#5271FF]/30 bg-white/95 px-4 py-3 text-xs font-semibold text-slate-900 shadow-2xl backdrop-blur-xl dark:border-[#5271FF]/40 dark:bg-[#161F30]/95 dark:text-white"
        >
          <Info
            size={17}
            className="shrink-0 text-[#5271FF] dark:text-[#93B4FF]"
          />
          <span className="flex-1 leading-relaxed">{message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setMessage("")}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </Context.Provider>
  );
}

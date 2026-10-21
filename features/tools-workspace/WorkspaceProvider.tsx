"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
type Workspace = {
  user: User | null;
  saved: string[];
  recent: string[];
  likes: string[];
  counts: Record<string, number>;
  ready: boolean;
  message: string;
  pending: string[];
  toggle: (id: string, kind: "bookmark" | "like") => void;
  signIn: () => void;
  signOut: () => void;
  visit: (id: string) => void;
  sync: () => void;
  localCount: number;
  signingIn: boolean;
};
const Context = createContext<Workspace | null>(null);
export const useWorkspace = () => useContext(Context);
export default function WorkspaceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null),
    [saved, setSaved] = useState<string[]>([]),
    [recent, setRecent] = useState<string[]>([]),
    [likes, setLikes] = useState<string[]>([]),
    [counts, setCounts] = useState<Record<string, number>>({}),
    [ready, setReady] = useState(false),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState<string[]>([]),
    [localCount, setLocalCount] = useState(0),
    [signingIn, setSigningIn] = useState(false);
  const identity = useRef<string | null>(null),
    busy = useRef(new Set<string>());
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
            : "Tool saved."
          : "Removed.",
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
        const next = old.includes(id)
          ? old.filter((x) => x !== id)
          : [...old, id];
        try {
          localStorage.setItem("tools:saved", JSON.stringify(next));
          setLocalCount(next.length);
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
      }}
    >
      {children}
    </Context.Provider>
  );
}

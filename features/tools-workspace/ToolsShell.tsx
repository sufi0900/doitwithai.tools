"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bookmark,
  ChevronRight,
  LayoutGrid,
  Menu,
  Maximize2,
  X,
  UserRound,
  LogOut,
} from "lucide-react";
import { categories, tools, toolPath } from "../tool-catalog/catalog";
import { topics } from "../tool-catalog/discovery";
import { ToolActions } from "./ToolActions";
import { useWorkspace } from "./WorkspaceProvider";
import "./workspace.css";
export default function ToolsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(),
    workspace = useWorkspace()!;
  const [navQuery, setNavQuery] = useState("");
  const [open, setOpen] = useState(false),
    [expanded, setExpanded] = useState(false),
    [profile, setProfile] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null),
    drawer = useRef<HTMLDivElement>(null),
    profileBox = useRef<HTMLDivElement>(null);
  const current = tools.find((t) => toolPath(t.slug) === pathname);
  const catalog = !current;
  useEffect(() => {
    setOpen(false);
    setProfile(false);
    if (current) workspace.visit(current.id);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!profile) return;
    const close = (event: PointerEvent) => {
      if (!profileBox.current?.contains(event.target as Node))
        setProfile(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfile(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, [profile]);
  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
      if (event.key === "Tab") {
        const elements = Array.from(
          drawer.current?.querySelectorAll<HTMLElement>(
            "a[href],button:not([disabled])",
          ) || [],
        );
        const first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  const navigation = (
    <>
      <Link href="/tools" className="workspace-nav-home">
        <LayoutGrid size={19} /> All tools{" "}
        <span className="ml-auto text-xs">{tools.length}</span>
      </Link>
      <div className="my-5 border-t border-slate-200 dark:border-slate-700" />
      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-primary">
        <Link href="/tools#view=saved">Saved tools</Link>
        <span aria-hidden="true">·</span>
        <Link href="/tools#view=recent">Recently used</Link>
      </div>
      <input
        type="search"
        aria-label="Find a tool in navigation"
        placeholder="Find a tool…"
        value={navQuery}
        onChange={(event) => setNavQuery(event.target.value)}
        className="mb-5 min-h-11 w-full rounded-xl border border-slate-200 bg-transparent px-3 text-sm dark:border-slate-700"
      />
      {topics.map((topic) => {
        const items = tools.filter(
          (tool) =>
            tool.topics.includes(topic.id) &&
            tool.name.toLowerCase().includes(navQuery.toLowerCase().trim()),
        );
        if (!items.length) return null;
        return (
          <details key={topic.id} open className="mb-4">
            <summary className="cursor-pointer px-2 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              {topic.name}{" "}
              <span className="ml-1 opacity-60">{items.length}</span>
            </summary>
            <div className="mt-1 space-y-1">
              {items.map((tool) => (
                <Link
                  key={tool.id}
                  prefetch={false}
                  href={toolPath(tool.slug)}
                  aria-current={current?.id === tool.id ? "page" : undefined}
                  className="workspace-nav-link"
                >
                  <span className="min-w-0 flex-1">{tool.name}</span>
                  {workspace.saved.includes(tool.id) && (
                    <Bookmark size={13} className="shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          </details>
        );
      })}
      {navQuery &&
        !tools.some((tool) =>
          tool.name.toLowerCase().includes(navQuery.toLowerCase().trim()),
        ) && (
          <p role="status" className="p-3 text-sm">
            No matching tools. Try another name.
          </p>
        )}
      <div className="mb-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4 text-xs dark:border-slate-700">
        {categories
          .filter((category) =>
            tools.some((tool) => tool.categories.includes(category.slug)),
          )
          .map((category) => (
            <Link
              key={category.slug}
              href={`/tools/categories/${category.slug}`}
              className="rounded-full border px-3 py-2"
            >
              {category.name}
            </Link>
          ))}
      </div>
      <p className="px-3 pb-8 text-xs leading-5 text-slate-500">
        Explore your next idea. Every tool is free to use.
      </p>
    </>
  );
  const photo = workspace.user?.user_metadata?.avatar_url;
  const rawName =
    workspace.user?.user_metadata?.full_name ||
    workspace.user?.user_metadata?.name ||
    "Your account";
  const name = typeof rawName === "string" ? rawName : "Your account";
  return (
    <div
      className={`tools-shell ${catalog ? "is-catalog" : "is-tool"} ${expanded ? "is-expanded" : ""}`}
    >
      <aside className="workspace-sidebar" aria-label="Tool navigation">
        {navigation}
      </aside>
      <div className="workspace-body min-w-0">
        <div className="workspace-toolbar">
          <div className="flex min-w-0 items-center gap-2">
            <button
              ref={trigger}
              className="workspace-icon"
              aria-label="Open tool navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <Link href="/tools" className="shrink-0 text-sm font-bold">
              Tools
            </Link>
            {current && (
              <>
                <ChevronRight size={16} className="shrink-0 text-slate-400" />
                <span className="hidden truncate text-sm text-slate-500 sm:block">
                  {current.name}
                </span>
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {current && (
              <>
                <ToolActions id={current.id} compact />
                <button
                  className="workspace-icon hidden sm:inline-flex"
                  title={expanded ? "Restore navigation" : "Expand workspace"}
                  aria-label={
                    expanded ? "Restore navigation" : "Expand workspace"
                  }
                  aria-pressed={expanded}
                  onClick={() => setExpanded(!expanded)}
                >
                  <Maximize2 size={18} />
                </button>
              </>
            )}
            <div ref={profileBox} className="relative">
              {workspace.user ? (
                <>
                  <button
                    className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-3 dark:border-slate-700"
                    aria-expanded={profile}
                    aria-label="Open your profile"
                    onClick={() => setProfile(!profile)}
                  >
                    {typeof photo === "string" &&
                    photo.startsWith("https://") ? (
                      /* eslint-disable-next-line @next/next/no-img-element */ <img
                        src={photo}
                        referrerPolicy="no-referrer"
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserRound size={24} />
                    )}
                    <span className="hidden max-w-28 truncate text-sm sm:block">
                      {name}
                    </span>
                  </button>
                  {profile && (
                    <div className="workspace-profile">
                      <p className="break-words font-bold">{name}</p>
                      <p className="mt-1 break-all text-sm text-slate-500">
                        {workspace.user.email}
                      </p>
                      <span className="my-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                        Free account
                      </span>
                      {workspace.localCount > 0 && (
                        <button
                          onClick={workspace.sync}
                          className="mb-3 block text-sm font-semibold text-primary"
                        >
                          Sync {workspace.localCount} device bookmarks
                        </button>
                      )}
                      <Link
                        href="/tools#view=saved"
                        className="mb-3 flex items-center gap-2 text-sm"
                      >
                        <Bookmark size={16} /> Your saved tools
                      </Link>
                      <button
                        onClick={workspace.signOut}
                        className="flex items-center gap-2 text-sm"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={workspace.signIn}
                  disabled={workspace.signingIn}
                  aria-busy={workspace.signingIn}
                  className="min-h-11 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
                >
                  {workspace.signingIn
                    ? "Opening Google…"
                    : "Sign in with Google"}
                </button>
              )}
            </div>
          </div>
        </div>
        {workspace.message && (
          <div
            role="status"
            className="border-b border-blue-100 bg-blue-50 px-5 py-3 text-sm text-slate-800"
          >
            {workspace.message}
          </div>
        )}
        {children}
      </div>
      {open && (
        <div
          className="fixed inset-0 z-[10050] bg-slate-950/50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              trigger.current?.focus();
            }
          }}
        >
          <div
            ref={drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Tool navigation"
            className="h-full w-[min(340px,90vw)] overflow-y-auto bg-white p-5 dark:bg-slate-900 dark:text-slate-100"
          >
            <div className="mb-5 flex items-center justify-between">
              <strong>Explore tools</strong>
              <button
                className="workspace-icon"
                aria-label="Close navigation"
                onClick={() => {
                  setOpen(false);
                  trigger.current?.focus();
                }}
              >
                <X size={20} />
              </button>
            </div>
            {navigation}
          </div>
        </div>
      )}
    </div>
  );
}

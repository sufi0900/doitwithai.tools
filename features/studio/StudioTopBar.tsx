"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { Bookmark, Clock, FilePenLine, Globe, LayoutDashboard, LayoutGrid, LogIn, LogOut, Moon, RefreshCw, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { useWorkspace, type WorkspaceView } from "@/features/tools-workspace/WorkspaceProvider";
import styles from "./studio-shell.module.css";

export default function StudioTopBar({
  pathname,
  siteName,
  children,
  actions,
  center,
}: {
  pathname: string;
  siteName?: string;
  children: ReactNode;
  actions?: ReactNode;
  center?: ReactNode;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const workspace = useWorkspace();
  const profile = useRef<HTMLDetailsElement>(null);
  const user = workspace?.user;
  const rawName = user?.user_metadata?.full_name || user?.user_metadata?.name;
  const name = typeof rawName === "string" ? rawName : "Your account";
  const photo = user?.user_metadata?.avatar_url;

  const closeProfile = () => { if (profile.current) profile.current.open = false; };
  const openTools = (view: WorkspaceView) => {
    workspace?.setActiveTopic("");
    workspace?.selectView(view);
    closeProfile();
  };

  useEffect(closeProfile, [pathname]);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (profile.current?.open && !profile.current.contains(event.target as Node)) profile.current.open = false;
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  return (
    <header className={styles.topBar}>
      <div className={styles.topBarLeft}>{children}</div>
      {center}
      <div className={styles.topBarActions}>
        {actions}
        <button
          type="button"
          className={styles.topAction}
          aria-label="Toggle light and dark mode"
          title="Toggle light and dark mode"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Moon size={16} className="dark:hidden" aria-hidden="true" />
          <Sun size={16} className="hidden dark:block" aria-hidden="true" />
        </button>
        {user ? (
          <details ref={profile} className={styles.profile} onKeyDown={(event) => {
            if (event.key !== "Escape" || !profile.current?.open) return;
            profile.current.open = false;
            profile.current.querySelector("summary")?.focus();
          }}>
            <summary className={styles.avatarButton} aria-label="Your profile" title={name}>
              {typeof photo === "string" && photo.startsWith("https://") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" referrerPolicy="no-referrer" className={styles.avatar} />
              ) : (
                <span className={styles.avatar}><UserRound size={15} aria-hidden="true" /></span>
              )}
            </summary>
            <div className={styles.profileMenu}>
              <div className={styles.profileIdentity}>
                <span title={name}>{name}</span>
                {user.email && <small title={user.email}>{user.email}</small>}
              </div>
              <div className={styles.profileGroup}>
                <Link href="/studio" prefetch={false} className={styles.profileItem} onClick={closeProfile}>
                  <LayoutDashboard size={14} /> My Dashboard
                </Link>
                {siteName && (
                  <Link href="/studio/writer" prefetch={false} className={styles.profileItem} onClick={closeProfile}>
                    <FilePenLine size={14} /> <span title={siteName}>Open {siteName} Studio</span>
                  </Link>
                )}
                <Link href="/ai-website-builder" prefetch={false} className={styles.profileItem} onClick={closeProfile}>
                  <Globe size={14} /> AI Website Builder
                </Link>
              </div>
              <div className={styles.profileGroup}>
                <div className={styles.profileLabel}>Tool Workspace</div>
                <Link href="/tools#view=all" prefetch={false} className={styles.profileItem} onClick={() => openTools("all")}>
                  <LayoutGrid size={14} /> All tools directory
                </Link>
                <Link href="/tools#view=saved" prefetch={false} className={styles.profileItem} onClick={() => openTools("saved")}>
                  <Bookmark size={14} /> Your saved tools <small className={styles.profileCount}>{workspace.saved.length}</small>
                </Link>
                <Link href="/tools#view=recent" prefetch={false} className={styles.profileItem} onClick={() => openTools("recent")}>
                  <Clock size={14} /> Recently used <small className={styles.profileCount}>{workspace.recent.length}</small>
                </Link>
                {workspace.localCount > 0 && (
                  <button type="button" className={styles.profileItem} onClick={() => {
                    workspace.sync();
                    closeProfile();
                  }}>
                    <RefreshCw size={14} /> Sync {workspace.localCount} device {workspace.localCount === 1 ? "bookmark" : "bookmarks"}
                  </button>
                )}
              </div>
              <button type="button" className={styles.profileItem} onClick={() => {
                closeProfile();
                workspace.signOut();
              }}><LogOut size={14} /> Sign out</button>
            </div>
          </details>
        ) : (
          <Link href={`/auth?next=${encodeURIComponent(pathname)}`} aria-label="Sign in" title="Sign in" className={styles.topAction}>
            <LogIn size={16} aria-hidden="true" />
          </Link>
        )}
      </div>
    </header>
  );
}

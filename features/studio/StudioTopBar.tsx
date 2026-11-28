"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { LogIn, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import styles from "./studio-shell.module.css";

export default function StudioTopBar({
  pathname,
  children,
  actions,
}: {
  pathname: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const workspace = useWorkspace();
  const profile = useRef<HTMLDetailsElement>(null);
  const user = workspace?.user;
  const rawName = user?.user_metadata?.full_name || user?.user_metadata?.name;
  const name = typeof rawName === "string" ? rawName : "Your account";
  const photo = user?.user_metadata?.avatar_url;

  useEffect(() => { if (profile.current) profile.current.open = false; }, [pathname]);

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
              <div className={styles.profileIdentity} title={name}>{name}</div>
              <button type="button" className={styles.profileItem} onClick={() => {
                if (profile.current) profile.current.open = false;
                workspace?.signOut();
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import Avatar from "@mui/material/Avatar";
import {
  Bookmark,
  ChevronDown,
  Clock,
  LayoutGrid,
  LogOut,
  RefreshCw,
  UserRound,
} from "lucide-react";
import {
  useWorkspace,
  type WorkspaceView,
} from "@/features/tools-workspace/WorkspaceProvider";
import { tools } from "@/features/tool-catalog/catalog";

const GoogleIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.04-4.38 3.04-7.51 0-.72-.06-1.42-.19-2.1H12z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.75 0 5.06-.91 6.75-2.47l-3.3-2.56c-.91.61-2.08.98-3.45.98-2.65 0-4.9-1.79-5.7-4.2H2.89v2.64A10 10 0 0 0 12 22z"
    />
    <path
      fill="#4A90E2"
      d="M6.3 13.75A6.02 6.02 0 0 1 5.98 12c0-.61.11-1.2.32-1.75V7.61H2.89A10 10 0 0 0 2 12c0 1.61.39 3.14 1.09 4.39l3.21-2.64z"
    />
    <path
      fill="#FBBC05"
      d="M12 6.05c1.5 0 2.84.52 3.9 1.53l2.92-2.92C17.05 3.01 14.75 2 12 2 8.09 2 4.71 4.24 2.89 7.61l3.41 2.64c.8-2.41 3.05-4.2 5.7-4.2z"
    />
  </svg>
);

const Header = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const usePathName = usePathname();
  const router = useRouter();
  const workspace = useWorkspace();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfileOpen(false);
    setNavbarOpen(false);
  }, [usePathName]);

  useEffect(() => {
    if (!profileOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const photo = workspace?.user?.user_metadata?.avatar_url;
  const rawName =
    workspace?.user?.user_metadata?.full_name ||
    workspace?.user?.user_metadata?.name ||
    "Your account";
  const name = typeof rawName === "string" ? rawName : "Your account";

  const handleWorkspaceJump = (targetView: WorkspaceView) => {
    setProfileOpen(false);
    setNavbarOpen(false);
    workspace?.setActiveTopic("");
    workspace?.selectView(targetView);
    const destination = `/tools#view=${targetView}`;
    if (usePathName === "/tools") {
      window.history.replaceState(null, "", destination);
      const finder = document.getElementById("tool-finder-section");
      finder?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(destination);
    }
  };

  const isMenuActive = (path?: string) => {
    if (!path) return false;
    if (path === "/tools") {
      return usePathName === "/tools" || usePathName.startsWith("/tools/");
    }
    return usePathName === path;
  };

  return (
    <>
      <header
        className={`header left-0 top-0 z-40 flex w-full items-center transition-all duration-500 ease-in-out ${
          sticky
            ? "fixed z-[9999] border-b border-gray-200/50 bg-white/95 !bg-opacity-95 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/95 dark:shadow-2xl"
            : "absolute bg-gradient-to-r from-white/[0.85] via-white/70 to-white/[0.85] backdrop-blur-sm dark:from-gray-900/[0.85] dark:via-gray-900/70 dark:to-gray-900/[0.85]"
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-30 mt-2 max-w-full px-4 xl:mr-8">
              <div className="group relative cursor-pointer">
                <Avatar
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  sx={{
                    width: 62,
                    height: 62,
                    background: "transparent",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  className="ring-2 ring-transparent transition-all duration-300 group-hover:scale-105 group-hover:ring-blue-500/40 group-hover:ring-offset-2 group-hover:ring-offset-white dark:group-hover:ring-offset-gray-900"
                >
                  <Image
                    src="/logoForHeader.png"
                    alt="Logo"
                    width={500}
                    height={500}
                    className="w-full transition-all duration-300 dark:hidden"
                  />
                  <Image
                    src="/logoForHeader.png"
                    alt="Logo"
                    width={500}
                    height={500}
                    className="hidden w-full transition-all duration-300 dark:block"
                  />
                </Avatar>
                <div className=" absolute inset-0 rounded-full bg-gradient-to-r from-[#5271FF]/0 via-[#5271FF]/10 to-[#5271FF]/0 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>
            </div>

            <div className="hidden xl:flex xl:flex-1 xl:justify-center">
              <nav id="navbarCollapse" className="navbar">
                <ul className="flex justify-center space-x-1.5 xl:space-x-2">
                  {menuData.map((menuItem, index) => {
                    const active = isMenuActive(menuItem.path);
                    return (
                      <li key={index} className="group relative font-semibold">
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            prefetch={true}
                            className={`
                              relative mb-5 mt-5 flex items-center justify-center rounded-xl border border-transparent px-3.5 py-2.5 backdrop-blur-sm transition-all duration-300 ease-in-out lg:mr-0 lg:inline-flex xl:px-4
                              ${
                                active
                                  ? "scale-105 transform bg-gradient-to-r from-[#5271FF] to-[#4361EE] text-white shadow-lg shadow-[#5271FF]/30"
                                  : "text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-100/70 hover:text-[#5271FF] dark:text-gray-300 dark:hover:bg-gray-800/70 dark:hover:text-[#5271FF]"
                              }
                            `}
                          >
                            <span className="relative z-10">
                              {menuItem.title}
                            </span>
                            <div
                              className={`absolute bottom-0 h-0.5 w-0 rounded-full bg-current transition-all duration-300 ease-in-out ${
                                !active ? "group-hover:w-full" : ""
                              }`}
                            ></div>
                          </Link>
                        ) : (
                          <>
                            <p
                              onClick={() => handleSubmenu(index)}
                              className="mt-5 flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-base text-gray-700 transition-all duration-300 ease-in-out hover:bg-gray-100 group-hover:text-[#5271FF] dark:text-gray-300 dark:hover:bg-gray-800/50 dark:group-hover:text-[#5271FF] lg:inline-flex xl:px-4"
                            >
                              <span className="relative z-10">
                                {menuItem.title}
                              </span>
                              <span className="transform pl-2 transition-transform duration-300 group-hover:rotate-180">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 25 24"
                                  className="text-current"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </p>
                            <div
                              className={`submenu relative left-0 top-full transform rounded-xl border border-gray-200/50 bg-white/95 shadow-xl backdrop-blur-xl transition-all duration-300 group-hover:opacity-100 dark:border-gray-700/50 dark:bg-gray-900/95 lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[280px] lg:scale-95 lg:p-6 lg:opacity-0 lg:shadow-2xl lg:group-hover:visible lg:group-hover:top-full lg:group-hover:scale-100 ${
                                openIndex === index
                                  ? "block scale-100 opacity-100"
                                  : "hidden scale-95 opacity-0"
                              }`}
                            >
                              {menuItem.submenu?.map(
                                (submenuItem, submenuIndex) => (
                                  <Link
                                    href={submenuItem.path}
                                    key={submenuIndex}
                                    prefetch={true}
                                    className="block rounded-lg border-l-2 border-transparent px-4 py-3 text-sm text-gray-700 transition-all duration-200 ease-in-out hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:text-gray-300 dark:hover:text-[#5271FF] lg:px-4"
                                  >
                                    <span className="flex items-center">
                                      <span className="mr-3 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#5271FF] to-[#4361EE]"></span>
                                      {submenuItem.title}
                                    </span>
                                  </Link>
                                ),
                              )}
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Right Controls: Theme Toggle + Unified Google Sign-In / User Workspace Menu */}
            <div className="flex items-center gap-2.5 pr-4 sm:gap-3">
              <ThemeToggler />

              {workspace && (
                <div ref={profileRef} className="relative">
                  {workspace.user ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={profileOpen}
                        aria-label="Open your profile"
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 pl-1.5 pr-2.5 text-slate-800 shadow-sm transition-all duration-200 hover:border-[#5271FF]/50 hover:bg-[#5271FF]/5 focus:outline-none focus:ring-2 focus:ring-[#5271FF]/40 dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:border-[#5271FF]/60"
                      >
                        <div className="relative">
                          {typeof photo === "string" &&
                          photo.startsWith("https://") ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={photo}
                              referrerPolicy="no-referrer"
                              alt=""
                              className="h-7 w-7 rounded-lg object-cover ring-1 ring-[#5271FF]/30"
                            />
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#5271FF] to-[#4361EE] text-xs font-bold text-white">
                              <UserRound size={15} />
                            </span>
                          )}
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"
                          />
                        </div>
                        <span className="hidden max-w-[110px] truncate text-xs font-semibold sm:block">
                          {name}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 transition-transform duration-200 ${
                            profileOpen ? "rotate-180 text-[#5271FF]" : ""
                          }`}
                        />
                      </button>

                      {profileOpen && (
                        <div className="fixed left-3 right-3 top-20 z-[10020] max-h-[calc(100dvh-100px)] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/95 p-4 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-slate-700/90 dark:bg-[#161F30]/95 dark:text-slate-100 sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[min(310px,calc(100vw-24px))]">
                          <div className="flex items-center gap-3 border-b border-slate-200/70 pb-3.5 dark:border-slate-700/70">
                            {typeof photo === "string" &&
                            photo.startsWith("https://") ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={photo}
                                referrerPolicy="no-referrer"
                                alt=""
                                className="h-10 w-10 rounded-xl object-cover ring-2 ring-[#5271FF]/30"
                              />
                            ) : (
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5271FF] to-[#4361EE] text-white">
                                <UserRound size={20} />
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold">
                                {name}
                              </p>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {workspace.user.email}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-[#5271FF]/30 bg-[#5271FF]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#4A6CF7] dark:text-[#AEBBFF]">
                              Free
                            </span>
                          </div>

                          {workspace.localCount > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                workspace.sync();
                                setProfileOpen(false);
                              }}
                              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#5271FF]/30 bg-[#5271FF]/10 px-3 py-2 text-xs font-semibold text-[#4A6CF7] transition hover:bg-[#5271FF]/20 dark:text-[#AEBBFF]"
                            >
                              <RefreshCw size={13} />
                              Sync {workspace.localCount} device{" "}
                              {workspace.localCount === 1
                                ? "bookmark"
                                : "bookmarks"}
                            </button>
                          )}

                          <div className="my-3 space-y-1">
                            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Tool Workspace
                            </p>
                            <button
                              type="button"
                              onClick={() => handleWorkspaceJump("all")}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                                usePathName === "/tools" &&
                                workspace.view === "all"
                                  ? "bg-[#5271FF]/[0.15] text-[#4A6CF7] dark:text-[#AEBBFF]"
                                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <LayoutGrid
                                  size={15}
                                  className="text-[#5271FF]"
                                />
                                All tools directory
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {tools.length}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleWorkspaceJump("saved")}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                                usePathName === "/tools" &&
                                workspace.view === "saved"
                                  ? "bg-[#5271FF]/[0.15] text-[#4A6CF7] dark:text-[#AEBBFF]"
                                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <Bookmark
                                  size={15}
                                  className="text-[#5271FF]"
                                />
                                Your saved tools
                              </span>
                              <span className="rounded-full bg-[#5271FF]/[0.15] px-2 py-0.5 text-[11px] font-bold text-[#4A6CF7] dark:text-[#AEBBFF]">
                                {workspace.saved.length}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleWorkspaceJump("recent")}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                                usePathName === "/tools" &&
                                workspace.view === "recent"
                                  ? "bg-[#5271FF]/[0.15] text-[#4A6CF7] dark:text-[#AEBBFF]"
                                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/70"
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <Clock size={15} className="text-[#5271FF]" />
                                Recently used
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {workspace.recent.length}
                              </span>
                            </button>
                          </div>

                          <div className="border-t border-slate-200/70 pt-2.5 dark:border-slate-700/70">
                            <button
                              type="button"
                              onClick={() => {
                                workspace.signOut();
                                setProfileOpen(false);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                            >
                              <LogOut size={15} />
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={workspace.signIn}
                      disabled={workspace.signingIn}
                      aria-busy={workspace.signingIn}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 text-xs font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:border-[#5271FF]/50 hover:bg-slate-50 hover:text-[#4A6CF7] focus:outline-none focus:ring-2 focus:ring-[#5271FF]/40 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/90 dark:text-white dark:hover:border-[#5271FF]/60 dark:hover:bg-slate-800"
                    >
                      <GoogleIcon />
                      <span className="hidden sm:inline">
                        {workspace.signingIn
                          ? "Opening Google…"
                          : "Sign in with Google"}
                      </span>
                      <span className="sm:hidden">
                        {workspace.signingIn ? "Signing in…" : "Sign in"}
                      </span>
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={navbarToggleHandler}
                id="navbarToggler"
                aria-label="Mobile Menu"
                className="group block transform rounded-xl px-3 py-2 ring-[#5271FF]/50 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-gray-100 focus:ring-2 dark:hover:bg-gray-800 xl:hidden"
              >
                <div className="relative flex h-6 w-6 flex-col items-center justify-center">
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-in-out dark:bg-gray-300 ${
                      navbarOpen
                        ? "rotate-45 bg-[#5271FF]"
                        : "-translate-y-1.5 group-hover:bg-[#5271FF]"
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-in-out dark:bg-gray-300 ${
                      navbarOpen
                        ? "opacity-0"
                        : "opacity-100 group-hover:bg-[#5271FF]"
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-in-out dark:bg-gray-300 ${
                      navbarOpen
                        ? "-rotate-45 bg-[#5271FF]"
                        : "translate-y-1.5 group-hover:bg-[#5271FF]"
                    }`}
                  />
                </div>
              </button>
            </div>

            <div
              className={` absolute right-4 top-full z-30 max-h-[80vh] w-[290px] origin-top-right transform overflow-y-auto rounded-2xl border border-gray-200/50 bg-white/95 px-5 py-5 shadow-2xl backdrop-blur-xl duration-300 dark:border-gray-700/50 dark:bg-gray-900/95 xl:hidden ${
                navbarOpen
                  ? "visible translate-y-2 scale-100 opacity-100"
                  : "invisible -translate-y-2 scale-95 opacity-0"
              }`}
            >
              <nav>
                <ul className="block space-y-1.5">
                  {menuData.map((menuItem, index) => {
                    const active = isMenuActive(menuItem.path);
                    return (
                      <li key={index} className="group relative font-semibold">
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            prefetch={true}
                            onClick={() => setNavbarOpen(false)}
                            className={`
                              relative flex items-center justify-center rounded-xl border border-transparent p-3 transition-all duration-300 ease-in-out
                              ${
                                active
                                  ? "bg-gradient-to-r from-[#5271FF] to-[#4361EE] text-white shadow-lg shadow-[#5271FF]/30"
                                  : "text-gray-700 transition-colors duration-300 hover:bg-gray-100/70 hover:text-[#5271FF] dark:text-gray-300 dark:hover:bg-gray-800/70 dark:hover:text-[#5271FF]"
                              }
                            `}
                          >
                            <span className="relative z-10">
                              {menuItem.title}
                            </span>
                            <div
                              className={`absolute bottom-0 h-0.5 w-0 rounded-full bg-current transition-all duration-300 ease-in-out ${
                                !active ? "group-hover:w-full" : ""
                              }`}
                            ></div>
                          </Link>
                        ) : (
                          <>
                            <p
                              onClick={() => handleSubmenu(index)}
                              className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-base text-gray-700 transition-all duration-300 hover:bg-gray-50 hover:text-[#5271FF] dark:text-gray-300 dark:hover:bg-gray-800/50 dark:hover:text-[#5271FF]"
                            >
                              <span>{menuItem.title}</span>
                              <span
                                className={`transform pl-3 transition-transform duration-300 ${
                                  openIndex === index ? "rotate-180" : ""
                                }`}
                              >
                                <svg width="20" height="20" viewBox="0 0 25 24">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </p>
                            <div
                              className={`submenu relative mt-2 overflow-y-auto rounded-xl border-l-2 border-[#5271FF]/20 bg-gray-50/80 backdrop-blur-sm transition-all duration-300 dark:bg-gray-800/50 ${
                                openIndex === index
                                  ? "block max-h-96 opacity-100"
                                  : "hidden max-h-0 opacity-0"
                              }`}
                            >
                              {menuItem.submenu?.map(
                                (submenuItem, submenuIndex) => (
                                  <Link
                                    href={submenuItem.path}
                                    key={submenuIndex}
                                    prefetch={true}
                                    onClick={() => setNavbarOpen(false)}
                                    className="block border-l-2 border-transparent py-3 pl-6 pr-4 text-sm text-gray-700 transition-all duration-200 ease-in-out hover:border-[#5271FF]/50 hover:text-[#5271FF] dark:text-gray-300 dark:hover:text-[#5271FF]"
                                  >
                                    <span className="flex items-center">
                                      <span className="mr-3 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#5271FF] to-[#4361EE]"></span>
                                      {submenuItem.title}
                                    </span>
                                  </Link>
                                ),
                              )}
                            </div>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {workspace && (
                  <div className="mt-4 border-t border-slate-200/70 pt-4 dark:border-slate-700/70">
                    <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Quick Tool Views
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleWorkspaceJump("saved")}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#5271FF]/40 hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                      >
                        <Bookmark size={14} className="text-[#5271FF]" />
                        Saved ({workspace.saved.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWorkspaceJump("recent")}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#5271FF]/40 hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-200"
                      >
                        <Clock size={14} className="text-[#5271FF]" />
                        Recent ({workspace.recent.length})
                      </button>
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>
      <style jsx>{`
        @keyframes ping-star {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }

        html {
          scroll-behavior: smooth;
        }

        @supports not (backdrop-filter: blur(12px)) {
          .backdrop-blur-xl {
            background-color: rgba(255, 255, 255, 0.95);
          }
          .dark .backdrop-blur-xl {
            background-color: rgba(17, 24, 39, 0.95);
          }
        }
      `}</style>
    </>
  );
};

export default Header;

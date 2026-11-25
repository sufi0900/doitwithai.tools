"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Globe, Lock, Sparkles } from "lucide-react";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import { safeReturnPath } from "@/features/tools-workspace/supabase";
import { saveStudioStateOptimistic } from "@/lib/studio/store";

export default function AuthPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspace = useWorkspace();
  const [startingGuest, setStartingGuest] = useState(false);

  const requestedNext = searchParams.get("next") || "/studio/onboarding";
  const nextPath = safeReturnPath(requestedNext);

  const handleGoogleSignIn = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("tools:return", nextPath);
    }
    workspace?.signIn();
  };

  const handleGuestPreviewPass = () => {
    setStartingGuest(true);
    saveStudioStateOptimistic((prev) => ({
      ...prev,
      guestPassActive: true,
    }));
    router.push(nextPath);
  };

  if (workspace?.user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-[#0F172A]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 size={14} />
            Signed In
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome back, {workspace.user.email || "Creator"}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Your DIY SEO, Content Writer &amp; Website Builder workspace is ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={nextPath}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5271FF] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#4361EE]"
            >
              <span>Continue to Studio</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/studio/onboarding"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-[#5271FF] dark:border-slate-700 dark:text-slate-200"
            >
              Connect or Build a Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-slate-50 px-4 py-16 dark:bg-[#080E1E]">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200/90 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#5271FF]/30 bg-[#5271FF]/10 px-3 py-1 text-xs font-bold text-[#5271FF] dark:text-[#9aabff]">
          <Lock size={12} />
          <span>DoItWithAI Studio · DIY Workspace</span>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Sign in to your DIY SEO &amp; Content Studio
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Connect your website for a 1-click SEO snapshot, save keyword backlogs,
          draft full articles with Infographic Studio V5, and manage isolated
          Tool/Blog websites.
        </p>

        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={workspace?.signingIn}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#5271FF] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5271FF]/25 transition hover:bg-[#4361EE] disabled:opacity-60"
          >
            <Globe size={16} />
            <span>
              {workspace?.signingIn
                ? "Opening Google Sign-In…"
                : "Continue with Google"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleGuestPreviewPass}
            disabled={startingGuest}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300"
          >
            <Sparkles size={16} />
            <span>
              {startingGuest
                ? "Unlocking Studio…"
                : "Instant Preview Pass (60s Onboarding Demo)"}
            </span>
            <ArrowRight size={15} />
          </button>
        </div>

        <ul className="mt-6 space-y-2 border-t border-slate-200/80 pt-5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
            <span>Path A: Connect an existing URL &amp; run a combined site snapshot</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
            <span>Path B: Launch a new AI Tool or Blog site on an isolated subdomain</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
            <span>100% manual editorial control — zero unwanted auto-posting</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

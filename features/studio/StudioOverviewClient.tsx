"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, Plus } from "lucide-react";
import { loadStudioState } from "@/lib/studio/store";

export default function StudioOverviewClient() {
  const state = loadStudioState();
  const activeSite =
    state.sites.find((s) => s.id === state.activeSiteId) || state.sites[0];

  if (!activeSite) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-8 text-center">
        <h1 className="text-2xl font-extrabold text-white">
          Welcome to DoItWithAI Studio
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          Connect an existing website for a 1-click SEO snapshot (Path A) or
          launch a new AI Tool/Blog website on an isolated subdomain (Path B).
        </p>
        <Link
          href="/studio/onboarding"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#5271FF] px-6 py-3 text-sm font-bold text-white"
        >
          <Plus size={15} />
          <span>Start 60-Second Onboarding</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
            <CheckCircle2 size={14} />
            Connected Site Active
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-white">
            {activeSite.name}
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
            <Globe size={13} />
            <span>{activeSite.url}</span>
          </p>
        </div>
        <Link
          href="/studio/writer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#5271FF] px-4 py-2.5 text-xs font-bold text-white"
        >
          <span>Open Flagship Writer</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

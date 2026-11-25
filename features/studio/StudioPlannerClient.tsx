"use client";

import React from "react";
import Link from "next/link";

export default function StudioPlannerClient() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6">
      <h1 className="text-xl font-extrabold text-white">
        Manual Editorial Planner &amp; Pro Prompt Vault
      </h1>
      <p className="mt-1 text-sm text-slate-300">
        Plan due dates manually with zero unwanted auto-posting and browse{" "}
        <Link href="/prompts" className="text-[#9aabff] underline">
          650+ SEO Prompts
        </Link>
        .
      </p>
    </div>
  );
}

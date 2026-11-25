"use client";

import React from "react";
import Link from "next/link";

export default function StudioKeywordsClient() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6">
      <h1 className="text-xl font-extrabold text-white">
        Brand Keyword Ideas &amp; Saved Backlog
      </h1>
      <p className="mt-1 text-sm text-slate-300">
        Connect a site in{" "}
        <Link href="/studio/onboarding" className="text-[#9aabff] underline">
          2-Path Onboarding
        </Link>{" "}
        to generate and manage clustered keyword ideas.
      </p>
    </div>
  );
}

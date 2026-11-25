"use client";

import React from "react";
import Link from "next/link";

export default function StudioWebsiteBuilderClient() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6">
      <h1 className="text-xl font-extrabold text-white">
        AI Tool &amp; Blog Website Builder
      </h1>
      <p className="mt-1 text-sm text-slate-300">
        Manage isolated subdomain projects or{" "}
        <Link href="/ai-website-builder/start" className="text-cyan-300 underline">
          launch a new site
        </Link>
        .
      </p>
    </div>
  );
}

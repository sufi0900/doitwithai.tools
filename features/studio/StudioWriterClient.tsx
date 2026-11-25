"use client";

import React from "react";
import Link from "next/link";

export default function StudioWriterClient() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0F172A] p-6">
      <h1 className="text-xl font-extrabold text-white">
        Flagship Manual AI Content Writer
      </h1>
      <p className="mt-1 text-sm text-slate-300">
        Connected studio writer shell ready.{" "}
        <Link href="/ai-content-writer" className="text-[#9aabff] underline">
          Full standalone writer
        </Link>
      </p>
    </div>
  );
}

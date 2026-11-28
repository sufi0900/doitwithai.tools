import React, { Suspense } from "react";
import StudioEmailClient from "@/features/studio/StudioEmailClient";

export default function StudioEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0D1526]" />
      }
    >
      <StudioEmailClient />
    </Suspense>
  );
}

import React, { Suspense } from "react";
import StudioSocialClient from "@/features/studio/StudioSocialClient";

export default function StudioSocialPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0D1526]" />
      }
    >
      <StudioSocialClient />
    </Suspense>
  );
}

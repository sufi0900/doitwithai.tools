import { Suspense } from "react";
import StudioOnPageClient from "@/features/studio/StudioOnPageClient";

export default function StudioOnPageSeoPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-900/70" />
      }
    >
      <StudioOnPageClient />
    </Suspense>
  );
}

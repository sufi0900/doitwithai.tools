import type { Metadata } from "next";
import { Suspense } from "react";
import AuthPageClient from "@/features/studio/AuthPageClient";

export const metadata: Metadata = {
  title: "Sign In to Studio | DoItWithAI.tools",
  description:
    "Access your unified DIY AI SEO, Content Writer, Keyword Backlog, and Tool/Blog Website Builder Studio.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm font-semibold text-slate-500">
          Loading sign-in…
        </div>
      }
    >
      <AuthPageClient />
    </Suspense>
  );
}

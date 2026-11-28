import type { Metadata } from "next";
import type { ReactNode } from "react";
import StudioShell from "@/features/studio/StudioShell";
import styles from "@/features/studio/studio-shell.module.css";

export const metadata: Metadata = {
  title: "DoItWithAI Studio — DIY SEO, Content Writer & Website Builder",
  description:
    "Unified manual DIY workspace for site audit snapshots, saved keyword backlogs, Flagship AI Content Writer, AI Tool/Blog Website Builder, and editorial planning.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.viewport}>
      <StudioShell>{children}</StudioShell>
    </div>
  );
}

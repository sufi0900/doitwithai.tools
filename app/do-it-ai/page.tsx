import type { Metadata } from "next";
import { Suspense } from "react";
import DoItAiDashboardClient from "@/features/do-it-ai/DoItAiDashboardClient";

const pageUrl = "https://doitwithai.tools/do-it-ai";
const title =
  "Do It AI — Unified AI SEO, Content & Tool Builder Workspace | Do It With AI";
const description =
  "Don't just chat with AI—Do It With AI. Run 90+ specialized SEO, content, and visual tools in one unified dashboard, query our knowledge base, and download portable HTML/React tool code.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://doitwithai.tools/ogimage.png"],
  },
};

export default function DoItAiPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Do It AI — Unified Tool & Knowledge Workspace",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Do It AI", item: pageUrl },
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
      },
    ],
  };

  return (
    <div className="h-full w-full overflow-hidden bg-[#060B19] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-[#060B19] text-sm font-bold text-slate-300">
            Loading Do It AI Workspace...
          </div>
        }
      >
        <DoItAiDashboardClient />
      </Suspense>
    </div>
  );
}

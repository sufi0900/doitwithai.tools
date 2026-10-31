"use client";

import { useState } from "react";
import {
  TrendingUp,
  Speed,
  Shield,
  AutoAwesome,
  Verified,
  OpenInNew,
  ExpandMore,
  ExpandLess,
  InfoOutlined,
} from "@mui/icons-material";

const PILLAR_META = {
  L: { name: "Long-Term Logic", icon: TrendingUp },
  IO: { name: "Internal Optimization", icon: Speed },
  N: { name: "Non-Negotiable Integrity", icon: Shield },
  XE: { name: "eXceptional Distinction", icon: AutoAwesome },
};
const PILLAR_ORDER = ["L", "IO", "N", "XE"];

const VERDICT_STYLES = {
  Strong: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Mixed: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
  Weak: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
};

const OVERALL_STYLES = {
  "Significant Gaps": "bg-red-500",
  "Mixed Results": "bg-amber-500",
  "Solid Performer": "bg-blue-500",
  "Strong Choice": "bg-emerald-500",
  "Exceptional Choice": "bg-[#004DFD]",
};

export default function ReviewLionxeHeader({ data }) {
  const [open, setOpen] = useState(true);
  const lens = data?.reviewLionxeLens;
  const affiliate = data?.affiliateBlock;

  // Legacy aitool articles published before this schema existed just won't
  // have `reviewLionxeLens` filled in — render nothing, degrade gracefully.
  if (!lens?.overallVerdict || !Array.isArray(lens.pillars) || lens.pillars.length < 4) {
    return null;
  }

  const sortedPillars = PILLAR_ORDER.map((code) => lens.pillars.find((p) => p.pillarCode === code)).filter(Boolean);
  const auditHref = lens.linkedAuditUrl?.trim() || "https://lionxe.com/framework";
  const overallBg = OVERALL_STYLES[lens.overallVerdict] || "bg-blue-500";

  return (
    <div className="w-full">
      {/* LIONXE Lens Strip */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#004DFD]/25 bg-gradient-to-br from-[#004DFD]/[0.06] to-transparent dark:border-[#004DFD]/20 dark:from-[#004DFD]/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#004DFD]/15 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004DFD]">
              <Verified className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-black uppercase tracking-wider text-[#004DFD]">
              Reviewed Through the LIONXE&reg; Lens
            </span>
          </div>
          <span className={`rounded-full px-4 py-1.5 text-sm font-bold text-white ${overallBg}`}>
            {lens.overallVerdict}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-6 py-3 text-left transition-colors hover:bg-[#004DFD]/[0.03]"
        >
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">See the four-pillar breakdown</span>
          {open ? <ExpandLess className="h-5 w-5 text-[#004DFD]" /> : <ExpandMore className="h-5 w-5 text-[#004DFD]" />}
        </button>

        {open && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sortedPillars.map((pillar) => {
                const meta = PILLAR_META[pillar.pillarCode];
                const Icon = meta?.icon;
                const style = VERDICT_STYLES[pillar.verdict] || VERDICT_STYLES.Mixed;
                return (
                  <div key={pillar.pillarCode} className={`rounded-xl border p-4 ${style}`}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />}
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                          {pillar.pillarCode} — {meta?.name}
                        </span>
                      </div>
                      <span className="text-xs font-black">{pillar.verdict}</span>
                    </div>
                    <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">{pillar.note}</p>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-gray-500 dark:text-gray-500">
              <InfoOutlined className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This is an editorial review evaluated through the LIONXE&reg; four-pillar lens. It is not a scored
                LIONXE&reg; audit or certification.{" "}
                <a
                  href={auditHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#004DFD] underline-offset-2 hover:underline"
                >
                  Explore the LIONXE&reg; Framework
                </a>
                .
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Affiliate CTA — structurally separate from the LIONXE link above */}
      {affiliate?.affiliateUrl && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-gray-500 dark:text-gray-500">
            {affiliate.hasAffiliateDisclosure !== false && (
              <>This review contains an affiliate link. We may earn a commission if you sign up through it, at no extra cost to you. </>
            )}
            Our LIONXE&reg; lens verdicts above are independent of this relationship.
          </p>
          <a
            href={affiliate.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#5271FF] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            Try {affiliate.toolName || "This Tool"}
            <OpenInNew className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
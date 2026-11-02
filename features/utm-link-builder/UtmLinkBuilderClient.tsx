"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Link2,
  QrCode,
} from "lucide-react";
import {
  buildUtmTrackingPack,
  DEFAULT_UTM_INPUT,
  UTM_CHANNEL_PRESETS,
  type UtmBuilderInput,
} from "./model";

export default function UtmLinkBuilderClient() {
  const [input, setInput] = useState<UtmBuilderInput>(DEFAULT_UTM_INPUT);
  const [toast, setToast] = useState("");

  const result = useMemo(() => buildUtmTrackingPack(input), [input]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof UtmBuilderInput>(
    key: K,
    val: UtmBuilderInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  function downloadCsvMatrix() {
    const blob = new Blob([result.csvExportString], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "utm-campaign-links-matrix.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded 6-Channel UTM Campaign Matrix (.CSV)!");
  }

  function downloadQrSvg() {
    const blob = new Blob([result.qrSvgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "utm-campaign-qr.svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded UTM Campaign QR Code (.SVG)!");
  }

  return (
    <section
      aria-label="UTM Campaign Link Builder and QR Studio Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      {/* Channel Presets Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-[#111827]">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
            1-Click GA4-Compliant Channel Presets
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Load standard UTM parameters that map cleanly into Google Analytics
            4 Default Channel Groupings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {UTM_CHANNEL_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setInput((prev) => ({
                  ...prev,
                  utmSource: p.utmSource,
                  utmMedium: p.utmMedium,
                  utmCampaign: p.utmCampaign,
                  utmContent: p.utmContent,
                }));
                notify(`Loaded "${p.label}" UTM preset.`);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        {/* LEFT COLUMN: UTM PARAMETER BUILDER & BULK 6-CHANNEL MATRIX */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Link2 size={19} className="text-[#5271ff]" />
                1. Campaign URL &amp; UTM Parameters
              </h2>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={input.forceLowercase}
                  onChange={(e) =>
                    updateField("forceLowercase", e.target.checked)
                  }
                  className="h-4 w-4 accent-[#3452d1]"
                />
                Force lowercase &amp; snake_case
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Destination Webpage URL *
                </label>
                <input
                  type="url"
                  value={input.destinationUrl}
                  onChange={(e) =>
                    updateField("destinationUrl", e.target.value)
                  }
                  placeholder="https://doitwithai.tools/tools"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Campaign Source (<code>utm_source</code>) *
                </label>
                <input
                  type="text"
                  value={input.utmSource}
                  onChange={(e) => updateField("utmSource", e.target.value)}
                  placeholder="linkedin, youtube, newsletter, google"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Campaign Medium (<code>utm_medium</code>) *
                </label>
                <input
                  type="text"
                  value={input.utmMedium}
                  onChange={(e) => updateField("utmMedium", e.target.value)}
                  placeholder="social, email, cpc, video, organic"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Campaign Name (<code>utm_campaign</code>) *
                </label>
                <input
                  type="text"
                  value={input.utmCampaign}
                  onChange={(e) => updateField("utmCampaign", e.target.value)}
                  placeholder="spring_launch_2026"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Campaign Content (<code>utm_content</code>)
                </label>
                <input
                  type="text"
                  value={input.utmContent}
                  onChange={(e) => updateField("utmContent", e.target.value)}
                  placeholder="bio_link, hero_button, slide_8"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Bulk 6-Channel Campaign Matrix */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold">
                  2. Instant 6-Channel Campaign Link Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Pre-built tracking links for your entire multi-channel launch.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadCsvMatrix}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#2842b5]"
              >
                <Download size={14} />
                Export All 6 Links (.CSV)
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {result.bulkMatrixRows.map((row) => (
                <div
                  key={row.channelName}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <strong className="font-bold text-slate-900 dark:text-white">
                        {row.channelName}
                      </strong>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                        GA4: {row.ga4Bucket}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(row.fullUrl);
                        notify(`Copied ${row.channelName} UTM link!`);
                      }}
                      className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-800"
                    >
                      <Copy size={11} /> Copy
                    </button>
                  </div>
                  <p className="mt-1.5 font-mono text-[11px] break-all text-[#3452d1] dark:text-[#9aabff]">
                    {row.fullUrl}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GENERATED URL, GA4 AUDIT & QR CODE */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-[#0D1322] p-5 text-white shadow-xl sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                Generated Campaign Tracking URL
              </span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-extrabold text-emerald-300">
                GA4 Bucket: {result.predictedGa4Channel}
              </span>
            </div>

            <p className="mt-3 rounded-xl border border-slate-800 bg-[#141C2E] p-3.5 font-mono text-xs break-all leading-6 text-emerald-300">
              {result.finalTrackedUrl}
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(result.finalTrackedUrl);
                  notify("Copied tracked UTM URL to clipboard!");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3b63fb] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#294fe0]"
              >
                <Copy size={14} />
                Copy Tracked URL
              </button>
              <button
                type="button"
                onClick={downloadQrSvg}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-[#5271ff]"
              >
                <QrCode size={14} />
                Download QR Code (.SVG)
              </button>
            </div>
          </div>

          {/* GA4 Attribution Hygiene Checks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              GA4 Attribution Hygiene Checks
            </h3>
            <div className="mt-3.5 space-y-2.5">
              {result.checks.map((chk) => (
                <div
                  key={chk.label}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  {chk.passed ? (
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                  ) : (
                    <AlertTriangle
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />
                  )}
                  <div>
                    <strong className="block font-bold text-slate-900 dark:text-white">
                      {chk.label}
                    </strong>
                    <span className="text-slate-600 dark:text-slate-300">
                      {chk.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign QR Code Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs dark:border-slate-800 dark:bg-[#111827]">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
              Offline &amp; Slide Deck QR Code
            </span>
            <div className="mx-auto my-3 flex w-fit flex-col items-center rounded-2xl border border-slate-200 bg-white p-3">
              <div
                className="h-40 w-40 [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: result.qrSvgMarkup }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Scans directly to your UTM-tagged URL so offline flyers, conference
              slides, and packaging attribute scans in GA4.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

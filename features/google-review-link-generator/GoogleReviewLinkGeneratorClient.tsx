"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  MessageSquare,
  Printer,
  QrCode,
  Sparkles,
  Star,
} from "lucide-react";
import {
  DEFAULT_REVIEW_LINK_INPUT,
  generateReviewLinkPack,
  type ReviewLinkInput,
} from "./model";

const SAMPLE_PRESETS: Array<{ label: string; data: ReviewLinkInput }> = [
  {
    label: "1. Dental & Medical Clinic",
    data: DEFAULT_REVIEW_LINK_INPUT,
  },
  {
    label: "2. Local HVAC & Plumbing Service",
    data: {
      businessName: "Summit Air & Heating Pros",
      cityOrBranch: "Denver, CO",
      placeIdOrMapsUrl: "ChIJzxcfI6qAa4cR1jaKJ_j0jhE",
      customerName: "Michael",
      serviceProvided: "AC tune-up and smart thermostat installation",
      senderName: "Dave & the Summit HVAC Crew",
      posterHeadline: "Happy With Your Service Today?",
      posterSubheadline:
        "Scan this QR code with your phone camera to leave a quick Google review for your technician!",
      brandAccentHex: "#0d9488",
    },
  },
  {
    label: "3. Restaurant & Cafe",
    data: {
      businessName: "Olive & Ember Wood-Fired Kitchen",
      cityOrBranch: "Chicago, IL",
      placeIdOrMapsUrl: "ChIJ7cv00DwsDogRAMDACa2m4K8",
      customerName: "Elena",
      serviceProvided: "dinner reservation and tasting menu",
      senderName: "Chef Marco & Team",
      posterHeadline: "Enjoyed Your Meal With Us?",
      posterSubheadline:
        "Scan to share a 30-second review on Google and let us know what dish was your favorite!",
      brandAccentHex: "#1e3a8a",
    },
  },
];

export default function GoogleReviewLinkGeneratorClient() {
  const [input, setInput] = useState<ReviewLinkInput>(
    DEFAULT_REVIEW_LINK_INPUT,
  );
  const [activeTemplateId, setActiveTemplateId] = useState<
    "sms" | "whatsapp" | "email" | "receipt"
  >("whatsapp");
  const [toast, setToast] = useState("");

  const result = useMemo(() => generateReviewLinkPack(input), [input]);
  const activeTemplate =
    result.templates.find((t) => t.id === activeTemplateId) ||
    result.templates[0];

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof ReviewLinkInput>(
    key: K,
    val: ReviewLinkInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  function downloadQrSvg() {
    const blob = new Blob([result.qrSvgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(input.businessName || "business").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-google-review-qr.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded vector QR Code (.SVG)!");
  }

  function printReviewPoster() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${input.businessName} — Google Review Poster</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 36px; background: #f8fafc; color: #0f172a; text-align: center; }
    .poster { max-width: 540px; margin: 0 auto; background: #ffffff; border: 3px solid ${input.brandAccentHex || "#3452d1"}; border-radius: 28px; padding: 42px 36px; box-shadow: 0 20px 50px rgba(15,23,42,0.08); }
    .stars { font-size: 36px; color: #f59e0b; letter-spacing: 6px; margin-bottom: 12px; }
    h1 { font-size: 32px; font-weight: 900; margin: 8px 0 12px; color: #0f172a; }
    p.sub { font-size: 16px; line-height: 1.6; color: #334155; margin: 0 auto 28px; max-width: 440px; }
    .qr-box { display: inline-block; padding: 18px; border-radius: 22px; border: 2px dashed #cbd5e1; background: #f8fafc; }
    .qr-box svg { width: 220px; height: 220px; display: block; }
    .biz { margin-top: 24px; font-size: 20px; font-weight: 800; color: #0f172a; }
    .loc { font-size: 14px; font-weight: 600; color: #64748b; margin-top: 4px; }
    .url { margin-top: 16px; font-family: monospace; font-size: 12px; color: #475569; word-break: break-all; }
    @media print { body { background: #fff; padding: 0; } .poster { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="poster">
    <div class="stars">★★★★★</div>
    <h1>${input.posterHeadline}</h1>
    <p class="sub">${input.posterSubheadline}</p>
    <div class="qr-box">${result.qrSvgMarkup}</div>
    <div class="biz">${input.businessName}</div>
    <div class="loc">${input.cityOrBranch}</div>
    <div class="url">${result.directWriteReviewUrl}</div>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`);
    w.document.close();
  }

  return (
    <section
      aria-label="Google Review Link and QR Code Generator Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      {/* Preset Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-[#111827]">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
            Quick Industry Presets
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Load a sample local business or enter your own Google Place ID /
            business details below.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setInput(preset.data);
                notify(`Loaded "${preset.label}" preset.`);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:border-[#5271ff] hover:text-[#3452d1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {preset.label}
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
        {/* LEFT COLUMN: INPUT FORM & MULTI-CHANNEL TEMPLATES */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h2 className="text-lg font-extrabold">
              1. Business &amp; Google Place ID Details
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Paste your Google Place ID (starts with <code>ChIJ...</code>) or a
              Google Maps URL containing <code>place_id=</code> for a direct
              1-click review pop-up link.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Business Name
                </label>
                <input
                  type="text"
                  value={input.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  placeholder="e.g. Apex Dental Studio"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  City, Neighborhood or Branch
                </label>
                <input
                  type="text"
                  value={input.cityOrBranch}
                  onChange={(e) => updateField("cityOrBranch", e.target.value)}
                  placeholder="e.g. Austin, TX"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Google Place ID or Google Maps URL
                  </label>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                      result.isDirectPlaceId
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {result.isDirectPlaceId
                      ? `✓ Place ID Detected (${result.extractedPlaceId.slice(0, 14)}…)`
                      : "Using Business Name Search Fallback"}
                  </span>
                </div>
                <input
                  type="text"
                  value={input.placeIdOrMapsUrl}
                  onChange={(e) =>
                    updateField("placeIdOrMapsUrl", e.target.value)
                  }
                  placeholder="ChIJLwPMoJm1RIYRetVp1EtGm10 or Google Maps URL"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Customer First Name (For Templates)
                </label>
                <input
                  type="text"
                  value={input.customerName}
                  onChange={(e) => updateField("customerName", e.target.value)}
                  placeholder="e.g. Sarah"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Service or Product Provided
                </label>
                <input
                  type="text"
                  value={input.serviceProvided}
                  onChange={(e) =>
                    updateField("serviceProvided", e.target.value)
                  }
                  placeholder="e.g. dental cleaning"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Poster Headline
                </label>
                <input
                  type="text"
                  value={input.posterHeadline}
                  onChange={(e) =>
                    updateField("posterHeadline", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Sender Sign-Off
                </label>
                <input
                  type="text"
                  value={input.senderName}
                  onChange={(e) => updateField("senderName", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Generated Direct Links Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-extrabold">
                2. Direct Google Review Links
              </h3>
              <span className="rounded-full bg-[#3452d1]/10 px-3 py-1 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                Readiness Score: {result.completenessScore}/100
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    ★ Direct &ldquo;Write a Review&rdquo; Pop-Up Link
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          result.directWriteReviewUrl,
                        );
                        notify("Copied direct Google review link!");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#3452d1] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#2842b5]"
                    >
                      <Copy size={13} />
                      Copy Review Link
                    </button>
                    <a
                      href={result.directWriteReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      Test <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                <p className="mt-2 font-mono text-xs break-all text-slate-700 dark:text-slate-200">
                  {result.directWriteReviewUrl}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    View All Existing Google Reviews Link
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        result.viewAllReviewsUrl,
                      );
                      notify("Copied View All Reviews link!");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <p className="mt-1.5 font-mono text-xs break-all text-slate-600 dark:text-slate-300">
                  {result.viewAllReviewsUrl}
                </p>
              </div>
            </div>
          </div>

          {/* Multi-Channel Review Request Templates */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-extrabold">
                <MessageSquare size={18} className="text-[#5271ff]" />
                3. High-Converting Review Request Templates
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {result.templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTemplateId(t.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase transition ${
                      activeTemplateId === t.id
                        ? "bg-[#3452d1] text-white"
                        : "border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {t.id}
                  </button>
                ))}
              </div>
            </div>

            {activeTemplate.subject && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="font-bold text-slate-500">Subject Line: </span>
                <strong className="text-slate-900 dark:text-white">
                  {activeTemplate.subject}
                </strong>
              </div>
            )}

            <textarea
              rows={6}
              readOnly
              value={activeTemplate.body}
              className="mt-3 w-full rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-xs leading-6 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activeTemplate.charCount} chars · {activeTemplate.tip}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(activeTemplate.body);
                  notify(`Copied ${activeTemplate.channel} template!`);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-bold text-white hover:bg-[#2842b5]"
              >
                <Copy size={14} />
                Copy {activeTemplate.id.toUpperCase()} Message
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE QR CODE & PRINTABLE COUNTER POSTER CARD */}
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-[#3452d1]/40 bg-gradient-to-b from-white to-slate-50 p-6 text-center shadow-xl dark:from-[#151E32] dark:to-[#0F172A]">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-extrabold text-amber-600 dark:text-amber-300">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="ml-1">Printable Counter &amp; Table Poster</span>
            </div>

            <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
              {input.posterHeadline}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-600 dark:text-slate-300">
              {input.posterSubheadline}
            </p>

            {/* QR Code Preview Frame */}
            <div className="mx-auto my-6 flex w-fit flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4 shadow-md dark:border-slate-700">
              <div
                className="h-52 w-52 [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: result.qrSvgMarkup }}
              />
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                <QrCode size={13} className="text-[#3452d1]" />
                Scan With Phone Camera
              </span>
            </div>

            <div className="text-base font-black text-slate-900 dark:text-white">
              {input.businessName}
            </div>
            {input.cityOrBranch && (
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {input.cityOrBranch}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={downloadQrSvg}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3452d1] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
              >
                <Download size={15} />
                Download QR Code (.SVG)
              </button>
              <button
                type="button"
                onClick={printReviewPoster}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-800 hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <Printer size={15} />
                Print Counter Poster / Save PDF
              </button>
            </div>
          </div>

          {/* Local SEO Tip Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
            <h4 className="flex items-center gap-2 text-sm font-extrabold">
              <Sparkles size={16} className="text-[#5271ff]" />
              How to Find Your Exact Google Place ID in 15 Seconds
            </h4>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              <li>
                Search your business name on Google and click the{" "}
                <strong>&ldquo;Ask for reviews&rdquo;</strong> icon inside your
                Google Business Profile dashboard.
              </li>
              <li>
                Or paste any Google Maps link containing{" "}
                <code>query_place_id=ChIJ...</code> into the input box above—our
                parser automatically extracts the <code>ChIJ...</code> identifier.
              </li>
              <li>
                Print the poster above for your reception desk or add the SVG QR
                code to customer invoices to double review velocity.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

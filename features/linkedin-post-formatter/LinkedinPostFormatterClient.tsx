"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Eye,
  Smartphone,
  Monitor,
  Sparkles,
  Type,
} from "lucide-react";
import {
  analyzeLinkedinPost,
  applyUnicodeStyle,
  LINKEDIN_HOOK_TEMPLATES,
  type UnicodeStyleId,
} from "./model";

export default function LinkedinPostFormatterClient() {
  const [postText, setPostText] = useState<string>(
    LINKEDIN_HOOK_TEMPLATES[0].template,
  );
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">(
    "mobile",
  );
  const [expandedInPreview, setExpandedInPreview] = useState(false);
  const [toast, setToast] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const analysis = useMemo(() => analyzeLinkedinPost(postText), [postText]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function formatSelection(style: UnicodeStyleId) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start === end) {
      // Format the first line if no text is selected
      const lines = postText.split("\n");
      lines[0] = applyUnicodeStyle(lines[0], style);
      setPostText(lines.join("\n"));
      notify("Formatted opening hook line! (Highlight any words to style selection)");
      return;
    }

    const selected = postText.slice(start, end);
    const converted = applyUnicodeStyle(selected, style);
    const updated =
      postText.slice(0, start) + converted + postText.slice(end);
    setPostText(updated);
    notify("Applied Unicode formatting to selected text!");
  }

  function insertBulletSymbol(symbol: string) {
    const el = textareaRef.current;
    if (!el) {
      setPostText((prev) => `${prev}\n${symbol} `);
      return;
    }
    const start = el.selectionStart;
    const updated =
      postText.slice(0, start) + `${symbol} ` + postText.slice(start);
    setPostText(updated);
  }

  const aboveFoldText =
    previewDevice === "mobile"
      ? analysis.mobileAboveFold
      : analysis.desktopAboveFold;
  const isTruncated =
    previewDevice === "mobile"
      ? analysis.mobileIsTruncated
      : analysis.desktopIsTruncated;

  return (
    <section
      aria-label="LinkedIn Post Formatter and Fold Previewer Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      {/* Template Preset Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-[#111827]">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
            Proven Viral LinkedIn Post Frameworks
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Load a high-retention framework or highlight any text in the editor
            below to apply Unicode bold, italic, or monospace styling.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LINKEDIN_HOOK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.label}
              type="button"
              onClick={() => {
                setPostText(tpl.template);
                setExpandedInPreview(false);
                notify(`Loaded "${tpl.label}" framework.`);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {tpl.label}
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
        {/* LEFT COLUMN: UNICODE EDITOR & TOOLBAR */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <Type size={19} className="text-[#5271ff]" />
                1. LinkedIn Post Editor &amp; Unicode Toolbar
              </h2>
              <span className="text-xs font-bold text-slate-500">
                Select words in the box, then click a style below
              </span>
            </div>

            {/* Unicode Formatting Toolbar */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
              {(
                [
                  ["boldSans", "𝗕𝗼𝗹𝗱 Sans"],
                  ["italicSans", "𝘐𝘵𝘢𝘭𝘪𝘤"],
                  ["boldItalicSans", "𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄"],
                  ["boldSerif", "𝐁𝐨𝐥𝐝 Serif"],
                  ["monospace", "𝙼𝚘𝚗𝚘"],
                  ["underline", "U̲n̲d̲e̲r̲l̲i̲n̲e̲"],
                  ["strikethrough", "S̶t̶r̶i̶k̶e̶"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => formatSelection(id)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 transition hover:border-[#3452d1] hover:bg-[#3452d1] hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {label}
                </button>
              ))}

              <span className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-700" />

              {["✅", "👉", "💡", "📌", "•", "→"].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => insertBulletSymbol(sym)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-800"
                  title={`Insert ${sym}`}
                >
                  {sym}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              rows={13}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Write or paste your LinkedIn post here..."
              className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex flex-wrap gap-3 font-semibold">
                <span>{analysis.totalChars.toLocaleString()} / 3,000 chars</span>
                <span>·</span>
                <span>{analysis.wordCount} words</span>
                <span>·</span>
                <span>~{analysis.readingTimeSeconds}s read</span>
                <span>·</span>
                <span>{analysis.hashtagCount} hashtags</span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(postText);
                  notify("Copied formatted LinkedIn post to clipboard!");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
              >
                <Copy size={14} />
                Copy Formatted Post
              </button>
            </div>
          </div>

          {/* Hook & Readability Audit Checklist */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-extrabold">
                <Sparkles size={17} className="text-[#5271ff]" />
                2. LinkedIn Algorithm &amp; Hook Scorecard
              </h3>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                Hook Score: {analysis.hookScore}/100
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {analysis.checks.map((chk) => (
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
        </div>

        {/* RIGHT COLUMN: LIVE LINKEDIN "...SEE MORE" FOLD PREVIEWER */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-extrabold">
                <Eye size={18} className="text-[#5271ff]" />
                Live &ldquo;…see more&rdquo; Fold Truncation Simulator
              </h3>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDevice("mobile");
                    setExpandedInPreview(false);
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold ${
                    previewDevice === "mobile"
                      ? "bg-[#3452d1] text-white"
                      : "border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <Smartphone size={13} />
                  Mobile (~140c)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDevice("desktop");
                    setExpandedInPreview(false);
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold ${
                    previewDevice === "desktop"
                      ? "bg-[#3452d1] text-white"
                      : "border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <Monitor size={13} />
                  Desktop (~210c)
                </button>
              </div>
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Previewing exact text visible in the LinkedIn feed before a reader
              clicks <strong>&ldquo;…see more&rdquo;</strong> (Dwell Time
              trigger).
            </p>

            {/* Simulated LinkedIn Feed Card */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-[#1B2234]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3452d1] to-sky-400 text-sm font-black text-white">
                  SM
                </div>
                <div>
                  <strong className="block text-sm font-extrabold text-slate-900 dark:text-white">
                    Sufian Mustafa · 1st
                  </strong>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Founder @ Do It With AI Tools · SEO &amp; Growth Workflows
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    1h · 🌐
                  </span>
                </div>
              </div>

              <div className="mt-3.5 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-900 dark:text-slate-100">
                {expandedInPreview || !isTruncated ? (
                  postText
                ) : (
                  <>
                    {aboveFoldText}
                    <button
                      type="button"
                      onClick={() => setExpandedInPreview(true)}
                      className="ml-1 font-bold text-slate-500 hover:text-[#3452d1] hover:underline dark:text-slate-400"
                    >
                      …see more
                    </button>
                  </>
                )}
              </div>

              {expandedInPreview && isTruncated && (
                <button
                  type="button"
                  onClick={() => setExpandedInPreview(false)}
                  className="mt-2 text-xs font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                >
                  Collapse back to &ldquo;…see more&rdquo; fold view
                </button>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <span>👍 ❤️ 💡 148</span>
                <span>42 comments · 19 reposts</span>
              </div>
            </div>

            {/* Above-the-Fold Diagnostic Box */}
            <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 text-xs">
              <strong className="block font-extrabold text-indigo-900 dark:text-indigo-200">
                Above-the-Fold Verdict ({previewDevice.toUpperCase()}):
              </strong>
              <p className="mt-1 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                &ldquo;{aboveFoldText}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

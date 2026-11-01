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
import UrlArticleExtractorBar, {
  type ExtractedImageAsset,
} from "@/features/tool-ui/UrlArticleExtractorBar";
import { SocialVisualCardBuilder } from "@/features/tool-ui/SocialVisualCardBuilder";
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
  const [extractedImages, setExtractedImages] = useState<ExtractedImageAsset[]>(
    [],
  );
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
      const lines = postText.split("\n");
      lines[0] = applyUnicodeStyle(lines[0], style);
      setPostText(lines.join("\n"));
      notify(
        "Formatted opening hook line! (Highlight any words to style selection)",
      );
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

  const firstLines = postText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section
      aria-label="LinkedIn Post Formatter and Fold Previewer Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6 space-y-6"
    >
      {/* Template Preset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-[#111827]">
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

      <UrlArticleExtractorBar
        label="Fetch Any Article URL to Auto-Draft a Formatted LinkedIn Post (+ Extract Images)"
        placeholder="Paste any article URL to extract a bold Unicode hook, sub-topics & images..."
        onExtracted={(data) => {
          const cleanTitle = (data.title || "")
            .replace(/\s*\|\s*[^|]+$/g, "")
            .trim();
          const boldHook = applyUnicodeStyle(cleanTitle, "boldSans");
          const bullets = data.keyTakeaways
            .slice(0, 4)
            .map((k) => `✅ ${k}`)
            .join("\n");
          const lead = data.paragraphs[0] || data.description || "";
          setPostText(
            `${boldHook}\n\n${lead}\n\nKey takeaways from our breakdown:\n${bullets}\n\nWhich of these steps is your #1 focus right now? 👇\n\n🌐 Full guide: ${data.url}\n\n#SEO #ContentStrategy #DigitalMarketing`,
          );
          if (data.images?.length) {
            setExtractedImages(data.images);
          }
          notify(`Drafted formatted LinkedIn post from "${cleanTitle}"!`);
        }}
        onSelectSubTopic={(sub, data) => {
          const boldHook = applyUnicodeStyle(sub.title, "boldSans");
          setPostText(
            `${boldHook}\n\n${sub.content}\n\nWhat is your experience with this step? 👇\n\n🌐 Full guide: ${data.url}\n\n#LinkedInTips #ContentMarketing #Growth`,
          );
          notify(`Switched LinkedIn post to sub-topic: "${sub.title}"!`);
        }}
      />

      {toast && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      {/* UNIFIED 2-COLUMN DASHBOARD: LEFT = TEXT EDITOR + FOLD SIMULATOR, RIGHT = CONNECTED VISUAL CARD & PACKAGE DOWNLOADER */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-start">
        {/* LEFT COLUMN: UNICODE EDITOR + "...SEE MORE" FOLD SIMULATOR + SCORECARD */}
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
              rows={12}
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

          {/* "...SEE MORE" FOLD SIMULATOR */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-extrabold">
                <Eye size={18} className="text-[#5271ff]" />
                2. &ldquo;…see more&rdquo; Fold Truncation Check
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

            <div className="mt-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 text-xs">
              <strong className="block font-extrabold text-indigo-900 dark:text-indigo-200">
                Visible Before &ldquo;…see more&rdquo; ({previewDevice.toUpperCase()}):
              </strong>
              <p className="mt-1 whitespace-pre-wrap font-sans text-xs font-semibold text-slate-800 dark:text-slate-100">
                {expandedInPreview || !isTruncated ? (
                  postText
                ) : (
                  <>
                    {aboveFoldText}
                    <button
                      type="button"
                      onClick={() => setExpandedInPreview(true)}
                      className="ml-1 font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                    >
                      …see more
                    </button>
                  </>
                )}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                <Sparkles size={15} className="text-[#5271ff]" />
                LinkedIn Algorithm Hook Score
              </span>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                {analysis.hookScore}/100
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {analysis.checks.map((chk) => (
                <div
                  key={chk.label}
                  className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-[11px] dark:border-slate-800 dark:bg-slate-900/60"
                >
                  {chk.passed ? (
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                  ) : (
                    <AlertTriangle
                      size={14}
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

        {/* RIGHT COLUMN: CONNECTED POST + IMAGE PREVIEW & PACKAGE STUDIO */}
        <div>
          <SocialVisualCardBuilder
            platformLabel="LinkedIn Post"
            defaultHeadline={firstLines[0] || "Key LinkedIn Insight"}
            defaultBody={
              firstLines.slice(1, 3).join(" ") || postText.slice(0, 180)
            }
            defaultSublabel="LINKEDIN PLAYBOOK"
            postTextToShare={postText}
            extractedImages={extractedImages}
          />
        </div>
      </div>
    </section>
  );
}

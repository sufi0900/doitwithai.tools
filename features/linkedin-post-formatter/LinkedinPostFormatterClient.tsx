"use client";

import ToolRunOverlay, { paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";

import { useMemo, useRef, useState } from "react";
import styles from "@/features/tool-ui/visual-studio.module.css";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  RotateCcw,
  Sparkles,
  Type,
} from "lucide-react";
import UrlArticleExtractorBar, {
  type ExtractedImageAsset,
} from "@/features/tool-ui/UrlArticleExtractorBar";
import { SocialVisualCardBuilder } from "@/features/tool-ui/SocialVisualCardBuilder";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";
import {
  analyzeLinkedinPost,
  applyUnicodeStyle,
  LINKEDIN_HOOK_TEMPLATES,
  type UnicodeStyleId,
} from "./model";

function stripUnicodeFormatting(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0332\u0336]/g, "");
}

export default function LinkedinPostFormatterClient() {
  const [running, setRunning] = useState(false);
  async function triggerRunFeedback() {
    setRunning(true);
    await paintToolFeedback();
    setRunning(false);
  }
  const [postText, setPostText] = useState<string>(
    LINKEDIN_HOOK_TEMPLATES[0].template,
  );
  const [extractedImages, setExtractedImages] = useState<ExtractedImageAsset[]>(
    [],
  );
  const [toast, setToast] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const analysis = useMemo(() => analyzeLinkedinPost(postText), [postText]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function formatSelection(style: UnicodeStyleId) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start === end) {
      const lines = postText.split("\n");
      lines[0] = applyUnicodeStyle(stripUnicodeFormatting(lines[0]), style);
      setPostText(lines.join("\n"));
      notify(
        "Formatted opening hook line! (Highlight any words to style selection)",
      );
      return;
    }

    const selected = postText.slice(start, end);
    const converted = applyUnicodeStyle(stripUnicodeFormatting(selected), style);
    const updated = postText.slice(0, start) + converted + postText.slice(end);
    setPostText(updated);
    notify("Applied Unicode formatting to selected text!");
  }

  function clearUnicodeSelection() {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) {
      setPostText(stripUnicodeFormatting(postText));
      notify("Reset entire post to clean plain text.");
      return;
    }
    const selected = postText.slice(start, end);
    const updated =
      postText.slice(0, start) +
      stripUnicodeFormatting(selected) +
      postText.slice(end);
    setPostText(updated);
    notify("Reset selected text to plain text.");
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

  function downloadPostTxt() {
    const blob = new Blob([postText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkedin-formatted-post.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded formatted LinkedIn post (.TXT)!");
  }

  const firstLines = postText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section
      aria-label="LinkedIn Post Formatter and Visual Feed Studio"
      className={`${styles.studio} mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6`}
    >
      <ToolRunOverlay
        active={running}
        title="Formatting LinkedIn post & see-more cutoff preview"
        description="Applying Unicode typography, hook cutoff checks, and mobile/desktop feed preview."
      />
      {/* 1-CLICK ARTICLE URL TO FORMATTED LINKEDIN POST + ATTACHED VISUAL */}
      <UrlArticleExtractorBar
        label="1-Click Article URL to Formatted LinkedIn Post + Attached Post Graphic"
        placeholder="Paste any blog URL or YouTube URL to auto-draft a formatted post & extract images..."
        onExtracted={(data) => {
          const firstSub = data.subTopics?.[0];
          const cleanTitle = (firstSub?.title || data.title || "")
            .replace(/\s*\|\s*[^|]+$/g, "")
            .trim();
          const boldHook = applyUnicodeStyle(cleanTitle, "boldSans");
          const bullets = (
            data.keyTakeaways?.length >= 3
              ? data.keyTakeaways
              : data.paragraphs || []
          )
            .slice(0, 4)
            .map((k) => `✅ ${k}`)
            .join("\n");
          const lead =
            firstSub?.summary || data.paragraphs?.[0] || data.description || "";
          setPostText(
            `${boldHook}\n\n${lead}\n\nKey takeaways from our breakdown:\n${bullets}\n\nWhich of these steps is your #1 focus right now? 👇\n\n🌐 Full guide: ${data.url}\n\n#SEO #ContentStrategy #DigitalMarketing`,
          );
          if (data.images?.length) {
            setExtractedImages(data.images);
          }
          notify(
            `Drafted formatted LinkedIn post & attached visual from "${cleanTitle}"!`,
          );
        }}
        onSelectSubTopic={(sub, data) => {
          const boldHook = applyUnicodeStyle(sub.title, "boldSans");
          setPostText(
            `${boldHook}\n\n${sub.content}\n\nWhat is your experience with this step? 👇\n\n🌐 Full guide: ${data.url}\n\n#LinkedInTips #ContentMarketing #Growth`,
          );
          notify(`Switched LinkedIn post to sub-topic: "${sub.title}"!`);
        }}
      />

      {/* CLEAN 2-PANEL STUDIO: LEFT = UNICODE POST EDITOR + HOOK SCORECARD, RIGHT = FULL-WIDTH FEED PREVIEW & ATTACHED IMAGE */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        {/* LEFT PANEL: UNICODE POST EDITOR + FRAMEWORKS + HOOK QUALITY CHECK */}
        <div className="shadow-xs space-y-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827] sm:p-6">
          {toast && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
            >
              <CheckCircle2 size={15} />
              <span>{toast}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <PlatformBrandIcon brand="linkedin" size={34} />
              <div>
                <h2 className="flex items-center gap-1.5 text-base font-extrabold text-slate-900 dark:text-white">
                  <Type size={17} className="text-[#5271ff]" />
                  1. LinkedIn Post Editor &amp; Unicode Styler
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Highlight any words below and click a Unicode button to style
                  them.
                </p>
              </div>
            </div>
          </div>

          {/* 1-Click Viral Framework Pills */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Start with a writing framework:
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LINKEDIN_HOOK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => {
                    setPostText(tpl.template);
                void triggerRunFeedback();
                    notify(`Loaded "${tpl.label}" framework.`);
                  }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 transition hover:border-[#3452d1] hover:bg-[#3452d1]/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unicode Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
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

            <button
              type="button"
              onClick={clearUnicodeSelection}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-rose-500 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              title="Strip Unicode styling back to plain text"
            >
              <RotateCcw size={12} /> Plain
            </button>

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
            className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 focus:border-[#3452d1] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex flex-wrap gap-2 font-semibold">
              <span
                className={
                  analysis.totalChars > 3000
                    ? "font-extrabold text-rose-600"
                    : ""
                }
              >
                {analysis.totalChars.toLocaleString()} / 3,000 chars
              </span>
              <span>·</span>
              <span>{analysis.wordCount} words</span>
              <span>·</span>
              <span>~{analysis.readingTimeSeconds}s read</span>
              <span>·</span>
              <span>{analysis.hashtagCount} hashtags</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadPostTxt}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#3452d1] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download size={13} /> .TXT
              </button>
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

          {/* OPEN BY DEFAULT SO LINKEDIN HOOK & READABILITY CHECKS ARE IMMEDIATELY VISIBLE */}
          <details open className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <summary className="cursor-pointer font-extrabold text-slate-900 dark:text-white">
              LinkedIn Feed Hook &amp; Readability Scorecard · {analysis.hookScore}/100
            </summary>
            <div className="mt-3 space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  <Sparkles size={15} className="text-[#4058d0]" />
                  Above-the-Fold &amp; Formatting Diagnostics
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                  {analysis.hookScore} / 100
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
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
          </details>
        </div>

        {/* RIGHT PANEL: FULL-WIDTH CONNECTED FEED PREVIEW + ATTACHED POST IMAGE STUDIO */}
        <div>
          <SocialVisualCardBuilder
            platformLabel="LinkedIn Post"
            defaultHeadline={
              stripUnicodeFormatting(firstLines[0] || "Key LinkedIn Insight")
            }
            defaultBody={stripUnicodeFormatting(
              firstLines.slice(1, 4).join("\n") || postText.slice(0, 220),
            )}
            defaultSublabel="LINKEDIN PLAYBOOK"
            postTextToShare={postText}
            extractedImages={extractedImages}
          />
        </div>
      </div>
    </section>
  );
}

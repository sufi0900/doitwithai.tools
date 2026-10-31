"use client";

import { useEffect, useState } from "react";
import {
  UrlArticleExtractorBar,
  type UniversalExtractResponse,
} from "../tool-ui/UrlArticleExtractorBar";
import type {
  CommentGoal,
  LinkedinCommentOutput,
} from "./model";

export function LinkedinCommentGeneratorClient() {
  const [postContent, setPostContent] = useState(
    "Most B2B teams don't have a content creation problem—they have a content distribution and repurposing bottleneck. You spend 6 hours writing one deep-dive guide, publish it once, share a single bare link on LinkedIn, and move on. Meanwhile, top operators slice that single guide into 5 sub-topic posts, a visual carousel, and 10 high-value comments on industry threads."
  );
  const [authorName, setAuthorName] = useState("");
  const [yourRole, setYourRole] = useState("SEO & Content Strategist");
  const [commentGoal, setCommentGoal] = useState<CommentGoal>("authority-insight");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkedinCommentOutput | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sharedText = params.get("text");
    if (sharedText && sharedText.trim()) {
      setPostContent(sharedText.trim());
    }
  }, []);

  function handleUrlExtracted(payload: UniversalExtractResponse) {
    setPostContent(payload.cleanText || payload.description || payload.title);
    if (payload.author) {
      setAuthorName(payload.author);
    }
    setError(null);
  }

  async function handleGenerate() {
    if (!postContent.trim()) {
      setError("Please paste the LinkedIn post or fetch an article URL first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai-tools/linkedin-comment-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postContent,
          authorName,
          yourRole,
          commentGoal,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate LinkedIn comments.");
      }
      setResult(data as LinkedinCommentOutput);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate comments.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-6 overflow-x-clip">
      <UrlArticleExtractorBar
        onExtracted={handleUrlExtracted}
        label="Option 1: Fetch Post or Article Content from URL (with Sub-Topic Filter)"
        placeholder="Paste a LinkedIn post URL, blog article URL, or YouTube URL..."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-start">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              LinkedIn Post &amp; Comment Strategy
            </h2>
            <span className="rounded-full bg-[#0A66C2]/10 px-2.5 py-0.5 text-xs font-bold text-[#0A66C2]">
              5 Strategic Angles
            </span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Option 2: Paste LinkedIn Post or Article Excerpt
            </label>
            <textarea
              rows={6}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Paste the LinkedIn post or article paragraph you want to reply to..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Your Role / Expertise
              </label>
              <input
                type="text"
                value={yourRole}
                onChange={(e) => setYourRole(e.target.value)}
                placeholder="e.g. SaaS Founder, SEO Strategist"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Post Author Name (Optional)
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Alex, Sarah"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              Primary Networking &amp; Visibility Goal
            </label>
            <select
              value={commentGoal}
              onChange={(e) => setCommentGoal(e.target.value as CommentGoal)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="authority-insight">Build Authority &amp; Add Framework Insight</option>
              <option value="spark-discussion">Spark Replies with a Smart Follow-Up Question</option>
              <option value="contrarian-nuance">90% Agree + 10% Nuanced Contrarian Angle</option>
              <option value="warm-networking">Supportive Peer Validation &amp; Relationship Building</option>
              <option value="subtle-expertise">Subtle Practitioner Case Study &amp; Profile Clicks</option>
            </select>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-xl bg-[#ff6b35] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#e85d2a] disabled:opacity-60"
          >
            {loading ? "Drafting 5 High-Impact LinkedIn Comments..." : "Generate 5 Strategic LinkedIn Comments"}
          </button>
        </div>

        <div className="space-y-4">
          {!result ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-[#111827]">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Ready to Generate High-Visibility LinkedIn Comments
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Click <strong>Generate 5 Strategic LinkedIn Comments</strong> to get authority add-ons, nuanced perspectives, and conversation-starting questions tailored to your role.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff8c5a]">
                  Detected Post Thesis
                </span>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-100">
                  {result.postCoreThesis}
                </p>
              </div>

              <div className="space-y-3.5">
                {result.comments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3 dark:border-slate-800 dark:bg-[#111827]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {comment.styleLabel}
                        </span>
                        <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#ff6b35]">
                          {comment.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          {comment.charCount} chars
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(comment.commentText, idx)}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          {copiedIndex === idx ? "Copied!" : "Copy Comment"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                      {comment.commentText}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 text-xs">
                      <div className="rounded-lg bg-emerald-50/70 border border-emerald-200/60 p-2.5 text-emerald-950">
                        <strong className="font-semibold">Why it works: </strong>
                        {comment.whyItWorks}
                      </div>
                      <div className="rounded-lg bg-sky-50/70 border border-sky-200/60 p-2.5 text-sky-950">
                        <strong className="font-semibold">Predicted author reply: </strong>
                        {comment.predictedAuthorReply}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {result.engagementTips?.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111827]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    LinkedIn Comment Algorithm Best Practices
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                    {result.engagementTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default LinkedinCommentGeneratorClient;

"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquarePlus, Trash2, Users } from "lucide-react";
import {
  UrlArticleExtractorBar,
  type UniversalExtractResponse,
} from "../tool-ui/UrlArticleExtractorBar";
import {
  focusToolSection,
  ToolRunOverlay,
} from "../tool-ui/ToolRunOverlay";
import type {
  CommentGoal,
  IncomingCommentItem,
  LinkedinCommentMode,
  LinkedinCommentOutput,
} from "./model";

export function LinkedinCommentGeneratorClient() {
  const [mode, setMode] = useState<LinkedinCommentMode>(
    "comment-on-others-post",
  );
  const [postContent, setPostContent] = useState(
    "Most B2B teams don't have a content creation problem—they have a content distribution and repurposing bottleneck. You spend 6 hours writing one deep-dive guide, publish it once, share a single bare link on LinkedIn, and move on. Meanwhile, top operators slice that single guide into 5 sub-topic posts, a visual carousel, and 10 high-value comments on industry threads.",
  );
  const [authorName, setAuthorName] = useState("");
  const [yourRole, setYourRole] = useState("SEO & Content Strategist");
  const [commentGoal, setCommentGoal] =
    useState<CommentGoal>("authority-insight");

  const [incomingComments, setIncomingComments] = useState<
    IncomingCommentItem[]
  >([
    {
      id: "c-1",
      commenterName: "Sarah Jenkins",
      commentText:
        "Totally agree on the distribution bottleneck! How do you decide which sub-topics deserve their own standalone post versus a carousel?",
    },
    {
      id: "c-2",
      commenterName: "David Chen",
      commentText:
        "We started repurposing every guide into 5 LinkedIn posts last month and our inbound DMs doubled. Great breakdown!",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkedinCommentOutput | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

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

  function addIncomingCommentSlot() {
    setIncomingComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}-${prev.length + 1}`,
        commenterName: "",
        commentText: "",
      },
    ]);
  }

  function removeIncomingCommentSlot(id: string) {
    setIncomingComments((prev) =>
      prev.length > 1 ? prev.filter((item) => item.id !== id) : prev,
    );
  }

  function updateIncomingComment(
    id: string,
    field: "commenterName" | "commentText",
    value: string,
  ) {
    setIncomingComments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  async function handleGenerate() {
    if (!postContent.trim()) {
      setError("Please paste the LinkedIn post or fetch an article URL first.");
      return;
    }
    if (mode === "reply-to-comments-on-my-post") {
      const valid = incomingComments.filter((c) => c.commentText.trim());
      if (valid.length === 0) {
        setError(
          "Please paste at least one comment you received on your post so we can craft tailored replies.",
        );
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai-tools/linkedin-comment-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          postContent,
          authorName,
          yourRole,
          commentGoal,
          incomingComments,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate LinkedIn comments.");
      }
      setResult(data as LinkedinCommentOutput);
      focusToolSection(resultsRef.current);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate comments.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-6 overflow-x-clip">
      <ToolRunOverlay
        open={loading}
        title={
          mode === "reply-to-comments-on-my-post"
            ? "Drafting Contextual Replies to Your Post's Comments..."
            : "Drafting 5 Strategic LinkedIn Comments..."
        }
        subtitle="Analyzing post thesis, commenter intent, and B2B conversation hooks."
      />

      {/* Mode Switcher Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setMode("comment-on-others-post");
              setResult(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-extrabold transition ${
              mode === "comment-on-others-post"
                ? "bg-[#0A66C2] text-white shadow-sm"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            💬 Mode 1: Comment on Someone Else&apos;s LinkedIn Post
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("reply-to-comments-on-my-post");
              setResult(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-extrabold transition ${
              mode === "reply-to-comments-on-my-post"
                ? "bg-[#ff6b35] text-white shadow-sm"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            <Users size={16} />
            Mode 2: Reply to Comments on MY Post (Batch Reply Studio)
          </button>
        </div>
      </div>

      <UrlArticleExtractorBar
        onExtracted={handleUrlExtracted}
        onSelectSubTopic={(sub) => {
          setPostContent(`${sub.title}\n\n${sub.content}`);
        }}
        label="Option 1: Fetch Post or Article Content from URL (with Sub-Topic Filter)"
        placeholder="Paste a LinkedIn post URL, blog article URL, or YouTube URL..."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-start">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {mode === "reply-to-comments-on-my-post"
                ? "My Post Context + Comments Received"
                : "LinkedIn Post & Comment Strategy"}
            </h2>
            <span className="rounded-full bg-[#0A66C2]/10 px-2.5 py-0.5 text-xs font-bold text-[#0A66C2]">
              {mode === "reply-to-comments-on-my-post"
                ? "4 Replies Per Comment"
                : "5 Strategic Angles"}
            </span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {mode === "reply-to-comments-on-my-post"
                ? "Step 1: Paste YOUR LinkedIn Post (So Replies Match Your Exact Thesis)"
                : "Option 2: Paste LinkedIn Post or Article Excerpt"}
            </label>
            <textarea
              rows={5}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder={
                mode === "reply-to-comments-on-my-post"
                  ? "Paste the text of your own LinkedIn post here for full context..."
                  : "Paste the LinkedIn post or article paragraph you want to reply to..."
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {mode === "reply-to-comments-on-my-post" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#ff6b35]">
                  Step 2: Paste 1 or More Comments Received on Your Post (
                  {incomingComments.length})
                </label>
                <button
                  type="button"
                  onClick={addIncomingCommentSlot}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0A66C2]/10 px-2.5 py-1 text-xs font-extrabold text-[#0A66C2] hover:bg-[#0A66C2]/20"
                >
                  <MessageSquarePlus size={13} />+ Add Another Comment
                </button>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {incomingComments.map((item, idx) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                        Incoming Comment #{idx + 1}
                      </span>
                      {incomingComments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIncomingCommentSlot(item.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.commenterName}
                      onChange={(e) =>
                        updateIncomingComment(
                          item.id,
                          "commenterName",
                          e.target.value,
                        )
                      }
                      placeholder="Commenter Name (e.g. Sarah Jenkins)"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <textarea
                      rows={2}
                      value={item.commentText}
                      onChange={(e) =>
                        updateIncomingComment(
                          item.id,
                          "commentText",
                          e.target.value,
                        )
                      }
                      placeholder="Paste what they commented on your post..."
                      className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Your Role / Author Positioning
                </label>
                <input
                  type="text"
                  value={yourRole}
                  onChange={(e) => setYourRole(e.target.value)}
                  placeholder="e.g. SaaS Founder, SEO Strategist"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <>
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
                  onChange={(e) =>
                    setCommentGoal(e.target.value as CommentGoal)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-[#ff6b35] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="authority-insight">
                    Build Authority &amp; Add Framework Insight
                  </option>
                  <option value="spark-discussion">
                    Spark Replies with a Smart Follow-Up Question
                  </option>
                  <option value="contrarian-nuance">
                    90% Agree + 10% Nuanced Contrarian Angle
                  </option>
                  <option value="warm-networking">
                    Supportive Peer Validation &amp; Relationship Building
                  </option>
                  <option value="subtle-expertise">
                    Subtle Practitioner Case Study &amp; Profile Clicks
                  </option>
                </select>
              </div>
            </>
          )}

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
            {loading
              ? "Generating LinkedIn Responses..."
              : mode === "reply-to-comments-on-my-post"
                ? `Generate Tailored Replies for ${incomingComments.length} Comment${incomingComments.length > 1 ? "s" : ""}`
                : "Generate 5 Strategic LinkedIn Comments"}
          </button>
        </div>

        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-4 focus:outline-none"
        >
          {!result ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-[#111827]">
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {mode === "reply-to-comments-on-my-post"
                  ? "Ready to Generate Context-Aware Replies to Your Commenters"
                  : "Ready to Generate High-Visibility LinkedIn Comments"}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {mode === "reply-to-comments-on-my-post"
                  ? "Paste your original LinkedIn post + 1 or multiple comments you received to get 4 tailored reply angles per commenter."
                  : "Click Generate 5 Strategic LinkedIn Comments to get authority add-ons, nuanced perspectives, and conversation-starting questions."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff8c5a]">
                  Detected Post Context
                </span>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-100">
                  {result.postCoreThesis}
                </p>
              </div>

              {result.replyPacks && result.replyPacks.length > 0 ? (
                <div className="space-y-5">
                  {result.replyPacks.map((pack, pIdx) => (
                    <div
                      key={pIdx}
                      className="rounded-2xl border-2 border-[#0A66C2]/25 bg-white p-5 shadow-xs space-y-3.5 dark:border-[#0A66C2]/40 dark:bg-[#111827]"
                    >
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A66C2]">
                          Replying to {pack.commenterName}
                        </span>
                        <p className="mt-1 text-xs italic text-slate-700 dark:text-slate-300">
                          &ldquo;{pack.originalComment}&rdquo;
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {pack.replies.map((reply, rIdx) => {
                          const copyId = `reply-${pIdx}-${rIdx}`;
                          return (
                            <div
                              key={rIdx}
                              className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 space-y-2.5 dark:border-slate-800 dark:bg-slate-900/60"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                    {reply.angleLabel}
                                  </span>
                                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#ff6b35]">
                                    {reply.badge}
                                  </span>
                                </div>
                                <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                  {reply.replyText}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400">
                                  {reply.charCount} chars
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(reply.replyText, copyId)
                                  }
                                  className="rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-slate-800"
                                >
                                  {copiedKey === copyId
                                    ? "Copied Reply!"
                                    : "Copy Reply"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {result.comments.map((comment, idx) => {
                    const copyId = `comment-${idx}`;
                    return (
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
                              onClick={() =>
                                handleCopy(comment.commentText, copyId)
                              }
                              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              {copiedKey === copyId
                                ? "Copied!"
                                : "Copy Comment"}
                            </button>
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 whitespace-pre-wrap text-sm text-slate-800 leading-relaxed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                          {comment.commentText}
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 text-xs">
                          <div className="rounded-lg bg-emerald-50/70 border border-emerald-200/60 p-2.5 text-emerald-950">
                            <strong className="font-semibold">
                              Why it works:{" "}
                            </strong>
                            {comment.whyItWorks}
                          </div>
                          <div className="rounded-lg bg-sky-50/70 border border-sky-200/60 p-2.5 text-sky-950">
                            <strong className="font-semibold">
                              Predicted author reply:{" "}
                            </strong>
                            {comment.predictedAuthorReply}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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

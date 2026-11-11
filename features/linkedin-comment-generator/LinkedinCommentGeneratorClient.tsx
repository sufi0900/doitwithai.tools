"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  MessageSquarePlus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import {
  UrlArticleExtractorBar,
  type UniversalExtractResponse,
} from "../tool-ui/UrlArticleExtractorBar";
import ToolRunOverlay, { focusToolSection } from "../tool-ui/ToolRunOverlay";
import PlatformBrandIcon from "../tool-ui/PlatformBrandIcon";
import {
  DEFAULT_LINKEDIN_COMMENT_OUTPUT,
  type CommentGoal,
  type IncomingCommentItem,
  type LinkedinCommentMode,
  type LinkedinCommentOutput,
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
  const [toast, setToast] = useState("");
  const [result, setResult] = useState<LinkedinCommentOutput>(
    DEFAULT_LINKEDIN_COMMENT_OUTPUT,
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  function notify(msg: string) {
    setError(null);
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  async function runGenerate(overrides?: {
    mode?: LinkedinCommentMode;
    postContent?: string;
    authorName?: string;
  }) {
    const activeMode = overrides?.mode ?? mode;
    const activePost = (overrides?.postContent ?? postContent).trim();
    const activeAuthor = overrides?.authorName ?? authorName;

    if (!activePost) {
      setError("Please paste the LinkedIn post or fetch an article URL first.");
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    if (activeMode === "reply-to-comments-on-my-post") {
      const valid = incomingComments.filter((c) => c.commentText.trim());
      if (valid.length === 0) {
        setError(
          "Please paste at least one comment you received on your post so we can craft tailored replies.",
        );
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
          mode: activeMode,
          postContent: activePost,
          authorName: activeAuthor,
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
      notify(
        activeMode === "reply-to-comments-on-my-post"
          ? "Generated tailored LinkedIn comment replies!"
          : "Generated 5 strategic LinkedIn comments!",
      );
      focusToolSection(resultsRef.current);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate comments.",
      );
      focusToolSection(resultsRef.current);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sharedText = params.get("text");
    if (sharedText && sharedText.trim()) {
      const clean = sharedText.trim();
      setPostContent(clean);
      void runGenerate({ postContent: clean });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleUrlExtracted(payload: UniversalExtractResponse) {
    const firstSub = payload.subTopics?.[0];
    const nextPost = firstSub
      ? `${firstSub.title}\n\n${firstSub.content}`
      : payload.cleanText || payload.description || payload.title;
    const nextAuthor = payload.author || authorName;
    setPostContent(nextPost);
    if (payload.author) {
      setAuthorName(payload.author);
    }
    setError(null);
    void runGenerate({ postContent: nextPost, authorName: nextAuthor });
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
    if (incomingComments.length <= 1) return;
    setIncomingComments((prev) => prev.filter((item) => item.id !== id));
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

  function updateCommentText(idx: number, newText: string) {
    setResult((prev) => ({
      ...prev,
      comments: prev.comments.map((c, i) =>
        i === idx ? { ...c, commentText: newText, charCount: newText.length } : c,
      ),
    }));
  }

  function updateReplyText(packIdx: number, replyIdx: number, newText: string) {
    setResult((prev) => ({
      ...prev,
      replyPacks: prev.replyPacks?.map((p, pi) =>
        pi === packIdx
          ? {
              ...p,
              replies: p.replies.map((r, ri) =>
                ri === replyIdx
                  ? { ...r, replyText: newText, charCount: newText.length }
                  : r,
              ),
            }
          : p,
      ),
    }));
  }

  function handleCopy(text: string, key: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    notify(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function downloadCommentsTxt() {
    const content =
      result.replyPacks && result.replyPacks.length > 0
        ? result.replyPacks
            .map(
              (p) =>
                `=== REPLYING TO ${p.commenterName.toUpperCase()} ===\nOriginal: "${p.originalComment}"\n\n` +
                p.replies
                  .map((r) => `[${r.angleLabel}]\n${r.replyText}`)
                  .join("\n\n"),
            )
            .join("\n\n----------------------------------------\n\n")
        : result.comments
            .map(
              (c, i) =>
                `=== COMMENT #${i + 1}: ${c.styleLabel} (${c.badge}) ===\n${c.commentText}\nWhy it works: ${c.whyItWorks}`,
            )
            .join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkedin-comments-pack.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded LinkedIn Comments Pack (.TXT)!");
  }

  const canRemoveIncoming = incomingComments.length > 1;

  return (
    <section className="mx-auto max-w-6xl space-y-6 overflow-x-clip px-4 py-10 sm:px-6">
      <ToolRunOverlay
        active={loading}
        title={
          mode === "reply-to-comments-on-my-post"
            ? "Drafting Contextual Replies to Your Post's Comments..."
            : "Drafting 5 Strategic LinkedIn Comments..."
        }
        description="Analyzing post thesis, commenter intent, and B2B conversation hooks."
      />

      {/* Mode Switcher Banner */}
      <div className="shadow-xs rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#111827]">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setMode("comment-on-others-post");
              void runGenerate({ mode: "comment-on-others-post" });
            }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold transition sm:text-sm ${
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
              void runGenerate({ mode: "reply-to-comments-on-my-post" });
            }}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold transition sm:text-sm ${
              mode === "reply-to-comments-on-my-post"
                ? "bg-[#4058d0] text-white shadow-sm"
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
          const nextPost = `${sub.title}\n\n${sub.content}`;
          setPostContent(nextPost);
          void runGenerate({ postContent: nextPost });
        }}
        label="Option 1: Fetch Post or Article Content from URL (with Sub-Topic Filter)"
        placeholder="Paste a LinkedIn post URL, blog article URL, or YouTube URL..."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="shadow-xs space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <PlatformBrandIcon
                platform="linkedin"
                slug="linkedin-comment-generator"
                size={38}
              />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {mode === "reply-to-comments-on-my-post"
                  ? "My Post Context + Comments Received"
                  : "LinkedIn Post & Comment Strategy"}
              </h2>
            </div>
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {mode === "reply-to-comments-on-my-post" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
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

              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {incomingComments.map((item, idx) => (
                  <div
                    key={item.id}
                    className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                        Incoming Comment #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeIncomingCommentSlot(item.id)}
                        disabled={!canRemoveIncoming}
                        style={{
                          backgroundColor: "#e11d48",
                          cursor: canRemoveIncoming ? "pointer" : "not-allowed",
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white disabled:opacity-45"
                      >
                        <Trash2 size={11} /> Remove
                      </button>
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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

          <button
            type="button"
            onClick={() => void runGenerate()}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4058d0] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#3452d1] disabled:opacity-60"
          >
            <Sparkles size={16} />
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
          {/* Contextual In-View Alerts */}
          {error && (
            <div
              role="alert"
              className="flex items-center justify-between gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-300"
            >
              <span className="inline-flex items-center gap-2">
                <AlertTriangle size={15} />
                {error}
              </span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {toast && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
            >
              <CheckCircle2 size={15} />
              <span>{toast}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8094ff]">
                Detected Post Context · Click Any Response Below to Edit Live
              </span>
              <p className="mt-1 text-xs font-medium text-slate-100 sm:text-sm">
                {result.postCoreThesis}
              </p>
            </div>
            <button
              type="button"
              onClick={downloadCommentsTxt}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
            >
              <Download size={13} /> Download .TXT
            </button>
          </div>

          {result.replyPacks && result.replyPacks.length > 0 ? (
            <div className="space-y-5">
              {result.replyPacks.map((pack, pIdx) => (
                <div
                  key={pIdx}
                  className="shadow-xs space-y-3.5 rounded-2xl border-2 border-[#0A66C2]/25 bg-white p-5 dark:border-[#0A66C2]/40 dark:bg-[#111827]"
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
                          className="flex flex-col justify-between space-y-2.5 rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                {reply.angleLabel}
                              </span>
                              <span className="rounded-full bg-[#5271ff]/10 px-2 py-0.5 text-[10px] font-bold text-[#4058d0]">
                                {reply.badge}
                              </span>
                            </div>
                            <textarea
                              rows={3}
                              value={reply.replyText}
                              onChange={(e) =>
                                updateReplyText(pIdx, rIdx, e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs leading-relaxed text-slate-800 focus:border-[#4058d0] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                            />
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-200/70 pt-1 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400">
                              {reply.charCount} chars
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(
                                  reply.replyText,
                                  copyId,
                                  reply.angleLabel,
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#3452d1]"
                            >
                              <Copy size={11} />
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
                    className="shadow-xs space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-[#111827] sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {comment.styleLabel}
                        </span>
                        <span className="rounded-full bg-[#5271ff]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#4058d0]">
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
                            handleCopy(
                              comment.commentText,
                              copyId,
                              comment.styleLabel,
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-[#4058d0] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#3452d1]"
                        >
                          <Copy size={12} />
                          {copiedKey === copyId ? "Copied!" : "Copy Comment"}
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={comment.commentText}
                      onChange={(e) => updateCommentText(idx, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-sm leading-relaxed text-slate-800 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    />

                    <div className="grid gap-2 text-xs sm:grid-cols-2">
                      <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/70 p-2.5 text-emerald-950">
                        <strong className="font-semibold">
                          Why it works:{" "}
                        </strong>
                        {comment.whyItWorks}
                      </div>
                      <div className="rounded-lg border border-sky-200/60 bg-sky-50/70 p-2.5 text-sky-950">
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
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs text-slate-600 dark:text-slate-300">
                {result.engagementTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LinkedinCommentGeneratorClient;

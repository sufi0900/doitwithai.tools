import Image from "next/image";
import { pageSpeedCaptionExamples } from "./video-caption-examples";

const checkerTitle = "What’s Slowing Your Website? Diagnose One Page with PageSpeed Insights";
const card = "min-w-0 rounded-2xl border border-slate-800 bg-slate-900/85 p-4 sm:p-6";
const disclosure = "AI-assisted educational video with synthetic narration and labeled illustrations.";

const guides = [
  {
    id: "tiktok",
    name: "TikTok",
    target: "Standalone title + detailed, conversational description",
    limit: "Buffer caption: 2,200 characters",
    steps: [
      "Put a unique, complete title on line one and leave a blank line. It should name the problem or skill and make sense on its own. Keep it free of tags, filler, and a generic brand intro.",
      "Start the body with the viewer’s situation and the same example the video follows. Write a useful, lengthy explanation in plain English: what to look for, why it matters, what to change, and how to check it. Use short paragraphs or numbered steps; stop when the idea is complete.",
      "Work the main search phrase into natural wording. Keep qualifiers next to the claim. Use a small number of directly relevant tags at the end if useful. A long caption is a founder preference, not a reach guarantee.",
      "Give the exact relevant URL as a reference and one natural next action. Say ‘link in bio’ only after verifying the profile link points where you say. Use the native AI label where required or directed; use the caption disclosure to explain what was synthetic.",
      "Treat commercial disclosure separately from the AI label. When the post promotes your own business, use TikTok’s content disclosure setting for your own brand. For a sponsored third-party promotion, use the applicable branded-content setting. If the scheduler cannot set this, use the native TikTok control and verify it on the post.",
    ],
    pattern: "Standalone title → recognizable problem → worked example → actionable steps → exact resource and soft CTA → disclosure and optional tags",
    image: { width: 1417, height: 712, alt: "Owner’s TikTok example: an article SEO lesson with a title-led, detailed caption beside the video." },
    note: "Use the depth and one-example flow. Keep a blank line after the opening title in new drafts so the title is explicit even when a preview collapses whitespace.",
  },
  {
    id: "youtube",
    name: "YouTube",
    target: "Specific title + summary + ‘In this video’ bullets",
    limit: "Title: 100 characters. Description: 5,000 characters.",
    steps: [
      "Use YouTube’s separate title field. Put the topic and useful outcome near the beginning. Make the title specific to this upload and accurate to the actual film.",
      "Write one or two opening sentences that summarize what the viewer will learn. Then add an ‘IN THIS VIDEO’ list of concrete things the reel covers, in viewing order. Keep each bullet to one point.",
      "Add one clear CTA and label the exact resource links. Shorts description and comment URLs are plain text: do not tell viewers to click them. Use a verified channel profile link or a related video where appropriate. Long-form link behavior differs.",
      "Include sources or credits when useful, accurate disclosure and a few topic tags if helpful. Add chapters only when useful and based on verified timestamps and current eligibility. Set audience and visibility deliberately; use the native altered-content setting when required or directed.",
    ],
    pattern: "Accurate title → short summary → ‘IN THIS VIDEO’ bullets → CTA → labeled links → relevant credits and disclosure",
    image: { width: 571, height: 714, alt: "Owner’s YouTube Studio example: an internal linking video description with an opening summary, bullets, a next step and labeled links." },
    note: "Use the description structure. The screenshot shows a long-form editing example; apply Shorts-specific link and publishing rules to short vertical films.",
  },
  {
    id: "facebook",
    name: "Facebook",
    target: "Helpful page post built around the viewer’s problem",
    limit: "Buffer post or reel caption: 5,000 characters",
    steps: [
      "Lead with a recognizable problem, useful observation or misconception that stands alone before ‘See more’. Follow with the same example shown in the video and explain why it matters.",
      "Use short paragraphs and a compact list if it helps readers apply the lesson. Give enough detail for someone skimming the post to try one thing. Keep the page’s helpful, direct voice.",
      "Put the relevant link next to the action it supports. Give one soft CTA. A specific question is optional when it invites a useful answer; avoid generic engagement requests and tag walls.",
      "Name material qualifications in the relevant paragraph. Give concise AI or source disclosure if it matters to this upload, and check the platform’s current native disclosure controls. Preview the post on mobile and verify the correct Page and video format.",
    ],
    pattern: "Reader problem → why it matters → example or practical steps → exact link and next action → concise disclosure",
    image: { width: 624, height: 618, alt: "Owner’s Facebook Page example: a heading structure lesson with short paragraphs, bullet steps, a relevant tool link and a disclosure." },
    note: "Follow the helpful tone, concrete example and visible action. Keep disclosure proportional to the film; this example has unusually detailed provenance.",
  },
  {
    id: "linkedin",
    name: "LinkedIn Company Page",
    target: "Professional insight + one worked example + a next step readers can use",
    limit: "Post: 3,000 characters. Review the opening in the feed preview.",
    steps: [
      "Open with a decision or problem your professional audience recognizes. State the takeaway in the first two lines so it makes sense before ‘see more’. Write as the company: use ‘we’ for work the team actually did and ‘you’ when giving practical advice.",
      "Ground the post in one concrete example from the film. Use short paragraphs and a short list only when it helps readers scan steps or compare cases. Spell out unfamiliar acronyms once. Give readers a useful action even if they never play the video.",
      "Separate observations, estimates, sample results and recommendations. Name the source where it matters, and keep qualifications next to the claim. Add one labeled, verified resource link and a low-pressure next step after the lesson.",
      "Invite a specific practitioner response only if the question adds value. Use a few relevant hashtags if useful; do not treat a hashtag count, link placement or post length as a reach guarantee. Reply as the Company Page when it makes sense.",
      "Attach the approved video directly to the Company Page post. Preview the opening and link on mobile. Check the thumbnail and readability with sound off. Where supported, upload reviewed timed subtitles or review LinkedIn’s automatic captions for terms, numbers and names. Keep the written post separate from the video subtitles.",
    ],
    pattern: "Workplace problem → practical takeaway → one worked example → actionable steps → labeled resource and soft CTA → brief disclosure and optional tags",
    image: { width: 478, height: 716, alt: "Founder’s LinkedIn Company Page caption example: a keyword research post opens with advice, follows one fictional espresso-school brief, separates suggestions from measurements, and gives one next step." },
    note: "Use the pacing and evidence distinctions. The example teaches before introducing the link and explains what the demonstrated tool does and does not measure.",
  },
] as const;

const sources = [
  ["Buffer character limits", "https://support.buffer.com/en-us/articles/character-limits-for-each-social-network-mNDqsEV9Nf"],
  ["Buffer: TikTok automatic publishing", "https://support.buffer.com/articles/using-tiktok-with-buffer-oGEroY9Of2"],
  ["Buffer: video formats and limits", "https://support.buffer.com/en-us/articles/sharing-videos-through-buffer-LOe2p2rnAI"],
  ["Buffer: AI disclosure", "https://support.buffer.com/articles/flagging-posts-as-ai-generated-in-buffer-V7jAnzYJ5n"],
  ["TikTok: AI-generated content", "https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content"],
  ["TikTok: promoting your own brand or a third party", "https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/promoting-a-brand-product-or-service"],
  ["YouTube: titles and video settings", "https://support.google.com/youtube/answer/57404"],
  ["YouTube: description tips", "https://support.google.com/youtube/answer/12948449"],
  ["YouTube: clickable links", "https://support.google.com/youtube/answer/13748639"],
  ["YouTube: three-minute Shorts", "https://support.google.com/youtube/answer/15424877"],
  ["YouTube: altered content disclosure", "https://support.google.com/youtube/answer/14328491"],
  ["LinkedIn: Company Page best practices", "https://business.linkedin.com/advertise/linkedin-pages/best-practices"],
  ["LinkedIn: post length", "https://www.linkedin.com/help/linkedin/answer/a522483/differences-between-posting-and-publishing"],
  ["LinkedIn: video uploads and subtitles", "https://www.linkedin.com/help/linkedin/answer/a7486279"],
] as const;

export default function FounderVideoPublishing() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-slate-200 [overflow-wrap:anywhere]">
      <section className={card} aria-labelledby="caption-guide-title">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Founder Studio · Distribution</p>
        <h3 id="caption-guide-title" className="mt-2 text-xl font-bold text-white">Captions &amp; Publishing</h3>
        <p className="mt-2">Write a distinct version for each destination from the approved cut. Each should teach the same useful idea in a form that fits the platform. Post copy is separate from the timed subtitles on the video.</p>
        <p className="mt-2 text-slate-300">Use the approved title, exact duration, worked example, visible actions, source notes, and verified destination URLs. Label sample reports and illustrations where the distinction matters. Keep any promised result within what the film shows.</p>
      </section>

      {guides.map(({ id, name, target, limit, steps, pattern, image, note }) => (
        <section key={id} className={card} aria-labelledby={`caption-${id}`}>
          <h4 id={`caption-${id}`} className="text-lg font-bold text-white">{name}</h4>
          <p className="font-semibold text-blue-300">{target}</p>
          <p className="mt-1 text-xs text-slate-300">{limit}</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            {steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <p className="mt-4 rounded-lg border border-slate-700 bg-slate-950 p-3"><strong className="text-white">Structure:</strong> {pattern}</p>
          <details className="mt-3 rounded-lg border border-slate-700 bg-slate-950 p-3">
            <summary className="cursor-pointer font-semibold text-blue-300">Founder screenshot and notes</summary>
            <figure className="mt-3">
              <Image src={`/founder-hub/video-caption-examples/${id}.webp`} width={image.width} height={image.height} alt={image.alt} sizes="(max-width: 640px) 90vw, 900px" className="h-auto max-w-full rounded-lg border border-slate-800" unoptimized />
              <figcaption className="mt-2 text-slate-300">{note}</figcaption>
            </figure>
          </details>
          <details className="mt-3 rounded-lg border border-slate-700 bg-slate-950 p-3">
            <summary className="cursor-pointer font-semibold text-blue-300">Copy example: the page speed reel</summary>
            {id === "youtube" && <p className="mt-3 font-bold text-white">{checkerTitle}</p>}
            <p className="mt-3 whitespace-pre-wrap">{pageSpeedCaptionExamples[id]}</p>
          </details>
        </section>
      ))}

      <section className={card} aria-labelledby="caption-preflight">
        <h4 id="caption-preflight" className="text-lg font-bold text-white">Before and after publishing</h4>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Match each sentence to the final cut or verified source. Keep the title’s promise, exact tool link, and sample-vs-live distinction. Example disclosure: “{disclosure}” Adapt it to the actual work.</li>
          <li>Check current limits and connected channels. Confirm the approved master, subtitles, media rights, intended audience and visibility. Preview mobile line breaks, opening text and links. If the film does not fit, report the limit rather than silently trimming or changing its speed.</li>
          <li>Publish or schedule only with current authorization. Check existing drafts, scheduled items and sent posts for the same cut. Save the caption, master identifier, post ID and timestamp per channel.</li>
          <li>Reopen each Buffer post and record its actual status and public link. Sending is pending; if the result is unclear, reconcile the existing post before retrying.</li>
        </ol>
        <h4 className="mt-5 font-bold text-white">Reusable AI prompt</h4>
        <blockquote className="mt-2 rounded-lg border-l-2 border-blue-400 bg-slate-950 p-3">From [approved film, transcript, exact URLs, source and disclosure notes], draft distinct copy for TikTok, YouTube, Facebook and the LinkedIn Company Page. Give TikTok a unique, complete first-line title and a detailed natural walkthrough. Give YouTube a separate title, short summary, covered-topic bullets, CTA and labeled links. Give Facebook a problem-first Page caption with a concrete example and a useful next step. Give LinkedIn a professional decision or takeaway, one worked example, practical steps, and one labeled resource after the lesson. Preserve qualifiers, verify current platform limits and link behavior, and state any missing facts. Return the exact copy and platform metadata. Publish only if authorized for this film.</blockquote>
        <h4 className="mt-5 font-bold text-white">Official references</h4>
        <p className="mt-1 text-slate-300">Check current platform rules again before future uploads. Editorial examples here are founder preferences.</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {sources.map(([label, href]) => <li key={href}><a className="text-blue-300 underline underline-offset-2" href={href}>{label}</a></li>)}
        </ul>
      </section>
    </div>
  );
}

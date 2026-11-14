"use client";
import { useState } from "react";
import {
 BookOpen,
 Coffee,
 Compass,
 Heart,
 Layers3,
 Newspaper,
 Rocket,
 Search,
 Sparkles,
} from "lucide-react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { isBlogFirstTemplate } from "@/features/website-builder/domain/template-contracts";
const FLAGSHIP_TEMPLATE_IDS = new Set([
 "doitwithai-flagship",
 "authority-niche-blog",
 "creator-newsletter-hub",
 "founder-authority-brand",
 "consultant-lead-engine",
 "micro-saas-launchpad",
 "startup-service-agency",
]);
export function isEditorialFlagshipTemplate(id: string): boolean {
 return FLAGSHIP_TEMPLATE_IDS.has(id);
}
export const TEMPLATE_META: Record<
 string,
 {
  kicker: string;
  primaryLabel: string;
  secondaryLabel: string;
  badge: string;
  accentColor: string;
  surfaceBg: string;
  cardBg: string;
  borderColor: string;
  isLight?: boolean;
 }
> = {
 "doitwithai-flagship": {
  kicker: "DOITWITHAI FLAGSHIP · AI TOOLS, SEO & EDITORIAL HUB",
  primaryLabel: "Explore AI Tools & Guides",
  secondaryLabel: "Connect with Founder",
  badge: "True DoItWithAI Flagship Theme",
  accentColor: "#6366f1",
  surfaceBg: "linear-gradient(145deg, #060a16 0%, #0b1329 55%, #080d1d 100%)",
  cardBg: "rgba(15, 23, 42, 0.78)",
  borderColor: "rgba(99, 102, 241, 0.28)",
 },
 "authority-niche-blog": {
  kicker: "CLASSIC BLOGGER & AUTHORITY MAGAZINE · 2-COLUMN EDITION",
  primaryLabel: "Read Latest Articles",
  secondaryLabel: "Subscribe to Updates",
  badge: "Classic Blog + Sticky Sidebar",
  accentColor: "#2563eb",
  surfaceBg: "#f8fafc",
  cardBg: "#ffffff",
  borderColor: "rgba(15, 23, 42, 0.12)",
  isLight: true,
 },
 "creator-newsletter-hub": {
  kicker: "CREATOR DISPATCH · SUBSTACK-STYLE NEWSLETTER & ESSAYS",
  primaryLabel: "Browse Issue Archive",
  secondaryLabel: "Sponsor an Issue",
  badge: "Reader-First Newsletter Hub",
  accentColor: "#fb7185",
  surfaceBg: "linear-gradient(160deg, #12081c 0%, #1b0d29 100%)",
  cardBg: "rgba(30, 16, 46, 0.82)",
  borderColor: "rgba(251, 113, 133, 0.26)",
 },
 "founder-authority-brand": {
  kicker: "CREATOR & FOUNDER HUB · KO-FI SUPPORT, SHOP & BLOG",
  primaryLabel: "Support & Explore Creations",
  secondaryLabel: "Book a 1:1 Session",
  badge: "Ko-fi Creator & Brand Studio",
  accentColor: "#a78bfa",
  surfaceBg: "linear-gradient(155deg, #090d1f 0%, #141936 100%)",
  cardBg: "rgba(22, 28, 58, 0.8)",
  borderColor: "rgba(167, 139, 250, 0.3)",
 },
 "consultant-lead-engine": {
  kicker: "FROSTED GLASSMORPHISM · STRATEGIC ADVISORY & ROI ENGINE",
  primaryLabel: "Review Client Case Studies",
  secondaryLabel: "Request Strategy Audit",
  badge: "Glassmorphism 2.0 Advisory",
  accentColor: "#38bdf8",
  surfaceBg:
   "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.16), transparent 45%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.16), transparent 50%), #050914",
  cardBg: "rgba(15, 23, 42, 0.56)",
  borderColor: "rgba(56, 189, 248, 0.32)",
 },
 "micro-saas-launchpad": {
  kicker: "AI TOOL DIRECTORY & MICRO-SAAS LAUNCHPAD",
  primaryLabel: "Launch Interactive Tools",
  secondaryLabel: "Read Product Docs & Blog",
  badge: "SaaS & AI Tool Directory",
  accentColor: "#22d3ee",
  surfaceBg: "linear-gradient(150deg, #040914 0%, #0a192f 100%)",
  cardBg: "rgba(12, 26, 48, 0.82)",
  borderColor: "rgba(34, 211, 238, 0.28)",
 },
 "startup-service-agency": {
  kicker: "DIGITAL SERVICE STUDIO · PACKAGES, PROOF & SEO HUB",
  primaryLabel: "View Service Packages",
  secondaryLabel: "Scope Your Project",
  badge: "Agency & Small Business Funnel",
  accentColor: "#a3e635",
  surfaceBg: "linear-gradient(150deg, #060c09 0%, #0f1c14 100%)",
  cardBg: "rgba(16, 30, 22, 0.84)",
  borderColor: "rgba(163, 230, 53, 0.28)",
 },
};
function TemplateIcon({ id }: { id: string }) {
 switch (id) {
  case "authority-niche-blog":
   return <BookOpen size={16} />;
  case "creator-newsletter-hub":
   return <Newspaper size={16} />;
  case "founder-authority-brand":
   return <Coffee size={16} />;
  case "consultant-lead-engine":
   return <Compass size={16} />;
  case "micro-saas-launchpad":
   return <Rocket size={16} />;
  case "startup-service-agency":
   return <Layers3 size={16} />;
  default:
   return <Sparkles size={16} />;
 }
}
export function estimateReadingMinutes(post: { blocks: Array<{ text?: string; items: string[] }> }): number {
 const words = post.blocks.reduce(
  (sum, b) =>
   sum +
   (b.text ? b.text.split(/\s+/).length : 0) +
   b.items.reduce((acc, item) => acc + item.split(/\s+/).length, 0),
  0
 );
 return Math.max(2, Math.round(words / 180));
}
export function EditorialFlagshipHero({
 document,
 publicBasePath,
 navigate,
 onOpenPost,
}: {
 document: SiteDocument;
 publicBasePath?: string;
 navigate?: (section: "projects" | "contact" | "blog") => void;
 onOpenPost?: (id: string) => void;
}) {
 const template = document.design.template;
 const meta = TEMPLATE_META[template] ?? TEMPLATE_META["doitwithai-flagship"];
 const blogFirst = isBlogFirstTemplate(template);
 const Title = publicBasePath ? "h1" : "h2";
 const Role = publicBasePath ? "h2" : "h3";
 const [heroSearch, setHeroSearch] = useState("");
 const [heroEmail, setHeroEmail] = useState("");
 const [heroSubscribed, setHeroSubscribed] = useState(false);
 const [heroSupportTier, setHeroSupportTier] = useState("⚡ $15 Pro Member");
 const [heroTeamSize, setHeroTeamSize] = useState(8);
 const [heroHoursSaved, setHeroHoursSaved] = useState(14);
 const [heroSandboxPrompt, setHeroSandboxPrompt] = useState("AI SEO Topic Cluster & Content Engine");
 const posts = document.publishing.posts
  .filter((post) => !publicBasePath || post.status === "published")
  .slice(0, 4);
 const featuredPost = posts[0];
 const leadProject = document.content.projects[0];
 const allTags = Array.from(
  new Set([
   ...document.skills.map((s) => s.label),
   ...posts.flatMap((p) => p.tags),
  ])
 ).slice(0, 6);
 const triggerPrimary = () => {
  if (blogFirst && posts.length > 0 && onOpenPost) {
   onOpenPost("__index__");
  } else {
   navigate?.("projects");
  }
 };
 // ============================================================================
 // HERO 1: DOITWITHAI FLAGSHIP — CENTERED COMMAND HUB + LIVE TOOL/GUIDE BAR
 // ============================================================================
 if (template === "doitwithai-flagship") {
  return (
   <section
    id="hero"
    className="flagship-custom-hero flagship-hero-doitwithai"
    style={{ background: "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.28), transparent 55%), linear-gradient(160deg, #050914 0%, #0b132b 55%, #070c1c 100%)", color: "#f8fafc", borderBottom: "1px solid rgba(99, 102, 241, 0.32)", padding: "clamp(32px, 5vw, 64px)", }}
   >
    <div style={{ maxWidth: "1120px", margin: "0 auto", display: "grid", gap: "26px", textAlign: "center" }}>
     <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
      <span
       style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "6px 14px", borderRadius: "999px", background: "rgba(99, 102, 241, 0.18)", border: "1px solid rgba(99, 102, 241, 0.45)", color: "#a5b4fc", fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em", }}
      >
       <TemplateIcon id={template} /> {meta.badge.toUpperCase()} · DOITWITHAI FLAGSHIP STUDIO
      </span>
      <span
       style={{ padding: "6px 12px", borderRadius: "999px", background: "rgba(16, 185, 129, 0.14)", border: "1px solid rgba(16, 185, 129, 0.35)", color: "#6ee7b7", fontSize: "11px", fontWeight: 700, }}
      >
       ● {document.identity.availability}
      </span>
     </div>
     <div style={{ maxWidth: "820px", margin: "0 auto", display: "grid", gap: "12px" }}>
      <Title style={{ margin: 0, fontSize: "clamp(36px, 5.5vw, 64px)", lineHeight: 1.04, letterSpacing: "-0.03em", color: "#ffffff" }}>
       {document.identity.name}
      </Title>
      <Role style={{ margin: 0, fontSize: "clamp(18px, 2.4vw, 26px)", fontWeight: 700, color: "#818cf8" }}>
       {document.identity.role}
      </Role>
      <p style={{ margin: "4px auto 0", maxWidth: "680px", fontSize: "16px", lineHeight: 1.7, color: "#cbd5e1" }}>
       {document.identity.intro}
      </p>
     </div>
     {/* Embedded DoItWithAI Command Search & Quick Filter Bar */}
     <div
      style={{ maxWidth: "760px", width: "100%", margin: "0 auto", background: "rgba(15, 23, 42, 0.86)", border: "1px solid rgba(99, 102, 241, 0.4)", borderRadius: "16px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)", }}
     >
      <Search size={18} color="#818cf8" />
      <input
       type="search"
       value={heroSearch}
       onChange={(e) => setHeroSearch(e.target.value)}
       placeholder="Search AI tools, pillar SEO guides, prompt packs & workflows…"
       aria-label="Search flagship directory"
       style={{ flex: 1, background: "transparent", border: 0, color: "#f8fafc", fontSize: "14px", outline: "none", }}
      />
      {publicBasePath ? (
       <a
        href="#prompt-library"
        style={{ padding: "10px 16px", borderRadius: "10px", background: "#6366f1", color: "#ffffff", fontSize: "12px", fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap", }}
       >
        Explore Hub →
       </a>
      ) : (
       <button
        type="button"
        onClick={triggerPrimary}
        style={{ padding: "10px 16px", borderRadius: "10px", background: "#6366f1", color: "#ffffff", border: 0, fontSize: "12px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap", }}
       >
        Explore Hub →
       </button>
      )}
     </div>
     {allTags.length > 0 && (
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px" }}>
       {allTags.map((tag) => (
        <span
         key={tag}
         style={{ fontSize: "11px", fontWeight: 600, padding: "5px 12px", borderRadius: "999px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(148, 163, 184, 0.22)", color: "#e2e8f0", }}
        >
         #{tag}
        </span>
       ))}
      </div>
     )}
     {/* 3-Card Flagship Ecosystem Bento Strip */}
     <div
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", textAlign: "left", marginTop: "6px", }}
     >
      <div
       style={{ background: "rgba(15, 23, 42, 0.78)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "16px", padding: "20px", display: "grid", gap: "8px", }}
      >
       <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.14em", color: "#818cf8" }}>
        01 · PILLAR SEO &amp; RESEARCH HUB
       </span>
       <strong style={{ fontSize: "16px", color: "#ffffff" }}>
        {featuredPost ? featuredPost.title : "1-Click AI Content Writer Sync"}
       </strong>
       <p style={{ margin: 0, fontSize: "12.5px", color: "#94a3b8", lineHeight: 1.55 }}>
        {featuredPost
         ? featuredPost.excerpt || "Read our latest E-E-A-T pillar guide."
         : "Publish long-form SEO articles, comparison tables, and infographics directly to this hub."}
       </p>
      </div>
      <div
       style={{ background: "rgba(15, 23, 42, 0.78)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "16px", padding: "20px", display: "grid", gap: "8px", }}
      >
       <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.14em", color: "#38bdf8" }}>
        02 · SHIPPED AI TOOLS &amp; SYSTEMS
       </span>
       <strong style={{ fontSize: "16px", color: "#ffffff" }}>
        {leadProject ? leadProject.title : "Interactive AI Tool Directory"}
       </strong>
       <p style={{ margin: 0, fontSize: "12.5px", color: "#94a3b8", lineHeight: 1.55 }}>
        {leadProject
         ? leadProject.summary
         : "Explore interactive web utilities, SEO diagnostics, and production workflows."}
       </p>
      </div>
      <div
       style={{ background: "rgba(15, 23, 42, 0.78)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "16px", padding: "20px", display: "grid", gap: "8px", }}
      >
       <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.14em", color: "#34d399" }}>
        03 · PROMPT VAULT &amp; @GRAPH SCHEMA
       </span>
       <strong style={{ fontSize: "16px", color: "#ffffff" }}>
        Copy-Ready Prompts &amp; Connected JSON-LD
       </strong>
       <p style={{ margin: 0, fontSize: "12.5px", color: "#94a3b8", lineHeight: 1.55 }}>
        Includes 3 constraint-layered prompt packs, step-by-step playbooks, and live Schema.org inspector below.
       </p>
      </div>
     </div>
    </div>
   </section>
  );
 }
 // ============================================================================
 // HERO 2: AUTHORITY NICHE BLOG — LIGHT CLASSIC BLOGGER / WIRECUTTER MASTHEAD
 // ============================================================================
 if (template === "authority-niche-blog") {
  return (
   <section
    id="hero"
    className="flagship-custom-hero flagship-hero-authority-blog"
    style={{ background: "#ffffff", color: "#0f172a", borderBottom: "3px double #0f172a", padding: "clamp(24px, 4vw, 48px)", }}
   >
    <div style={{ maxWidth: "1240px", margin: "0 auto", display: "grid", gap: "22px" }}>
     {/* Newspaper / Review Magazine Top Bar */}
     <div
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid #cbd5e1", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#475569", }}
     >
      <span>EDITION 2026 · INDEPENDENT EDITORIAL &amp; REVIEW PUBLICATION</span>
      <span style={{ color: "#2563eb" }}>✓ FIRST-HAND TESTED · E-E-A-T VERIFIED BY {document.identity.name.toUpperCase()}</span>
     </div>
     {/* Editorial Masthead Title & Ribbon */}
     <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) minmax(260px, 1fr)", gap: "28px", alignItems: "center" }}>
      <div style={{ display: "grid", gap: "10px" }}>
       <span style={{ fontSize: "12px", fontWeight: 800, color: "#2563eb", letterSpacing: "0.14em" }}>
        CLASSIC BLOGGER 2-COLUMN &amp; AUTHORITY REVIEW HUB
       </span>
       <Title
        style={{ margin: 0, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(32px, 4.6vw, 54px)", lineHeight: 1.08, color: "#0f172a", }}
       >
        {document.identity.name} — Editorial &amp; Reviews
       </Title>
       <p style={{ margin: 0, fontSize: "16px", lineHeight: 1.65, color: "#334155" }}>
        {document.identity.intro}
       </p>
      </div>
      {/* Editor's Verdict Score Box */}
      <div
       style={{ background: "#eff6ff", border: "2px solid #2563eb", borderRadius: "14px", padding: "20px", display: "grid", gap: "8px", }}
      >
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "11px", fontWeight: 800, color: "#1d4ed8", letterSpacing: "0.1em" }}>
         EDITOR&apos;S CHOICE BENCHMARK
        </span>
        <span style={{ background: "#2563eb", color: "#ffffff", fontWeight: 800, fontSize: "13px", padding: "3px 9px", borderRadius: "6px" }}>
         9.8 / 10
        </span>
       </div>
       <strong style={{ fontSize: "16px", color: "#0f172a" }}>
        {leadProject ? leadProject.title : "2026 AI & SEO Stack Benchmark"}
       </strong>
       <p style={{ margin: 0, fontSize: "12.5px", color: "#334155", lineHeight: 1.55 }}>
        Hands-on evaluation by {document.identity.name} ({document.identity.role}) with full Pros &amp; Cons matrix and sticky Table of Contents below.
       </p>
      </div>
     </div>
     {/* Category Navigation Ribbon */}
     <div
      style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", alignItems: "center", }}
     >
      <strong style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#0f172a", marginRight: "6px" }}>
       Core Beats:
      </strong>
      {(allTags.length ? allTags : ["Pillar Guides", "Tool Reviews", "Comparisons", "Case Studies"]).map((tag) => (
       <span
        key={tag}
        style={{ fontSize: "12px", fontWeight: 600, padding: "4px 11px", borderRadius: "6px", background: "#f1f5f9", color: "#1e293b", border: "1px solid #cbd5e1", }}
       >
        {tag}
       </span>
      ))}
     </div>
    </div>
   </section>
  );
 }
 // ============================================================================
 // HERO 3: CREATOR NEWSLETTER HUB — SUBSTACK / BEEHIVE READER-FIRST DISPATCH
 // ============================================================================
 if (template === "creator-newsletter-hub") {
  return (
   <section
    id="hero"
    className="flagship-custom-hero flagship-hero-newsletter"
    style={{ background: "linear-gradient(180deg, #160921 0%, #1f0d2d 100%)", color: "#fdf2f8", borderBottom: "1px solid rgba(251, 113, 133, 0.3)", padding: "clamp(36px, 5vw, 68px)", }}
   >
    <div style={{ maxWidth: "780px", margin: "0 auto", textAlign: "center", display: "grid", gap: "20px" }}>
     <div style={{ display: "inline-flex", justifySelf: "center", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(251, 113, 133, 0.15)", border: "1px solid rgba(251, 113, 133, 0.4)", color: "#fda4af", fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em" }}>
      <Newspaper size={14} /> SUBSTACK-STYLE CREATOR NEWSLETTER &amp; ESSAY ARCHIVE
     </div>
     <Title
      style={{ margin: 0, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1.08, color: "#ffffff", }}
     >
      The {document.identity.name} Dispatch
     </Title>
     <p style={{ margin: 0, fontSize: "17px", lineHeight: 1.7, color: "#fbcfe8" }}>
      <strong>{document.identity.role}</strong> — {document.identity.intro}
     </p>
     {/* Substack-Style Inline Email Capture Box */}
     <form
      onSubmit={(e) => {
       e.preventDefault();
       setHeroSubscribed(true);
      }}
      style={{ display: "flex", flexWrap: "wrap", gap: "10px", maxWidth: "560px", width: "100%", margin: "6px auto 0", background: "rgba(15, 7, 24, 0.85)", padding: "8px", borderRadius: "14px", border: "1px solid rgba(251, 113, 133, 0.45)", }}
     >
      <input
       type="email"
       value={heroEmail}
       onChange={(e) => setHeroEmail(e.target.value)}
       placeholder="Type your email to receive weekly issues…"
       aria-label="Newsletter email address"
       style={{ flex: 1, minWidth: "210px", padding: "11px 14px", background: "transparent", border: 0, color: "#ffffff", fontSize: "14px", outline: "none", }}
      />
      <button
       type="submit"
       style={{ padding: "11px 20px", borderRadius: "10px", background: "#fb7185", color: "#19071d", border: 0, fontWeight: 800, fontSize: "13px", cursor: "pointer", }}
      >
       {heroSubscribed ? "Subscribed ✓" : "Subscribe Free"}
      </button>
     </form>
     <small style={{ color: "#f9a8d4", fontSize: "12px" }}>
      Read weekly by builders, founders &amp; operators · Free &amp; Insider ($12/mo) editions available below
     </small>
     {/* Pinned Issue Preview Strip */}
     <div
      style={{ marginTop: "8px", textAlign: "left", background: "rgba(35, 15, 52, 0.85)", border: "1px solid rgba(251, 113, 133, 0.3)", borderRadius: "16px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", }}
     >
      <div style={{ display: "grid", gap: "4px" }}>
       <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.14em", color: "#fb7185" }}>
        PINNED ISSUE #01 · EDITOR&apos;S DISPATCH
       </span>
       <strong style={{ fontSize: "17px", color: "#ffffff" }}>
        {featuredPost ? featuredPost.title : `Inside ${document.identity.name}'s 2026 AI & Product Playbook`}
       </strong>
       <span style={{ fontSize: "12.5px", color: "#f9a8d4" }}>
        5 min read · Includes full issue archive &amp; sponsor slot tiers below
       </span>
      </div>
      <button
       type="button"
       onClick={triggerPrimary}
       style={{ padding: "9px 15px", borderRadius: "9px", background: "rgba(251, 113, 133, 0.16)", border: "1px solid rgba(251, 113, 133, 0.45)", color: "#fda4af", fontWeight: 700, fontSize: "12px", cursor: "pointer", }}
      >
       Read Issue #01 →
      </button>
     </div>
    </div>
   </section>
  );
 }
 // ============================================================================
 // HERO 4: FOUNDER AUTHORITY BRAND — KO-FI CREATOR HUB, TIP-JAR & DIGITAL SHOP
 // ============================================================================
 if (template === "founder-authority-brand") {
  const initials =
   document.identity.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "CR";
  return (
   <section
    id="hero"
    className="flagship-custom-hero flagship-hero-kofi-creator"
    style={{ background: "linear-gradient(155deg, #0b0f26 0%, #181c3e 100%)", color: "#f8fafc", borderBottom: "1px solid rgba(167, 139, 250, 0.35)", padding: "clamp(28px, 4.5vw, 56px)", }}
   >
    <div style={{ maxWidth: "1180px", margin: "0 auto", display: "grid", gap: "22px" }}>
     {/* Ko-fi Style Creator Cover Banner */}
     <div
      style={{ background: "linear-gradient(120deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%)", borderRadius: "20px", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", boxShadow: "0 18px 40px rgba(0, 0, 0, 0.35)", }}
     >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
       <div
        style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#0f172a", border: "3px solid #ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 900, color: "#c4b5fd", }}
       >
        {initials}
       </div>
       <div>
        <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em", color: "#fde68a" }}>
         KO-FI CREATOR STUDIO · TIP JAR, MEMBERSHIPS &amp; DIGITAL SHOP
        </span>
        <Title style={{ margin: "2px 0 0", fontSize: "clamp(26px, 3.6vw, 40px)", color: "#ffffff" }}>
         {document.identity.name}
        </Title>
       </div>
      </div>
      <span
       style={{ padding: "7px 14px", borderRadius: "999px", background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(255,255,255,0.28)", color: "#ffffff", fontSize: "12px", fontWeight: 700, }}
      >
       ☕ 0% Platform Tip Fee · 78% Monthly Goal Reached
      </span>
     </div>
     {/* 2-Column Creator Bio + Interactive Ko-fi Tip & Membership Widget */}
     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "24px", alignItems: "start" }}>
      <div
       style={{ background: "rgba(22, 28, 58, 0.82)", border: "1px solid rgba(167, 139, 250, 0.3)", borderRadius: "18px", padding: "26px", display: "grid", gap: "14px", }}
      >
       <Role style={{ margin: 0, fontSize: "20px", color: "#c4b5fd" }}>{document.identity.role}</Role>
       <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.7, color: "#e2e8f0" }}>
        {document.identity.intro}
       </p>
       <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {allTags.map((tag) => (
         <span
          key={tag}
          style={{ padding: "4px 10px", borderRadius: "999px", background: "rgba(167, 139, 250, 0.14)", border: "1px solid rgba(167, 139, 250, 0.3)", fontSize: "11px", color: "#ddd6fe", }}
         >
          #{tag}
         </span>
        ))}
       </div>
       <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "6px" }}>
        <a
         href="#kofi-creator-hub"
         style={{ padding: "10px 18px", borderRadius: "10px", background: "#a78bfa", color: "#090d1f", fontWeight: 800, fontSize: "13px", textDecoration: "none", }}
        >
         Explore Membership Tiers ↓
        </a>
        <a
         href="#projects"
         style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(167, 139, 250, 0.4)", color: "#f8fafc", fontWeight: 700, fontSize: "13px", textDecoration: "none", }}
        >
         Browse Digital Shop
        </a>
       </div>
      </div>
      {/* Interactive Ko-fi Buy Me a Coffee Card */}
      <div
       style={{ background: "rgba(15, 19, 42, 0.92)", border: "2px solid #a78bfa", borderRadius: "18px", padding: "24px", display: "grid", gap: "14px", }}
      >
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#ffffff" }}>
         <Coffee size={18} color="#c4b5fd" /> Buy {document.identity.name.split(" ")[0]} a Coffee
        </strong>
        <span style={{ fontSize: "12px", color: "#c4b5fd", fontWeight: 800 }}>$780 / $1,000 Goal</span>
       </div>
       <div style={{ height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: "78%", height: "100%", background: "linear-gradient(90deg, #a78bfa, #ec4899)" }} />
       </div>
       <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {["☕ $5 Coffee", "⚡ $15 Pro Member", "🚀 $45 VIP Sponsor"].map((tier) => {
         const active = heroSupportTier === tier;
         return (
          <button
           key={tier}
           type="button"
           onClick={() => setHeroSupportTier(tier)}
           style={{ padding: "9px 6px", borderRadius: "10px", border: `1px solid ${active ? "#c4b5fd" : "rgba(255,255,255,0.15)"}`, background: active ? "rgba(167, 139, 250, 0.25)" : "rgba(255,255,255,0.04)", color: "#ffffff", fontSize: "11px", fontWeight: 700, cursor: "pointer", }}
          >
           {tier}
          </button>
         );
        })}
       </div>
       <a
        href="#kofi-creator-hub"
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px 16px", borderRadius: "10px", background: "linear-gradient(90deg, #a78bfa, #ec4899)", color: "#090d1f", fontWeight: 800, fontSize: "13px", textDecoration: "none", }}
       >
        <Heart size={15} /> Support with {heroSupportTier}
       </a>
      </div>
     </div>
    </div>
   </section>
  );
 }
 // ============================================================================
 // HERO 5: CONSULTANT LEAD ENGINE — FROSTED GLASSMORPHISM 2.0 + LIVE ROI ENGINE
 // ============================================================================
 if (template === "consultant-lead-engine") {
  const monthlyHours = heroTeamSize * heroHoursSaved * 4;
  const monthlySavings = monthlyHours * 75;
  return (
   <section
    id="hero"
    className="flagship-custom-hero flagship-hero-glass-advisory"
    style={{ background: "radial-gradient(circle at 18% 22%, rgba(56, 189, 248, 0.24), transparent 42%), radial-gradient(circle at 82% 75%, rgba(99, 102, 241, 0.22), transparent 48%), #040814", color: "#f8fafc", borderBottom: "1px solid rgba(56, 189, 248, 0.35)", padding: "clamp(32px, 5vw, 64px)", }}
   >
    <div
     style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px", alignItems: "center", }}
    >
     <div
      style={{ background: "rgba(15, 23, 42, 0.52)", border: "1px solid rgba(56, 189, 248, 0.35)", borderRadius: "22px", padding: "30px", backdropFilter: "blur(24px)", display: "grid", gap: "14px", }}
     >
      <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em", color: "#38bdf8" }}>
       FROSTED GLASSMORPHISM 2.0 · EXECUTIVE B2B ADVISORY FUNNEL
      </span>
      <Title style={{ margin: 0, fontSize: "clamp(30px, 4.2vw, 50px)", lineHeight: 1.08, color: "#ffffff" }}>
       {document.identity.name}
      </Title>
      <Role style={{ margin: 0, fontSize: "19px", color: "#38bdf8" }}>{document.identity.role}</Role>
      <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.65, color: "#cbd5e1" }}>
       {document.identity.intro}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "6px" }}>
       {[
        { k: "3.4x", l: "Organic Pipeline" },
        { k: "-62%", l: "Delivery Cycle" },
        { k: "100%", l: "E-E-A-T Audited" },
       ].map((m) => (
        <div
         key={m.l}
         style={{ padding: "10px", borderRadius: "12px", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", textAlign: "center", }}
        >
         <strong style={{ display: "block", fontSize: "18px", color: "#38bdf8" }}>{m.k}</strong>
         <span style={{ fontSize: "10px", color: "#cbd5e1" }}>{m.l}</span>
        </div>
       ))}
      </div>
     </div>
     {/* Interactive Live B2B ROI Calculator Right in the Hero */}
     <div
      style={{ background: "rgba(15, 23, 42, 0.68)", border: "1px solid rgba(56, 189, 248, 0.45)", borderRadius: "22px", padding: "28px", backdropFilter: "blur(24px)", display: "grid", gap: "16px", boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)", }}
     >
      <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em", color: "#38bdf8" }}>
       LIVE ADVISORY ROI &amp; CAPACITY CALCULATOR
      </span>
      <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#e2e8f0" }}>
       <span>Team Contributors: <strong>{heroTeamSize} people</strong></span>
       <input
        type="range"
        min={1}
        max={25}
        value={heroTeamSize}
        onChange={(e) => setHeroTeamSize(Number(e.target.value))}
       />
      </label>
      <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#e2e8f0" }}>
       <span>Hours Saved / Person / Week: <strong>{heroHoursSaved} hrs</strong></span>
       <input
        type="range"
        min={2}
        max={25}
        value={heroHoursSaved}
        onChange={(e) => setHeroHoursSaved(Number(e.target.value))}
       />
      </label>
      <div
       style={{ padding: "16px", borderRadius: "14px", background: "rgba(56, 189, 248, 0.14)", border: "1px solid rgba(56, 189, 248, 0.4)", display: "grid", gap: "4px", }}
      >
       <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em", color: "#38bdf8" }}>
        PROJECTED MONTHLY CAPACITY UNLOCKED
       </span>
       <strong style={{ fontSize: "28px", color: "#ffffff" }}>
        {monthlyHours} hrs/mo (~${monthlySavings.toLocaleString()}/mo)
       </strong>
       <small style={{ color: "#cbd5e1", fontSize: "12px" }}>
        Based on $75/hr blended engineering &amp; editorial cost
       </small>
      </div>
     </div>
    </div>
   </section>
  );
 }
 // ============================================================================
 // HERO 6: MICRO-SAAS LAUNCHPAD — DEVELOPER SAAS + LIVE TERMINAL SANDBOX WINDOW
 // ============================================================================
 if (template === "micro-saas-launchpad") {
  return (
   <section
    id="hero"
    className="flagship-custom-hero flagship-hero-saas-launchpad"
    style={{ background: "linear-gradient(150deg, #030712 0%, #08172e 100%)", color: "#f8fafc", borderBottom: "1px solid rgba(34, 211, 238, 0.32)", padding: "clamp(32px, 5vw, 64px)", }}
   >
    <div
     style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px", alignItems: "center", }}
    >
     <div style={{ display: "grid", gap: "14px" }}>
      <div style={{ display: "inline-flex", width: "fit-content", alignItems: "center", gap: "8px", padding: "5px 12px", borderRadius: "999px", background: "rgba(34, 211, 238, 0.14)", border: "1px solid rgba(34, 211, 238, 0.4)", color: "#22d3ee", fontSize: "11px", fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>
       <Rocket size={14} /> v2.4 LIVE · AI TOOL DIRECTORY &amp; MICRO-SAAS LAUNCHPAD
      </div>
      <Title style={{ margin: 0, fontSize: "clamp(32px, 4.5vw, 52px)", lineHeight: 1.06, color: "#ffffff" }}>
       {document.identity.name}
      </Title>
      <Role style={{ margin: 0, fontSize: "19px", color: "#22d3ee", fontFamily: "ui-monospace, monospace" }}>
       {document.identity.role}
      </Role>
      <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.65, color: "#cbd5e1" }}>
       {document.identity.intro}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "6px" }}>
       <a
        href="#saas-sandbox"
        style={{ padding: "11px 18px", borderRadius: "10px", background: "#22d3ee", color: "#04101c", fontWeight: 800, fontSize: "13px", textDecoration: "none", }}
       >
        Launch Interactive Sandbox ↓
       </a>
       <a
        href="#projects"
        style={{ padding: "11px 18px", borderRadius: "10px", border: "1px solid rgba(34, 211, 238, 0.4)", color: "#f8fafc", fontWeight: 700, fontSize: "13px", textDecoration: "none", }}
       >
        Explore Shipped Tools ({document.content.projects.length})
       </a>
      </div>
     </div>
     {/* Interactive Browser Terminal / AI Blueprint Sandbox */}
     <div
      style={{ background: "#050b16", border: "1px solid rgba(34, 211, 238, 0.4)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", }}
     >
      <div
       style={{ background: "#0c192e", padding: "10px 16px", borderBottom: "1px solid rgba(34, 211, 238, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#94a3b8", }}
      >
       <span>● ● ●  saas-workflow-sandbox.ts</span>
       <span style={{ color: "#22d3ee" }}>READY</span>
      </div>
      <div style={{ padding: "20px", display: "grid", gap: "12px", fontSize: "12.5px" }}>
       <label style={{ display: "grid", gap: "6px", color: "#22d3ee" }}>
        <span>$blueprint --niche</span>
        <input
         type="text"
         value={heroSandboxPrompt}
         onChange={(e) => setHeroSandboxPrompt(e.target.value)}
         style={{ padding: "9px 12px", borderRadius: "8px", background: "rgba(34, 211, 238, 0.08)", border: "1px solid rgba(34, 211, 238, 0.35)", color: "#ffffff", fontFamily: "inherit", fontSize: "12.5px", }}
        />
       </label>
       <div
        style={{ padding: "12px", borderRadius: "10px", background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "#a5f3fc", lineHeight: 1.6, }}
       >
        <div>{"{"}</div>
        <div style={{ paddingLeft: "14px" }}>&quot;module&quot;: &quot;{heroSandboxPrompt || "AI Tool"}&quot;,</div>
        <div style={{ paddingLeft: "14px" }}>&quot;schema&quot;: &quot;SoftwareApplication + ItemList&quot;,</div>
        <div style={{ paddingLeft: "14px" }}>&quot;status&quot;: &quot;200 OK · Live in Browser&quot;</div>
        <div>{"}"}</div>
       </div>
      </div>
     </div>
    </div>
   </section>
  );
 }
 // ============================================================================
 // HERO 7: STARTUP SERVICE AGENCY — PRODUCTIZED AGENCY & 3-TIER SPRINT FUNNEL
 // ============================================================================
 return (
  <section
   id="hero"
   className="flagship-custom-hero flagship-hero-service-agency"
   style={{ background: "linear-gradient(155deg, #050c08 0%, #0d1f14 100%)", color: "#f8fafc", borderBottom: "1px solid rgba(163, 230, 53, 0.32)", padding: "clamp(32px, 5vw, 60px)", }}
  >
   <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gap: "24px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
     <span style={{ padding: "6px 14px", borderRadius: "999px", background: "rgba(163, 230, 53, 0.16)", border: "1px solid rgba(163, 230, 53, 0.4)", color: "#bef264", fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em" }}>
      PRODUCTIZED DIGITAL AGENCY &amp; SMALL BUSINESS STUDIO
     </span>
     <span style={{ fontSize: "12px", color: "#a3e635", fontWeight: 700 }}>
      🟢 2 Client Sprint Slots Open · {document.identity.availability}
     </span>
    </div>
    <div style={{ display: "grid", gap: "10px", maxWidth: "820px" }}>
     <Title style={{ margin: 0, fontSize: "clamp(32px, 4.8vw, 56px)", lineHeight: 1.06, color: "#ffffff" }}>
      {document.identity.name} — {document.identity.role}
     </Title>
     <p style={{ margin: 0, fontSize: "16px", lineHeight: 1.65, color: "#d9f99d" }}>
      {document.identity.intro}
     </p>
    </div>
    {/* 3-Tier Productized Agency Packages Right in the Hero */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
     {[
      {
       tier: "01 · STARTER LAUNCH SPRINT",
       name: "Authority Site & SEO Setup",
       delivery: "7-Day Turnaround",
       desc: "High-converting landing page, technical SEO foundation, and connected JSON-LD schema.",
       highlight: false,
      },
      {
       tier: "02 · FLAGSHIP GROWTH STUDIO",
       name: "Full AI Website + Content Engine",
       delivery: "14-Day Sprint · Most Popular",
       desc: "Custom multi-page architecture, interactive tools, pillar blog cluster, and conversion funnel.",
       highlight: true,
      },
      {
       tier: "03 · DEDICATED PARTNER",
       name: "Ongoing Engineering & SEO Retainer",
       delivery: "Monthly Sprint Cadence",
       desc: "Continuous feature shipping, E-E-A-T content velocity, and conversion rate optimization.",
       highlight: false,
      },
     ].map((pkg) => (
      <div
       key={pkg.tier}
       style={{ background: pkg.highlight ? "rgba(163, 230, 53, 0.12)" : "rgba(16, 30, 22, 0.85)", border: `2px solid ${pkg.highlight ? "#a3e635" : "rgba(163, 230, 53, 0.25)"}`, borderRadius: "16px", padding: "20px", display: "grid", gap: "8px", }}
      >
       <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.14em", color: "#a3e635" }}>
        {pkg.tier}
       </span>
       <strong style={{ fontSize: "18px", color: "#ffffff" }}>{pkg.name}</strong>
       <span style={{ fontSize: "12px", fontWeight: 700, color: "#bef264" }}>{pkg.delivery}</span>
       <p style={{ margin: 0, fontSize: "12.5px", color: "#cbd5e1", lineHeight: 1.55 }}>{pkg.desc}</p>
      </div>
     ))}
    </div>
   </div>
  </section>
 );
}

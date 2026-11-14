"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
 ArrowUpRight,
 BookOpen,
 CheckCircle2,
 Heart,
 Mail,
 Search,
 Terminal,
 Zap,
} from "lucide-react";
import type { SiteDocument } from "@/features/website-builder/domain/site-document";
import { isBlogFirstTemplate } from "@/features/website-builder/domain/template-contracts";
import { projectsForPresentation } from "@/features/website-builder/domain/opportunity";
import {
 EditorialFlagshipHero,
 isEditorialFlagshipTemplate,
 TEMPLATE_META,
 estimateReadingMinutes,
} from "./editorial-flagship-hero";
export { EditorialFlagshipHero, isEditorialFlagshipTemplate };
export function EditorialFlagshipSections({
 document,
 editing = false,
 publicBasePath,
 onOpenPage,
 onOpenPost,
}: {
 document: SiteDocument;
 editing?: boolean;
 publicBasePath?: string;
 onOpenPage?: (id: string) => void;
 onOpenPost?: (id: string) => void;
}) {
 const template = document.design.template;
 const meta = TEMPLATE_META[template] ?? TEMPLATE_META["doitwithai-flagship"];
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedTopic, setSelectedTopic] = useState<string>("all");
 const [activeReaderPostId, setActiveReaderPostId] = useState<string | null>(null);
 const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
 const [openPlaybookId, setOpenPlaybookId] = useState<string>("playbook-1");
 const [showSchemaInspector, setShowSchemaInspector] = useState<boolean>(false);
 const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
 const [selectedSupportTier, setSelectedSupportTier] = useState<string>("⚡ $15 Pro Member");
 const [roiTeamSize, setRoiTeamSize] = useState<number>(6);
 const [roiHoursSaved, setRoiHoursSaved] = useState<number>(12);
 const [sandboxInput, setSandboxInput] = useState<string>("AI Content Writer & Topic Cluster SEO");
 const projects = projectsForPresentation(document);
 const posts = useMemo(() => {
  const realPosts = document.publishing.posts.filter(
   (post) => !publicBasePath || post.status === "published"
  );
  if (realPosts.length > 0 || publicBasePath) return realPosts;
  // Provide rich starter demo dispatches in Studio preview when no posts exist yet
  const primarySkill = document.skills[0]?.label || "AI SEO & Content Systems";
  const secondarySkill = document.skills[1]?.label || "Web Engineering";
  return [
   {
    id: "demo-starter-post-1",
    title: `The 2026 Definitive Blueprint for ${primarySkill}`,
    slug: "2026-definitive-blueprint",
    status: "draft" as const,
    excerpt: `How ${document.identity.name} combines first-hand benchmarks, hub-and-spoke topic clusters, and connected JSON-LD schema to rank in Google and AI Search.`,
    seoTitle: `2026 Blueprint for ${primarySkill}`,
    seoDescription: `Step-by-step architecture and E-E-A-T benchmarks by ${document.identity.name}.`,
    coverMediaId: "",
    tags: [primarySkill, "E-E-A-T", "Topic Clusters"],
    blocks: [
     {
      id: "b1",
      type: "heading" as const,
      headingLevel: "h2" as const,
      text: "1. Why Hub-and-Spoke Architecture Wins in 2026",
      mediaId: "",
      items: [],
     },
     {
      id: "b2",
      type: "paragraph" as const,
      headingLevel: "h2" as const,
      text: "Search engines and LLM answer engines reward interconnected topic clusters backed by original testing and structured data.",
      mediaId: "",
      items: [],
     },
     {
      id: "b3",
      type: "list" as const,
      headingLevel: "h2" as const,
      text: "",
      mediaId: "",
      items: [
       "Publish canonical pillar guides from AI Content Writer Studio in 1 click.",
       "Embed interactive tools and copy-ready prompt packs to boost dwell time.",
       "Connect Person, WebSite, ItemList, and BlogPosting nodes via @graph JSON-LD.",
      ],
     },
    ],
   },
   {
    id: "demo-starter-post-2",
    title: `Inside Our ${secondarySkill} & Conversion Playbook`,
    slug: "conversion-and-engineering-playbook",
    status: "draft" as const,
    excerpt: `A practical teardown of high-craft component systems, sub-second page speed, and reader-first layouts that convert visitors into clients.`,
    seoTitle: `${secondarySkill} & Conversion Playbook`,
    seoDescription: `Production teardown and benchmarks by ${document.identity.name}.`,
    coverMediaId: "",
    tags: [secondarySkill, "Benchmarks", "Playbook"],
    blocks: [
     {
      id: "b2-1",
      type: "heading" as const,
      headingLevel: "h2" as const,
      text: "Designing for Clarity, Speed, and Authority",
      mediaId: "",
      items: [],
     },
     {
      id: "b2-2",
      type: "paragraph" as const,
      headingLevel: "h2" as const,
      text: "Every template in DoItWithAI Studio pairs distinct visual architecture with governed editing and instant article synchronization.",
      mediaId: "",
      items: [],
     },
    ],
   },
  ];
 }, [document.publishing.posts, document.skills, document.identity.name, publicBasePath]);
 const topicFilters = useMemo(() => {
  const set = new Set<string>();
  document.skills.forEach((s) => set.add(s.label));
  posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
  projects.forEach((pr) => pr.technologies.forEach((t) => set.add(t)));
  return Array.from(set).slice(0, 8);
 }, [document.skills, posts, projects]);
 const filteredPosts = useMemo(() => {
  return posts.filter((post) => {
   const matchesTopic =
    selectedTopic === "all" ||
    post.tags.some((t) => t.toLowerCase() === selectedTopic.toLowerCase()) ||
    post.title.toLowerCase().includes(selectedTopic.toLowerCase());
   const matchesQuery =
    !searchQuery.trim() ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
   return matchesTopic && matchesQuery;
  });
 }, [posts, searchQuery, selectedTopic]);
 const filteredProjects = useMemo(() => {
  return projects.filter((project) => {
   const matchesTopic =
    selectedTopic === "all" ||
    project.technologies.some((t) => t.toLowerCase() === selectedTopic.toLowerCase()) ||
    project.title.toLowerCase().includes(selectedTopic.toLowerCase());
   const matchesQuery =
    !searchQuery.trim() ||
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.summary.toLowerCase().includes(searchQuery.toLowerCase());
   return matchesTopic && matchesQuery;
  });
 }, [projects, searchQuery, selectedTopic]);
 const aboutPage = document.publishing.pages.find(
  (page) => page.slug === "about" && (!publicBasePath || page.status === "published")
 );
 const contact = document.content.contact;
 const activeReaderPost = useMemo(
  () => posts.find((p) => p.id === activeReaderPostId) ?? null,
  [posts, activeReaderPostId]
 );
 const starterPrompts = useMemo(() => {
  const primarySkill = document.skills[0]?.label || "AI SEO & Content Engineering";
  const secondarySkill = document.skills[1]?.label || "Full-Stack Web Systems";
  const leadProject = projects[0]?.title || "Flagship AI Workflow";
  return [
   {
    id: "prompt-pillar-cluster",
    category: "SEO & Topic Cluster Architecture",
    title: `${primarySkill} Pillar & Spoke Blueprint`,
    description: "Generates a hub-and-spoke topic cluster with E-E-A-T information gain and internal anchor mapping.",
    promptText: `Act as a Principal ${document.identity.role}. Design a 1-Pillar + 6-Spoke Topic Cluster around "${primarySkill}". Layer 4 hard constraints: (1) Include primary information-gain benchmarks, (2) Keep readability at Grade 7-9 with high burstiness, (3) Map bidirectional anchor text between every spoke and "${leadProject}", and (4) Output a connected JSON-LD @graph (BlogPosting + ItemList + Person). Avoid generic filler introductions.`,
   },
   {
    id: "prompt-ui-system",
    category: "UI/UX & Component Architecture",
    title: `${secondarySkill} High-Craft Interface Spec`,
    description: "Constraint-first UI prompt using named patterns, spacing tokens, and interactive states.",
    promptText: `Build a production-ready ${secondarySkill} interface modeled on ${document.identity.name}'s "${leadProject}". Default: dark slate glassmorphic command surface with 1px subtle borders and high-contrast typography. Constraints: (1) Sticky topic-filter bar with live search, (2) 3-up bento card grid with outcome metrics, (3) Inline article reader drawer, and (4) Copy-to-clipboard micro-interactions. Avoid stock hero illustrations and vague adjectives.`,
   },
   {
    id: "prompt-conversion-audit",
    category: "Conversion & Authority Audit",
    title: "E-E-A-T & Reader Conversion Teardown",
    description: "Audits any landing page or blog post for first-hand proof, citation density, and CTA clarity.",
    promptText: `Audit this page as ${document.identity.name} (${document.identity.role}). Evaluate: (1) First-screen value proposition clarity in under 5 seconds, (2) Verifiable E-E-A-T proof points and outcome metrics, (3) Contextual internal links to tools and case studies, and (4) Frictionless conversion paths. Provide 5 prioritized before/after rewrites.`,
   },
  ];
 }, [document.identity.name, document.identity.role, document.skills, projects]);
 const workflowPlaybooks = useMemo(
  () => [
   {
    id: "playbook-1",
    step: "PLAYBOOK 01",
    title: "Hub-and-Spoke Pillar Content & AI Citation Workflow",
    summary: "How we research, draft, and interlink pillar guides so both human readers and AI answer engines cite our work.",
    steps: [
     "Run 6-dimension Query Fan-Out research across primary, comparative, and troubleshooting sub-queries.",
     "Publish the canonical Pillar Guide in AI Content Writer Studio and sync it in 1 click via the Website Builder Bridge.",
     "Interlink 3–5 spoke articles and interactive tools using descriptive anchor text and verified external citations.",
    ],
   },
   {
    id: "playbook-2",
    step: "PLAYBOOK 02",
    title: "Constraint-Driven Prompt-to-Production UI System",
    summary: "Turning reusable prompt libraries and component tokens into shippable, high-converting digital products.",
    steps: [
     "Start with a strong named UI pattern default (2-column editorial feed, bento tool directory, or glassmorphic command hub).",
     "Layer 4–6 hard visual and functional constraints (live topic filtering, inline reader drawer, copy-ready prompt cards).",
     "Validate responsiveness, keyboard accessibility, and Core Web Vitals before publishing to production.",
    ],
   },
   {
    id: "playbook-3",
    step: "PLAYBOOK 03",
    title: "Connected JSON-LD @graph & E-E-A-T Entity Verification",
    summary: "Connecting Author (Person), Publication (WebSite), Tools (ItemList), and Articles (BlogPosting) into one machine-readable graph.",
    steps: [
     "Assign a stable @id to the Founder/Author Person node with verified role and sameAs social profile links.",
     "Declare an ItemList of interactive tools, digital products, and case studies visible on the page.",
     "Link every published BlogPosting back to the Founder @id and inspect the live JSON-LD payload prior to indexing.",
    ],
   },
  ],
  []
 );
 const jsonLdGraphString = useMemo(() => {
  const graph = {
   "@context": "https://schema.org",
   "@graph": [
    {
     "@type": "Person",
     "@id": "#founder",
     name: document.identity.name,
     jobTitle: document.identity.role,
     description: document.identity.intro,
     ...(contact.location ? { homeLocation: { "@type": "Place", name: contact.location } } : {}),
     ...(contact.socials.length > 0 ? { sameAs: contact.socials.map((s) => s.url) } : {}),
    },
    {
     "@type": "WebSite",
     "@id": "#website",
     name: `${document.identity.name} — ${document.identity.role}`,
     publisher: { "@id": "#founder" },
     inLanguage: "en-US",
    },
    {
     "@type": "ItemList",
     "@id": "#tools-and-projects",
     name: "Featured AI Tools, Products & Case Studies",
     numberOfItems: projects.length,
     itemListElement: projects.slice(0, 6).map((proj, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: proj.title,
      description: proj.summary,
      ...(proj.link ? { url: proj.link } : {}),
     })),
    },
    ...posts.slice(0, 5).map((post) => ({
     "@type": "BlogPosting",
     headline: post.title,
     description: post.excerpt || post.seoDescription || post.title,
     author: { "@id": "#founder" },
     publisher: { "@id": "#website" },
     keywords: post.tags.join(", "),
    })),
   ],
  };
  return JSON.stringify(graph, null, 2);
 }, [document.identity.name, document.identity.role, document.identity.intro, contact.location, contact.socials, projects, posts]);
 const handleCopyPrompt = (id: string, text: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
   navigator.clipboard.writeText(text).catch(() => undefined);
  }
  setCopiedPromptId(id);
  setTimeout(() => setCopiedPromptId((prev) => (prev === id ? null : prev)), 2200);
 };
 const handleCopySchema = () => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
   navigator.clipboard.writeText(jsonLdGraphString).catch(() => undefined);
  }
  setCopiedSchema(true);
  setTimeout(() => setCopiedSchema(false), 2200);
 };
 // ============================================================================
 // LAYOUT VARIANT A: CLASSIC BLOGGER.COM / EDITORIAL 2-COLUMN WITH STICKY SIDEBAR
 // ============================================================================
 if (template === "authority-niche-blog") {
  return (
   <div
    className="flagship-classic-blog-shell"
    style={{ background: "#f8fafc", color: "#0f172a", padding: "42px clamp(20px, 5vw, 68px)", }}
   >
    <div
     style={{ maxWidth: "1240px", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 2.1fr) minmax(280px, 1fr)", gap: "36px", alignItems: "start", }}
    >
     {/* Main 2/3 Blog & Review Stream */}
     <div style={{ display: "grid", gap: "28px" }}>
      <div
       style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0f172a", paddingBottom: "12px", }}
      >
       <strong style={{ fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563eb" }}>
        LATEST ARTICLES &amp; IN-DEPTH GUIDES ({filteredPosts.length})
       </strong>
       {selectedTopic !== "all" && (
        <button
         type="button"
         onClick={() => setSelectedTopic("all")}
         style={{ fontSize: "12px", color: "#2563eb", background: "none", border: 0, cursor: "pointer" }}
        >
         Clear filter ({selectedTopic}) ×
        </button>
       )}
      </div>
      {filteredPosts.length > 0 ? (
       filteredPosts.map((post, idx) => {
        const cover = document.media.assets.find((a) => a.id === post.coverMediaId);
        return (
         <article
          key={post.id}
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "26px", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)", display: "grid", gap: "12px", }}
         >
          {cover && (
           <div style={{ position: "relative", height: idx === 0 ? "260px" : "190px", borderRadius: "10px", overflow: "hidden" }}>
            <Image src={cover.url} alt={cover.alt} fill sizes="720px" unoptimized />
           </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", fontSize: "12px", color: "#64748b" }}>
           <span style={{ color: "#2563eb", fontWeight: 700 }}>
            {idx === 0 ? "FEATURED GUIDE" : "ARTICLE"}
           </span>
           <span>•</span>
           <span>{estimateReadingMinutes(post)} min read</span>
           {post.tags.map((tag) => (
            <span
             key={tag}
             style={{ padding: "2px 8px", borderRadius: "999px", background: "#eff6ff", color: "#1d4ed8", fontSize: "11px", fontWeight: 600, }}
            >
             #{tag}
            </span>
           ))}
          </div>
          <h3 style={{ margin: 0, fontSize: idx === 0 ? "26px" : "21px", lineHeight: 1.3, color: "#0f172a" }}>
           {post.title}
          </h3>
          <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.7, color: "#475569" }}>
           {post.excerpt || post.seoDescription || "Read the full step-by-step breakdown and benchmark analysis."}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
           <button
            type="button"
            onClick={() => setActiveReaderPostId(activeReaderPostId === post.id ? null : post.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "8px", background: activeReaderPostId === post.id ? "#2563eb" : "#eff6ff", color: activeReaderPostId === post.id ? "#ffffff" : "#1d4ed8", border: "1px solid #bfdbfe", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
           >
            <BookOpen size={14} />
            {activeReaderPostId === post.id ? "Close Inline Reader" : "Quick Read Inline"}
           </button>
           {publicBasePath ? (
            <a
             href={`${publicBasePath}/blog/${post.slug}`}
             style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#2563eb", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}
            >
             Continue reading <ArrowUpRight size={15} />
            </a>
           ) : (
            <button
             type="button"
             onClick={() => onOpenPost?.(post.id)}
             style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#2563eb", fontWeight: 700, fontSize: "14px", background: "none", border: 0, padding: 0, cursor: "pointer" }}
            >
             Read article preview <ArrowUpRight size={15} />
            </button>
           )}
          </div>
          {activeReaderPostId === post.id && (
           <div style={{ marginTop: "10px", paddingTop: "14px", borderTop: "1px solid #e2e8f0", display: "grid", gap: "10px", background: "#f8fafc", padding: "16px", borderRadius: "10px" }}>
            {post.blocks.map((block) =>
             block.type === "heading" ? (
              <h4 key={block.id} style={{ margin: "4px 0 0", fontSize: "17px", color: "#1e3a8a" }}>{block.text}</h4>
             ) : block.type === "list" ? (
              <ul key={block.id} style={{ margin: 0, paddingLeft: "18px", color: "#334155", fontSize: "13.5px", lineHeight: 1.65, display: "grid", gap: "5px" }}>
               {block.items.map((item, idx2) => <li key={idx2}>{item}</li>)}
              </ul>
             ) : (
              <p key={block.id} style={{ margin: 0, color: "#334155", fontSize: "14px", lineHeight: 1.7 }}>{block.text}</p>
             )
            )}
           </div>
          )}
         </article>
        );
       })
      ) : (
       <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "28px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "19px" }}>Publish Your First Blog Post</h3>
        <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>
         Open <strong>Content → Blog posts</strong> and click <strong>Write in AI Content Writer Studio</strong> to publish SEO-optimized articles into this classic 2-column blog feed.
        </p>
       </div>
      )}
      {/* Phase 3: Editorial Key Takeaways & E-E-A-T Pros/Cons Review Box */}
      <section
       id="key-takeaways"
       style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "4px solid #2563eb", borderRadius: "14px", padding: "24px", display: "grid", gap: "12px", }}
      >
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <strong style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#1d4ed8" }}>
         EXECUTIVE SUMMARY · KEY TAKEAWAYS
        </strong>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", background: "#dbeafe", padding: "3px 9px", borderRadius: "999px" }}>
         ✓ Fact-Checked &amp; First-Hand Tested
        </span>
       </div>
       <ul style={{ margin: 0, paddingLeft: "20px", display: "grid", gap: "8px", color: "#1e293b", fontSize: "14px", lineHeight: 1.65 }}>
        <li><strong>Hub-and-Spoke Architecture:</strong> Every pillar guide links to 3–5 supporting tutorials and interactive tools for topical authority.</li>
        <li><strong>First-Hand Benchmarks:</strong> All recommendations are grounded in hands-on testing by {document.identity.name} ({document.identity.role}).</li>
        <li><strong>Reader-First Formatting:</strong> Grade 7–9 readability, scannable comparison tables, and zero fluff intros.</li>
       </ul>
      </section>
      <section
       id="pros-cons-review"
       style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", display: "grid", gap: "16px", }}
      >
       <strong style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#0f172a" }}>
        E-E-A-T EDITORIAL VERDICT · PROS &amp; CONS MATRIX
       </strong>
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "18px", display: "grid", gap: "8px" }}>
         <strong style={{ color: "#15803d", fontSize: "14px" }}>✅ What Works in Production (Pros)</strong>
         <ul style={{ margin: 0, paddingLeft: "18px", color: "#166534", fontSize: "13px", lineHeight: 1.6, display: "grid", gap: "6px" }}>
          <li>1-click publishing from AI Content Writer Studio directly into structured blog feeds.</li>
          <li>Sticky sidebar navigation and table of contents reduce long-form bounce rates.</li>
          <li>Connected JSON-LD <code>@graph</code> links Author, Publication, Tools, and Articles.</li>
         </ul>
        </div>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "18px", display: "grid", gap: "8px" }}>
         <strong style={{ color: "#b91c1c", fontSize: "14px" }}>⚠️ Tradeoffs &amp; Considerations (Cons)</strong>
         <ul style={{ margin: 0, paddingLeft: "18px", color: "#991b1b", fontSize: "13px", lineHeight: 1.6, display: "grid", gap: "6px" }}>
          <li>Requires genuine first-hand benchmarks and original insights to maximize E-E-A-T lift.</li>
          <li>Topic clusters perform best when updated consistently with fresh spoke articles.</li>
         </ul>
        </div>
       </div>
      </section>
      {/* Phase 2: Interactive Side-by-Side Comparison Matrix Table */}
      {filteredProjects.length > 0 && (
       <section
        id="comparison-matrix"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", display: "grid", gap: "14px", overflowX: "auto" }}
       >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
         <strong style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563eb" }}>
          SIDE-BY-SIDE BENCHMARK COMPARISON MATRIX ({filteredProjects.length} TESTED)
         </strong>
         <span style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a", background: "#f1f5f9", padding: "3px 9px", borderRadius: "999px" }}>
          Updated Q4 2026 · Reproducible Lab Scoring
         </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
         <thead>
          <tr style={{ borderBottom: "2px solid #0f172a", color: "#0f172a" }}>
           <th style={{ padding: "10px 8px" }}>Tested Tool / Study</th>
           <th style={{ padding: "10px 8px" }}>Lab Verdict &amp; Score</th>
           <th style={{ padding: "10px 8px" }}>Key Capabilities</th>
           <th style={{ padding: "10px 8px" }}>Measured Outcome</th>
           <th style={{ padding: "10px 8px" }}>Action</th>
          </tr>
         </thead>
         <tbody>
          {filteredProjects.map((proj, idx) => (
           <tr key={proj.id} style={{ borderBottom: "1px solid #e2e8f0", background: idx === 0 ? "#eff6ff" : "transparent" }}>
            <td style={{ padding: "12px 8px", fontWeight: 700, color: "#0f172a" }}>
             {idx === 0 && <span style={{ display: "inline-block", marginRight: "6px", padding: "2px 6px", borderRadius: "4px", background: "#2563eb", color: "#ffffff", fontSize: "10px" }}>TOP PICK</span>}
             {proj.title}
            </td>
            <td style={{ padding: "12px 8px", color: "#1d4ed8", fontWeight: 600 }}>{proj.role || "9.6 / 10 Verified"}</td>
            <td style={{ padding: "12px 8px", color: "#334155" }}>{proj.technologies.slice(0, 3).join(" · ")}</td>
            <td style={{ padding: "12px 8px", color: "#475569" }}>{(proj.outcome || proj.summary).slice(0, 90)}</td>
            <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
             {proj.link ? (
              <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
               Test Tool ↗
              </a>
             ) : (
              <span style={{ color: "#64748b" }}>Included</span>
             )}
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </section>
      )}
      {/* Recommended Tools / Case Studies Table inside Main Column */}
      {filteredProjects.length > 0 && (
       <section id="projects" style={{ marginTop: "16px", display: "grid", gap: "16px" }}>
        <div style={{ borderBottom: "2px solid #0f172a", paddingBottom: "10px" }}>
         <strong style={{ fontSize: "13px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#2563eb" }}>
          RECOMMENDED TOOLS, RESOURCES &amp; CASE STUDIES
         </strong>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
         {filteredProjects.map((project, i) => (
          <article
           key={project.id}
           style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "grid", gap: "8px", }}
          >
           <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb" }}>
            RESOURCE #{String(i + 1).padStart(2, "0")}
           </span>
           <h4 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{project.title}</h4>
           <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>{project.summary}</p>
           <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {project.technologies.map((t) => (
             <span key={t} style={{ fontSize: "11px", padding: "2px 8px", background: "#f1f5f9", borderRadius: "6px", color: "#334155" }}>
              {t}
             </span>
            ))}
           </div>
          </article>
         ))}
        </div>
       </section>
      )}
     </div>
     {/* Sticky 1/3 Classic Blogger Sidebar */}
     <aside style={{ display: "grid", gap: "20px", position: "sticky", top: "24px" }} aria-label="Blog sidebar">
      {/* Phase 3: Sticky Table of Contents (ToC) & Quick Jump Widget */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", display: "grid", gap: "10px" }}>
       <strong style={{ fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb" }}>
        STICKY TABLE OF CONTENTS
       </strong>
       <nav aria-label="Table of contents" style={{ display: "grid", gap: "7px", fontSize: "13px" }}>
        <a href="#hero" style={{ color: "#0f172a", textDecoration: "none", fontWeight: 600 }}>01. Featured Editorial Dispatch</a>
        <a href="#key-takeaways" style={{ color: "#334155", textDecoration: "none" }}>02. Key Takeaways &amp; Verdict</a>
        <a href="#pros-cons-review" style={{ color: "#334155", textDecoration: "none" }}>03. E-E-A-T Pros &amp; Cons Matrix</a>
        <a href="#comparison-matrix" style={{ color: "#334155", textDecoration: "none" }}>04. Side-by-Side Comparison Matrix</a>
        <a href="#projects" style={{ color: "#334155", textDecoration: "none" }}>05. Tested Tools &amp; Benchmarks</a>
        <a href="#about" style={{ color: "#334155", textDecoration: "none" }}>05. Author Credentials &amp; Bio</a>
        <a href="#contact" style={{ color: "#334155", textDecoration: "none" }}>06. Weekly Newsletter Signup</a>
       </nav>
      </div>
      {/* Search Widget */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
       <strong style={{ display: "block", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px", color: "#0f172a" }}>
        SEARCH THIS BLOG
       </strong>
       <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #cbd5e1", borderRadius: "9px", padding: "8px 11px", background: "#f8fafc" }}>
        <Search size={15} color="#64748b" />
        <input
         type="search"
         value={searchQuery}
         onChange={(e) => setSearchQuery(e.target.value)}
         placeholder="Search articles & topics…"
         style={{ border: 0, background: "transparent", width: "100%", outline: "none", fontSize: "13px", color: "#0f172a" }}
        />
       </div>
      </div>
      {/* Author E-E-A-T Bio Widget */}
      <div id="about" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "22px", display: "grid", gap: "10px" }}>
       <strong style={{ fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb" }}>
        ABOUT THE AUTHOR
       </strong>
       <h4 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{document.identity.name}</h4>
       <small style={{ color: "#2563eb", fontWeight: 600 }}>{document.identity.role}</small>
       <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
        {document.content.about.body || document.identity.intro}
       </p>
       {document.publishing.pages.length > 0 && (
        <div style={{ display: "grid", gap: "6px", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
         <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", color: "#64748b", textTransform: "uppercase" }}>
          EDITORIAL PAGES &amp; DISCLOSURES
         </span>
         {document.publishing.pages
          .filter((pg) => !publicBasePath || pg.status === "published")
          .map((pg) =>
           publicBasePath ? (
            <a key={pg.id} href={`${publicBasePath}/pages/${pg.slug}`} style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
             → {pg.navigationLabel || pg.title}
            </a>
           ) : (
            <button key={pg.id} type="button" onClick={() => onOpenPage?.(pg.id)} style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb", background: "none", border: 0, padding: 0, textAlign: "left", cursor: "pointer" }}>
             → {pg.navigationLabel || pg.title}
            </button>
           )
          )}
        </div>
       )}
      </div>
      {/* Categories / Topic Clusters Widget */}
      {topicFilters.length > 0 && (
       <div id="skills" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", display: "grid", gap: "10px" }}>
        <strong style={{ fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#0f172a" }}>
         TOPIC CATEGORIES
        </strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
         <button
          type="button"
          onClick={() => setSelectedTopic("all")}
          style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: selectedTopic === "all" ? "#2563eb" : "#f8fafc", color: selectedTopic === "all" ? "#ffffff" : "#334155", fontSize: "12px", fontWeight: 600, cursor: "pointer", }}
         >
          All ({posts.length})
         </button>
         {topicFilters.map((topic) => (
          <button
           key={topic}
           type="button"
           onClick={() => setSelectedTopic(topic)}
           style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: selectedTopic === topic ? "#2563eb" : "#f8fafc", color: selectedTopic === topic ? "#ffffff" : "#334155", fontSize: "12px", cursor: "pointer", }}
          >
           {topic}
          </button>
         ))}
        </div>
       </div>
      )}
      {/* Newsletter / Contact Sidebar Box */}
      <div id="contact" style={{ background: "#1e293b", color: "#f8fafc", borderRadius: "14px", padding: "22px", display: "grid", gap: "10px" }}>
       <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#60a5fa" }}>
        WEEKLY DISPATCH
       </span>
       <h4 style={{ margin: 0, fontSize: "18px" }}>{contact.heading || "Subscribe to the Newsletter"}</h4>
       <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.55 }}>
        Get new research guides, SEO experiments, and practical templates delivered straight to your inbox.
       </p>
       {contact.email && (
        <a
         href={`mailto:${contact.email}`}
         style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 14px", borderRadius: "9px", background: "#3b82f6", color: "#ffffff", fontWeight: 700, fontSize: "13px", textDecoration: "none", }}
        >
         <Mail size={15} /> {contact.cta || "Subscribe / Contact"}
        </a>
       )}
      </div>
     </aside>
    </div>
   </div>
  );
 }
 // ============================================================================
 // LAYOUT VARIANT B: TRUE DOITWITHAI FLAGSHIP, GLASSMORPHISM, KO-FI & SAAS HUB
 // ============================================================================
 return (
  <div
   className={`flagship-sections-root flagship-body-${template}`}
   style={{ background: meta.surfaceBg, color: "#f8fafc", padding: "36px clamp(20px, 5vw, 68px) 72px", display: "grid", gap: "52px", }}
  >
   {/* 1. Interactive DoItWithAI Tool, Article & Topic Finder Bar */}
   <section
    aria-label="Interactive Topic and Tool Explorer"
    style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "18px", padding: "22px 24px", backdropFilter: "blur(20px)", display: "grid", gap: "16px", }}
   >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
     <div>
      <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
       INTERACTIVE DIRECTORY &amp; TOPIC EXPLORER
      </span>
      <h2 style={{ margin: "4px 0 0", fontSize: "20px" }}>
       {template === "doitwithai-flagship"
        ? "Find AI Tools, SEO Playbooks & Research Guides"
        : template === "micro-saas-launchpad"
         ? "Explore Product Modules, Benchmarks & Docs"
         : template === "founder-authority-brand"
          ? "Browse Creator Resources, Templates & Member Posts"
          : "Explore Featured Work, Insights & Capabilities"}
      </h2>
     </div>
     <div
      style={{ display: "flex", alignItems: "center", gap: "8px", border: `1px solid ${meta.borderColor}`, borderRadius: "10px", padding: "8px 12px", background: "rgba(5, 9, 20, 0.65)", minWidth: "240px", }}
     >
      <Search size={15} color={meta.accentColor} />
      <input
       type="search"
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       placeholder="Filter articles, tools, or skills…"
       style={{ border: 0, background: "transparent", color: "#f8fafc", fontSize: "13px", outline: "none", width: "100%", }}
      />
     </div>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
     <button
      type="button"
      onClick={() => setSelectedTopic("all")}
      style={{ padding: "6px 12px", borderRadius: "999px", border: `1px solid ${selectedTopic === "all" ? meta.accentColor : meta.borderColor}`, background: selectedTopic === "all" ? meta.accentColor : "rgba(255,255,255,0.03)", color: selectedTopic === "all" ? "#040814" : "#cbd5e1", fontSize: "12px", fontWeight: 700, cursor: "pointer", }}
     >
      All Topics ({posts.length + projects.length})
     </button>
     {topicFilters.map((topic) => (
      <button
       key={topic}
       type="button"
       onClick={() => setSelectedTopic(topic)}
       style={{ padding: "6px 12px", borderRadius: "999px", border: `1px solid ${selectedTopic === topic ? meta.accentColor : meta.borderColor}`, background: selectedTopic === topic ? meta.accentColor : "rgba(255,255,255,0.03)", color: selectedTopic === topic ? "#040814" : "#cbd5e1", fontSize: "12px", fontWeight: 600, cursor: "pointer", }}
      >
       {topic}
      </button>
     ))}
    </div>
   </section>
   {/* 2. Featured Articles & Topic Cluster Hub (`#blog`) */}
   {(filteredPosts.length > 0 || editing || isBlogFirstTemplate(template)) && (
    <section id="blog" style={{ display: "grid", gap: "20px" }}>
     <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
      <div>
       <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
        {template === "creator-newsletter-hub" ? "ISSUE ARCHIVE & ESSAYS" : "EDITORIAL & SEO RESEARCH HUB"}
       </span>
       <h2 style={{ margin: "6px 0 0", fontSize: "clamp(24px, 3.2vw, 36px)" }}>
        {template === "creator-newsletter-hub"
         ? "Latest Newsletter Dispatches"
         : "Featured Articles & Pillar Guides"}
       </h2>
      </div>
      {publicBasePath ? (
       <a
        href={`${publicBasePath}/blog`}
        style={{ color: meta.accentColor, fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
       >
        View full article archive ({posts.length}) →
       </a>
      ) : (
       posts.length > 0 && (
        <button
         type="button"
         onClick={() => onOpenPost?.("__index__")}
         style={{ color: meta.accentColor, background: "none", border: 0, fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
        >
         Open Blog Listing Preview ({posts.length}) →
        </button>
       )
      )}
     </header>
     {/* Phase 2 Interactive Inline Article Reader Drawer */}
     {activeReaderPost && (
      <article
       id="article-reader-drawer"
       aria-label={`Reading ${activeReaderPost.title}`}
       style={{ background: "rgba(7, 12, 28, 0.94)", border: `2px solid ${meta.accentColor}`, borderRadius: "18px", padding: "28px", boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)", display: "grid", gap: "16px", }}
      >
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
         <span style={{ padding: "4px 10px", borderRadius: "999px", background: meta.accentColor, color: "#040814", fontSize: "11px", fontWeight: 800 }}>
          INLINE ARTICLE READER
         </span>
         <span style={{ fontSize: "12px", color: "#94a3b8" }}>
          {estimateReadingMinutes(activeReaderPost)} min read · By {document.identity.name}
         </span>
        </div>
        <button
         type="button"
         onClick={() => setActiveReaderPostId(null)}
         style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${meta.borderColor}`, background: "rgba(255,255,255,0.06)", color: "#f8fafc", fontSize: "12px", fontWeight: 700, cursor: "pointer", }}
        >
         Close Reader ×
        </button>
       </div>
       <h3 style={{ margin: 0, fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1.3 }}>{activeReaderPost.title}</h3>
       {activeReaderPost.excerpt && (
        <p style={{ margin: 0, fontSize: "15px", color: "#cbd5e1", lineHeight: 1.65, fontStyle: "italic" }}>
         {activeReaderPost.excerpt}
        </p>
       )}
       <div style={{ borderTop: `1px solid ${meta.borderColor}`, paddingTop: "16px", display: "grid", gap: "14px" }}>
        {activeReaderPost.blocks.map((block) => {
         if (block.type === "heading") {
          return (
           <h4 key={block.id} style={{ margin: "8px 0 0", fontSize: "19px", color: meta.accentColor }}>
            {block.text}
           </h4>
          );
         }
         if (block.type === "quote") {
          return (
           <blockquote
            key={block.id}
            style={{ margin: 0, padding: "12px 16px", borderLeft: `3px solid ${meta.accentColor}`, background: "rgba(255,255,255,0.03)", borderRadius: "0 10px 10px 0", color: "#e2e8f0", fontSize: "14px", lineHeight: 1.65, }}
           >
            {block.text}
           </blockquote>
          );
         }
         if (block.type === "list") {
          return (
           <ul key={block.id} style={{ margin: 0, paddingLeft: "20px", display: "grid", gap: "6px", color: "#cbd5e1", fontSize: "14px", lineHeight: 1.65 }}>
            {block.items.map((item, i) => (
             <li key={i}>{item}</li>
            ))}
           </ul>
          );
         }
         return (
          <p key={block.id} style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: 1.75 }}>
           {block.text}
          </p>
         );
        })}
       </div>
      </article>
     )}
     {filteredPosts.length > 0 ? (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "18px" }}>
       {filteredPosts.slice(0, 6).map((post, idx) => {
        const cover = document.media.assets.find((a) => a.id === post.coverMediaId);
        return (
         <article
          key={post.id}
          style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "16px", overflow: "hidden", backdropFilter: "blur(18px)", display: "flex", flexDirection: "column", justifyContent: "space-between", }}
         >
          <div>
           {cover ? (
            <div style={{ position: "relative", height: "175px" }}>
             <Image src={cover.url} alt={cover.alt} fill sizes="400px" unoptimized />
            </div>
           ) : (
            <div
             style={{ height: "96px", padding: "18px", background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(56,189,248,0.08))", display: "flex", alignItems: "center", justifyContent: "space-between", }}
            >
             <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: meta.accentColor }}>
              {template === "creator-newsletter-hub"
               ? `ISSUE #${String(posts.length - idx).padStart(2, "0")}`
               : `GUIDE #${String(idx + 1).padStart(2, "0")}`}
             </span>
             <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {estimateReadingMinutes(post)} min read
             </span>
            </div>
           )}
           <div style={{ padding: "20px", display: "grid", gap: "10px" }}>
            {post.tags.length > 0 && (
             <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {post.tags.slice(0, 3).map((tag) => (
               <span
                key={tag}
                style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", color: "#cbd5e1", }}
               >
                #{tag}
               </span>
              ))}
             </div>
            )}
            <h3 style={{ margin: 0, fontSize: "19px", lineHeight: 1.35 }}>{post.title}</h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>
             {post.excerpt || post.seoDescription || "Structured E-E-A-T article synced from DoItWithAI Content Writer Studio."}
            </p>
           </div>
          </div>
          <div style={{ padding: "0 20px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
           <button
            type="button"
            onClick={() => setActiveReaderPostId(activeReaderPostId === post.id ? null : post.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 11px", borderRadius: "8px", background: activeReaderPostId === post.id ? meta.accentColor : "rgba(255,255,255,0.06)", color: activeReaderPostId === post.id ? "#040814" : "#f8fafc", border: `1px solid ${meta.borderColor}`, fontSize: "12px", fontWeight: 700, cursor: "pointer", }}
           >
            <BookOpen size={13} />
            {activeReaderPostId === post.id ? "Close Reader" : "Quick Read in Page"}
           </button>
           {publicBasePath ? (
            <a
             href={`${publicBasePath}/blog/${post.slug}`}
             style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: meta.accentColor, fontSize: "12px", fontWeight: 700, textDecoration: "none" }}
            >
             Full page <ArrowUpRight size={13} />
            </a>
           ) : (
            <button
             type="button"
             onClick={() => onOpenPost?.(post.id)}
             style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: meta.accentColor, background: "none", border: 0, padding: 0, fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
            >
             Open route <ArrowUpRight size={13} />
            </button>
           )}
          </div>
         </article>
        );
       })}
      </div>
     ) : (
      <div
       style={{ padding: "24px", borderRadius: "16px", border: `1px dashed ${meta.borderColor}`, background: "rgba(255,255,255,0.02)", color: "#94a3b8", fontSize: "13px", }}
      >
       No published articles match your filter yet. Open <strong>Content → Blog posts</strong> and launch the{" "}
       <strong style={{ color: "#f8fafc" }}>AI Content Writer Studio</strong> to publish ranking articles here in 1 click.
      </div>
     )}
    </section>
   )}
   {/* 3. Tools, Digital Products & Case Studies Bento Grid (`#projects`) */}
   {document.content.visibility.projects && (filteredProjects.length > 0 || editing) && (
    <section id="projects" style={{ display: "grid", gap: "20px" }}>
     <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
      <div>
       <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
        {template === "doitwithai-flagship" || template === "micro-saas-launchpad"
         ? "FEATURED AI TOOLS, PRODUCTS & WORKFLOWS"
         : template === "founder-authority-brand"
          ? "CREATOR SHOP, TEMPLATES & CASE STUDIES"
          : "VERIFIED CASE STUDIES & CLIENT OUTCOMES"}
       </span>
       <h2 style={{ margin: "6px 0 0", fontSize: "clamp(24px, 3.2vw, 36px)" }}>
        {template === "doitwithai-flagship"
         ? "Interactive Tools & Flagship Builds"
         : template === "founder-authority-brand"
          ? "Digital Products, Resources & Proof"
          : "Selected Projects & Case Studies"}
       </h2>
      </div>
      {publicBasePath && projects.length > 0 && (
       <a
        href={`${publicBasePath}/projects`}
        style={{ color: meta.accentColor, fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
       >
        Explore all {projects.length} items →
       </a>
      )}
     </header>
     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
      {filteredProjects.map((project, idx) => {
       const cover = document.media.assets.find((a) => project.mediaIds.includes(a.id));
       return (
        <article
         key={project.id}
         style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "16px", padding: "22px", backdropFilter: "blur(18px)", display: "grid", gap: "12px", }}
        >
         {cover && (
          <div style={{ position: "relative", height: "165px", borderRadius: "10px", overflow: "hidden" }}>
           <Image src={cover.url} alt={cover.alt} fill sizes="420px" unoptimized />
          </div>
         )}
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: meta.accentColor }}>
           {project.role || `BUILD #${String(idx + 1).padStart(2, "0")}`}
          </span>
          {project.period && <small style={{ color: "#94a3b8", fontSize: "11px" }}>{project.period}</small>}
         </div>
         <h3 style={{ margin: 0, fontSize: "20px" }}>{project.title}</h3>
         <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>{project.summary}</p>
         {project.outcome && (
          <div
           style={{ padding: "9px 12px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.24)", fontSize: "12px", color: "#6ee7b7", }}
          >
           <strong>Outcome:</strong> {project.outcome}
          </div>
         )}
         <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {project.technologies.map((tech) => (
           <span
            key={tech}
            style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "999px", border: `1px solid ${meta.borderColor}`, background: "rgba(255,255,255,0.03)", color: "#e2e8f0", }}
           >
            {tech}
           </span>
          ))}
         </div>
         <div style={{ display: "flex", gap: "14px", marginTop: "4px" }}>
          {publicBasePath && project.caseStudySlug && (
           <a
            href={`${publicBasePath}/projects/${project.caseStudySlug}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: meta.accentColor, fontSize: "13px", fontWeight: 700, textDecoration: "none" }}
           >
            Read case study <ArrowUpRight size={14} />
           </a>
          )}
          {project.link && (
           <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#f8fafc", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
           >
            Launch live <ArrowUpRight size={14} />
           </a>
          )}
         </div>
        </article>
       );
      })}
     </div>
    </section>
   )}
   {/* 4. Capabilities & Topic Authority Matrix (`#skills`) */}
   {document.content.visibility.skills && (document.skills.length > 0 || editing) && (
    <section id="skills" style={{ display: "grid", gap: "18px" }}>
     <header>
      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
       CORE CAPABILITIES &amp; DOMAIN PILLARS
      </span>
      <h2 style={{ margin: "6px 0 0", fontSize: "clamp(22px, 2.8vw, 32px)" }}>
       What Powers This Platform
      </h2>
     </header>
     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "14px" }}>
      {document.skills.map((skill, idx) => (
       <article
        key={skill.id}
        style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "14px", padding: "18px", display: "grid", gap: "8px", }}
       >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
         <span style={{ fontSize: "11px", fontFamily: "ui-monospace, monospace", color: meta.accentColor }}>
          PILLAR 0{idx + 1}
         </span>
         <span style={{ fontSize: "11px", color: "#94a3b8" }}>Level {skill.level}/5</span>
        </div>
        <h3 style={{ margin: 0, fontSize: "17px" }}>{skill.label}</h3>
        <div style={{ height: "5px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
         <div style={{ width: `${skill.level * 20}%`, height: "100%", background: meta.accentColor }} />
        </div>
       </article>
      ))}
     </div>
    </section>
   )}
   {/* 5. About & Experience Authority Split (`#about` & `#experience`) */}
   {(document.content.visibility.about || document.content.visibility.experience) && (
    <section
     id="about"
     style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", }}
    >
     {document.content.visibility.about && (
      <div
       style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "18px", padding: "26px", display: "grid", gap: "12px", }}
      >
       <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
        ABOUT &amp; E-E-A-T CREDENTIALS
       </span>
       <h2 style={{ margin: 0, fontSize: "24px" }}>{document.content.about.heading}</h2>
       <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: 1.7 }}>
        {document.content.about.body || document.identity.intro}
       </p>
       {aboutPage && (
        <div>
         {publicBasePath ? (
          <a
           href={`${publicBasePath}/pages/about`}
           style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: meta.accentColor, fontWeight: 700, fontSize: "13px", textDecoration: "none" }}
          >
           Read full profile <ArrowUpRight size={14} />
          </a>
         ) : (
          <button
           type="button"
           onClick={() => onOpenPage?.(aboutPage.id)}
           style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: meta.accentColor, background: "none", border: 0, padding: 0, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
          >
           Preview detailed About page <ArrowUpRight size={14} />
          </button>
         )}
        </div>
       )}
      </div>
     )}
     {document.content.visibility.experience && (document.content.experience.length > 0 || document.content.education.length > 0) && (
      <div
       id="experience"
       style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "18px", padding: "26px", display: "grid", gap: "14px", }}
      >
       <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
        TRACK RECORD &amp; MILESTONES
       </span>
       {document.content.experience.map((exp) => (
        <div key={exp.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
         <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }}>
          <strong style={{ color: "#f8fafc", fontSize: "15px" }}>{exp.role}</strong>
          <span>{exp.period}</span>
         </div>
         {exp.organization && <small style={{ color: meta.accentColor }}>{exp.organization}</small>}
         <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#cbd5e1", lineHeight: 1.55 }}>{exp.summary}</p>
        </div>
       ))}
      </div>
     )}
    </section>
   )}
   {/* 5A-1. Phase 4 — Ko-fi Creator Membership, Support Goal Bar & Supporter Wall (`founder-authority-brand`) */}
   {template === "founder-authority-brand" && (
    <section
     id="kofi-creator-hub"
     style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "18px", padding: "28px", display: "grid", gap: "22px", }}
    >
     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
      <div>
       <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
        KO-FI CREATOR MEMBERSHIP, TIP JAR &amp; DIGITAL SHOP
       </span>
       <h2 style={{ margin: "6px 0 0", fontSize: "clamp(22px, 2.8vw, 32px)" }}>
        Fuel Independent Research, Open Tools &amp; Creator Drops
       </h2>
      </div>
      <span style={{ padding: "5px 12px", borderRadius: "999px", background: "rgba(167, 139, 250, 0.16)", border: `1px solid ${meta.borderColor}`, color: meta.accentColor, fontSize: "12px", fontWeight: 700 }}>
       0% Platform Tip Fee · Instant Creator Access
      </span>
     </div>
     <div style={{ background: "rgba(9, 13, 31, 0.72)", border: `1px solid ${meta.borderColor}`, borderRadius: "14px", padding: "18px 20px", display: "grid", gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
       <strong>Monthly Open-Tool &amp; Research Server Goal</strong>
       <span style={{ color: meta.accentColor, fontWeight: 800 }}>78% Completed ($780 / $1,000)</span>
      </div>
      <div style={{ height: "10px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
       <div style={{ width: "78%", height: "100%", background: "linear-gradient(90deg, #a78bfa, #6366f1)", borderRadius: "999px" }} />
      </div>
      <small style={{ color: "#94a3b8", fontSize: "12px" }}>
       Every coffee and membership directly funds free AI tools, deep-dive benchmarks, and open templates.
      </small>
     </div>
     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
      {[
       {
        name: "☕ $5 Coffee",
        price: "$5 one-time or /mo",
        perks: ["Supporter badge on the Creator Wall", "Access to supporter-only build logs", "Direct vote on next tool release"],
       },
       {
        name: "⚡ $15 Pro Member",
        price: "$15 / month",
        perks: ["Full downloadable template & prompt pack vault", "Private workflow teardown videos", "Priority Q&A and feature requests"],
       },
       {
        name: "🚀 $45 VIP Sponsor",
        price: "$45 / month",
        perks: ["Monthly 1:1 architecture or SEO office hours", "Logo & link featured in newsletter + sidebar", "All Pro Member digital shop downloads included"],
       },
      ].map((tier) => {
       const active = selectedSupportTier === tier.name;
       return (
        <div
         key={tier.name}
         onClick={() => setSelectedSupportTier(tier.name)}
         style={{ background: active ? "rgba(167, 139, 250, 0.14)" : "rgba(255,255,255,0.03)", border: `2px solid ${active ? meta.accentColor : meta.borderColor}`, borderRadius: "14px", padding: "20px", cursor: "pointer", display: "grid", gap: "10px", }}
        >
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: "17px" }}>{tier.name}</strong>
          <span style={{ fontSize: "12px", color: meta.accentColor, fontWeight: 700 }}>{tier.price}</span>
         </div>
         <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "#cbd5e1", lineHeight: 1.6, display: "grid", gap: "5px" }}>
          {tier.perks.map((perk) => (
           <li key={perk}>{perk}</li>
          ))}
         </ul>
         <a
          href={contact.email ? `mailto:${contact.email}?subject=${encodeURIComponent(`Join ${tier.name}`)}` : "#contact"}
          style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px 14px", borderRadius: "9px", background: active ? meta.accentColor : "rgba(255,255,255,0.08)", color: active ? "#040814" : "#f8fafc", fontWeight: 800, fontSize: "12px", textDecoration: "none", }}
         >
          <Heart size={14} /> Select {tier.name}
         </a>
        </div>
       );
      })}
     </div>
    </section>
   )}
   {/* 5A-2. Phase 5 — Substack Newsletter Tier Comparison & Sponsor Slot Card (`creator-newsletter-hub`) */}
   {template === "creator-newsletter-hub" && (
    <section
     id="newsletter-tiers"
     style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "18px", padding: "28px", display: "grid", gap: "20px", }}
    >
     <div>
      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
       READER MEMBERSHIP &amp; SPONSORSHIP TIERS
      </span>
      <h2 style={{ margin: "6px 0 0", fontSize: "clamp(22px, 2.8vw, 32px)" }}>
       Subscribe to the Dispatch or Sponsor an Upcoming Issue
      </h2>
     </div>
     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
      <div style={{ padding: "20px", borderRadius: "14px", border: `1px solid ${meta.borderColor}`, background: "rgba(255,255,255,0.02)", display: "grid", gap: "8px" }}>
       <strong style={{ fontSize: "17px" }}>Free Weekly Dispatch</strong>
       <span style={{ color: meta.accentColor, fontSize: "13px", fontWeight: 700 }}>$0 / forever</span>
       <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
        Weekly public essays, curated AI &amp; SEO breakdowns, and public issue archive access.
       </p>
      </div>
      <div style={{ padding: "20px", borderRadius: "14px", border: `2px solid ${meta.accentColor}`, background: "rgba(251, 113, 133, 0.1)", display: "grid", gap: "8px" }}>
       <strong style={{ fontSize: "17px" }}>Full-Access Insider</strong>
       <span style={{ color: meta.accentColor, fontSize: "13px", fontWeight: 700 }}>$12 / month</span>
       <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
        Deep-dive teardown issues, private prompt &amp; template downloads, and subscriber comment threads.
       </p>
      </div>
      <div style={{ padding: "20px", borderRadius: "14px", border: `1px solid ${meta.borderColor}`, background: "rgba(255,255,255,0.02)", display: "grid", gap: "8px" }}>
       <strong style={{ fontSize: "17px" }}>Primary Issue Sponsor</strong>
       <span style={{ color: meta.accentColor, fontSize: "13px", fontWeight: 700 }}>Book a Slot</span>
       <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
        Put your AI tool, SaaS product, or agency in front of high-intent builders and decision-makers.
       </p>
      </div>
     </div>
    </section>
   )}
   {/* 5A-3. Phase 6 — Frosted Glassmorphism ROI Estimator & Productized Packages (`consultant-lead-engine` & `startup-service-agency`) */}
   {(template === "consultant-lead-engine" || template === "startup-service-agency") && (
    <section
     id="advisory-roi-engine"
     style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "18px", padding: "28px", backdropFilter: "blur(22px)", display: "grid", gap: "22px", }}
    >
     <div>
      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
       INTERACTIVE ROI ESTIMATOR &amp; PRODUCTIZED ENGAGEMENTS
      </span>
      <h2 style={{ margin: "6px 0 0", fontSize: "clamp(22px, 2.8vw, 32px)" }}>
       Estimate Your Automation &amp; Growth Leverage
      </h2>
     </div>
     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", alignItems: "center" }}>
      <div style={{ display: "grid", gap: "14px", padding: "20px", borderRadius: "14px", background: "rgba(5, 9, 20, 0.65)", border: `1px solid ${meta.borderColor}` }}>
       <label style={{ display: "grid", gap: "6px", fontSize: "13px" }}>
        <span>Team Size: <strong>{roiTeamSize} contributors</strong></span>
        <input
         type="range"
         min={1}
         max={25}
         value={roiTeamSize}
         onChange={(e) => setRoiTeamSize(Number(e.target.value))}
        />
       </label>
       <label style={{ display: "grid", gap: "6px", fontSize: "13px" }}>
        <span>Hours Saved per Person / Week: <strong>{roiHoursSaved} hrs</strong></span>
        <input
         type="range"
         min={2}
         max={25}
         value={roiHoursSaved}
         onChange={(e) => setRoiHoursSaved(Number(e.target.value))}
        />
       </label>
      </div>
      <div style={{ padding: "22px", borderRadius: "14px", background: "rgba(56, 189, 248, 0.1)", border: `1px solid ${meta.accentColor}`, display: "grid", gap: "8px" }}>
       <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: meta.accentColor }}>
        PROJECTED MONTHLY CAPACITY UNLOCKED
       </span>
       <strong style={{ fontSize: "32px", color: "#f8fafc" }}>
        {roiTeamSize * roiHoursSaved * 4} hrs / month
       </strong>
       <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.55 }}>
        Equivalent to <strong>~${(roiTeamSize * roiHoursSaved * 4 * 75).toLocaleString()}/mo</strong> in reclaimed engineering &amp; editorial output at $75/hr blended cost.
       </p>
      </div>
     </div>
    </section>
   )}
   {/* 5A-4. Phase 7 — Interactive AI Tool Sandbox & Changelog (`micro-saas-launchpad`) */}
   {template === "micro-saas-launchpad" && (
    <section
     id="saas-sandbox"
     style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "18px", padding: "28px", display: "grid", gap: "18px", }}
    >
     <div>
      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
       INTERACTIVE AI WORKFLOW SANDBOX &amp; RELEASE TELEMETRY
      </span>
      <h2 style={{ margin: "6px 0 0", fontSize: "clamp(22px, 2.8vw, 32px)" }}>
       Test the Workflow Engine Live in Your Browser
      </h2>
     </div>
     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
      <div style={{ display: "grid", gap: "10px", padding: "18px", borderRadius: "14px", background: "rgba(4, 9, 20, 0.78)", border: `1px solid ${meta.borderColor}` }}>
       <label style={{ fontSize: "12px", fontWeight: 700, color: meta.accentColor }}>
        ENTER TARGET NICHE OR PRODUCT TOPIC
       </label>
       <input
        type="text"
        value={sandboxInput}
        onChange={(e) => setSandboxInput(e.target.value)}
        style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${meta.borderColor}`, background: "rgba(255,255,255,0.04)", color: "#f8fafc", fontSize: "13px" }}
       />
       <small style={{ color: "#94a3b8", fontSize: "12px" }}>
        Generates instant hub-and-spoke architecture + connected schema preview on the right.
       </small>
      </div>
      <div style={{ padding: "18px", borderRadius: "14px", background: "rgba(34, 211, 238, 0.08)", border: `1px solid ${meta.accentColor}`, display: "grid", gap: "6px", fontSize: "13px" }}>
       <strong style={{ color: meta.accentColor }}>Generated Blueprint for &ldquo;{sandboxInput || "AI SaaS"}&rdquo;:</strong>
       <div>• <strong>Pillar Guide:</strong> The 2026 Definitive Guide to {sandboxInput || "AI SaaS"}</div>
       <div>• <strong>Interactive Tool:</strong> {sandboxInput || "AI"} ROI &amp; Readiness Diagnostic</div>
       <div>• <strong>Schema Graph:</strong> <code>SoftwareApplication</code> + <code>ItemList</code> + <code>BlogPosting</code></div>
      </div>
     </div>
    </section>
   )}
   {/* 5B. Phase 2 — Starter Prompt Library & Copy-to-Clipboard Cards (`#prompt-library`) */}
   {(template === "doitwithai-flagship" || template === "micro-saas-launchpad" || template === "founder-authority-brand") && (
    <section id="prompt-library" style={{ display: "grid", gap: "20px" }}>
     <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
      <div>
       <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
        DOITWITHAI PROMPT LIBRARY &amp; REUSABLE WORKFLOWS
       </span>
       <h2 style={{ margin: "6px 0 0", fontSize: "clamp(22px, 2.8vw, 32px)" }}>
        Copy-Ready Prompt Packs &amp; Execution Systems
       </h2>
      </div>
      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
       Constraint-layered prompts modeled on production AI workflows
      </span>
     </header>
     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "18px" }}>
      {starterPrompts.map((item) => {
       const isCopied = copiedPromptId === item.id;
       return (
        <article
         key={item.id}
         style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px", }}
        >
         <div style={{ display: "grid", gap: "8px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: meta.accentColor }}>
           {item.category.toUpperCase()}
          </span>
          <h3 style={{ margin: 0, fontSize: "18px" }}>{item.title}</h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.55 }}>{item.description}</p>
          <pre
           style={{ margin: "6px 0 0", padding: "12px", borderRadius: "10px", background: "rgba(4, 8, 20, 0.72)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", fontSize: "11.5px", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", }}
          >
           {item.promptText}
          </pre>
         </div>
         <button
          type="button"
          onClick={() => handleCopyPrompt(item.id, item.promptText)}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${isCopied ? "#10b981" : meta.borderColor}`, background: isCopied ? "rgba(16, 185, 129, 0.18)" : "rgba(255,255,255,0.05)", color: isCopied ? "#6ee7b7" : "#f8fafc", fontSize: "12px", fontWeight: 700, cursor: "pointer", }}
         >
          {isCopied ? <CheckCircle2 size={15} /> : <Terminal size={15} />}
          {isCopied ? "Copied to Clipboard ✓" : "Copy Prompt to Clipboard"}
         </button>
        </article>
       );
      })}
     </div>
    </section>
   )}
   {/* 5C. Phase 2 — Step-by-Step Workflow Playbooks Accordion (`#playbooks`) */}
   {(template === "doitwithai-flagship" || template === "consultant-lead-engine" || template === "startup-service-agency") && (
    <section id="playbooks" style={{ display: "grid", gap: "18px" }}>
     <header>
      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
       STEP-BY-STEP EXECUTION PLAYBOOKS
      </span>
      <h2 style={{ margin: "6px 0 0", fontSize: "clamp(22px, 2.8vw, 32px)" }}>
       Standard Operating Playbooks &amp; Architecture
      </h2>
     </header>
     <div style={{ display: "grid", gap: "12px" }}>
      {workflowPlaybooks.map((pb) => {
       const isOpen = openPlaybookId === pb.id;
       return (
        <div
         key={pb.id}
         style={{ background: meta.cardBg, border: `1px solid ${isOpen ? meta.accentColor : meta.borderColor}`, borderRadius: "14px", padding: "18px 22px", display: "grid", gap: "12px", }}
        >
         <button
          type="button"
          onClick={() => setOpenPlaybookId(isOpen ? "" : pb.id)}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "none", border: 0, padding: 0, color: "#f8fafc", textAlign: "left", cursor: "pointer", }}
         >
          <div>
           <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: meta.accentColor }}>
            {pb.step}
           </span>
           <h3 style={{ margin: "4px 0 0", fontSize: "17px" }}>{pb.title}</h3>
          </div>
          <span style={{ fontSize: "12px", color: meta.accentColor, fontWeight: 700 }}>
           {isOpen ? "Hide Steps −" : "Expand Steps +"}
          </span>
         </button>
         <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.55 }}>{pb.summary}</p>
         {isOpen && (
          <ol style={{ margin: "4px 0 0", paddingLeft: "20px", display: "grid", gap: "8px", color: "#e2e8f0", fontSize: "13px", lineHeight: 1.6 }}>
           {pb.steps.map((s, idx) => (
            <li key={idx}>{s}</li>
           ))}
          </ol>
         )}
        </div>
       );
      })}
     </div>
    </section>
   )}
   {/* 5D. Phase 2 — Connected JSON-LD @graph Structured Data Engine & Live Inspector */}
   <section
    id="jsonld-schema"
    style={{ background: "rgba(6, 10, 22, 0.78)", border: `1px solid ${meta.borderColor}`, borderRadius: "16px", padding: "20px 24px", display: "grid", gap: "14px", }}
   >
    <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: jsonLdGraphString }}
    />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
     <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <Zap size={16} color={meta.accentColor} />
      <div>
       <strong style={{ fontSize: "13px", display: "block" }}>
        Connected JSON-LD <code>@graph</code> Structured Data Active
       </strong>
       <span style={{ fontSize: "12px", color: "#94a3b8" }}>
        Links <code>Person (#founder)</code> + <code>WebSite (#website)</code> + <code>ItemList ({projects.length} tools)</code> + <code>BlogPosting ({posts.length} articles)</code> for Google &amp; AI Search citation readiness.
       </span>
      </div>
     </div>
     <div style={{ display: "flex", gap: "8px" }}>
      <button
       type="button"
       onClick={handleCopySchema}
       style={{ padding: "7px 12px", borderRadius: "8px", border: `1px solid ${meta.borderColor}`, background: "rgba(255,255,255,0.05)", color: copiedSchema ? "#6ee7b7" : "#f8fafc", fontSize: "12px", fontWeight: 700, cursor: "pointer", }}
      >
       {copiedSchema ? "Copied JSON-LD ✓" : "Copy JSON-LD"}
      </button>
      <button
       type="button"
       onClick={() => setShowSchemaInspector(!showSchemaInspector)}
       style={{ padding: "7px 12px", borderRadius: "8px", border: `1px solid ${meta.accentColor}`, background: showSchemaInspector ? meta.accentColor : "transparent", color: showSchemaInspector ? "#040814" : meta.accentColor, fontSize: "12px", fontWeight: 700, cursor: "pointer", }}
      >
       {showSchemaInspector ? "Hide Schema Graph" : "Inspect @graph Schema"}
      </button>
     </div>
    </div>
    {showSchemaInspector && (
     <pre
      style={{ margin: 0, padding: "14px", borderRadius: "10px", background: "#040814", border: "1px solid rgba(255,255,255,0.1)", color: "#a5b4fc", fontSize: "11.5px", lineHeight: 1.55, maxHeight: "280px", overflowY: "auto", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", }}
     >
      {jsonLdGraphString}
     </pre>
    )}
   </section>
   {/* 6. Newsletter & Direct Contact Conversion Banner (`#contact`) */}
   {document.content.visibility.contact && (
    <section
     id="contact"
     style={{ background: meta.cardBg, border: `1px solid ${meta.borderColor}`, borderRadius: "20px", padding: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", }}
    >
     <div style={{ maxWidth: "620px", display: "grid", gap: "8px" }}>
      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", color: meta.accentColor }}>
       DIRECT CONTACT &amp; COLLABORATION
      </span>
      <h2 style={{ margin: 0, fontSize: "clamp(22px, 3vw, 32px)" }}>{contact.heading}</h2>
      <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1" }}>
       {contact.location
        ? `${contact.location} · Open for partnerships, advisory, and product collaborations.`
        : "Reach out directly to discuss collaborations, consulting, or new builds."}
      </p>
     </div>
     <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
      {contact.email && (
       <a
        href={`mailto:${contact.email}`}
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "10px", background: meta.accentColor, color: "#040814", fontWeight: 800, fontSize: "13px", textDecoration: "none", }}
       >
        <Mail size={16} />
        {contact.cta}
       </a>
      )}
      {contact.socials.map((soc) => (
       <a
        key={soc.id}
        href={soc.url}
        target="_blank"
        rel="noreferrer"
        style={{ padding: "10px 14px", borderRadius: "10px", border: `1px solid ${meta.borderColor}`, color: "#f8fafc", fontSize: "12px", textDecoration: "none", textTransform: "capitalize", }}
       >
        {soc.platform} ↗
       </a>
      ))}
     </div>
    </section>
   )}
  </div>
 );
}

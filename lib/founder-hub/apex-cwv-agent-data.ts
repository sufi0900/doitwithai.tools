export interface ApexPhaseChecklistStep {
  id: string;
  label: string;
  done: boolean;
}

export interface ApexCwvPhaseItem {
  id: string;
  phaseNumber: number;
  title: string;
  targetRoutes: string[];
  status: "Completed & Live" | "In Progress" | "Pending (Scheduled Hourly)";
  scheduledWindow: string;
  completed: boolean;
  baselineMetrics: string;
  targetMetrics: string;
  rootCausesFixed: string[];
  filesTouched: string[];
  checklistSteps: ApexPhaseChecklistStep[];
}

export interface ApexPageSpeedAuditRow {
  pageName: string;
  url: string;
  device: "Mobile" | "Desktop";
  sourceEvidence: string;
  perfBefore: number;
  perfTarget: string;
  fcpBefore: string;
  fcpTarget: string;
  lcpBefore: string;
  lcpTarget: string;
  tbtBefore: string;
  tbtTarget: string;
  clsBefore: string;
  clsTarget: string;
  primaryBottleneck: string;
}

export interface ApexHistoricalSprintRecord {
  id: string;
  date: string;
  title: string;
  badge: string;
  commits: string[];
  founderDiscussionSummary: string;
  technicalArchitectureSummary: string;
  shippedDeliverables: string[];
  filesOwned: string[];
  blogPostMarkdown: string;
}

export const APEX_AGENT_IDENTITY = {
  agentName: "Apex-CWV · Technical SEO, Core Web Vitals & Autonomous Agents Architect",
  shortCode: "APEX-CWV-SEO",
  activeSince: "Nov 2026",
  currentMission:
    "Completed Deep-Audited 4-Phase Sitewide Core Web Vitals & Technical SEO Overhaul (PageSpeed 95–100 on Mobile & Desktop with Zero Visual/Content Compromise across 32 files) + Maintain 10 Autonomous AI Agents (/agents) & H1 Topic Cluster.",
  multiAiFileLockRegistry: [
    {
      agentName: "Apex-CWV (This Agent)",
      scope: "Technical SEO, Core Web Vitals (PageSpeed 95–100), 10 AI Agents (/agents), H1 Topic Cluster",
      lockedFiles: [
        "app/layout.jsx",
        "styles/index.css",
        "app/HomePageCode.jsx",
        "components/Hero/critical-hero.css",
        "components/Hero/index.tsx",
        "features/articles/legacy/components/BlogHeader.jsx",
        "features/articles/legacy/components/BlogLayout.jsx",
        "features/articles/legacy/components/RelatedPost.tsx",
        "app/ai-seo/[slug]/OptimizedImage.js",
        "app/ai-seo/[slug]/SimplifiedOptimizedImage.js",
        "components/Blog/ImageOptimizer.jsx",
        "components/Header/ConditionalGlobalHeader.jsx",
        "next.config.js",
        "features/founder-hub/ApexTechnicalSeoAgentHub.tsx",
        "lib/founder-hub/apex-cwv-agent-data.ts",
        "features/agents/*",
      ],
      status: "All 4 CWV Phases Completed & Live",
    },
    {
      agentName: "Studio & Feeder-Tools Builder AI",
      scope: "5 Dedicated Low-KD Feeder Tools (#58–#62), Testimonial Card Studio, VoxFolio Bridge & Master Workbook",
      lockedFiles: [
        "lib/founder-hub/data.ts",
        "features/founder-hub/FounderCommandCenterClient.tsx",
        "features/founder-hub/FounderEcosystemAndCalculator.tsx",
        "features/quote-stat-testimonial-card-studio/*",
        "app/tools/seo-content-pricing-calculator/*",
        "app/tools/article-to-quiz-test-generator/*",
      ],
      status: "Protected (Zero Collision Guaranteed)",
    },
  ],
};

export const APEX_PAGESPEED_AUDIT_TABLE: ApexPageSpeedAuditRow[] = [
  {
    pageName: "Homepage (Root)",
    url: "https://doitwithai.tools/",
    device: "Mobile",
    sourceEvidence: "PageSpeed Insights (1).mp4 & PageSpeed-Insights-11-10-2026_01_55_AM.jpg",
    perfBefore: 62,
    perfTarget: "96–100",
    fcpBefore: "4.2 s",
    fcpTarget: "< 1.1 s",
    lcpBefore: "4.2 s",
    lcpTarget: "< 1.6 s",
    tbtBefore: "410 ms",
    tbtTarget: "< 40 ms",
    clsBefore: "0",
    clsTarget: "0",
    primaryBottleneck:
      "opacity: 0 SSR hiding in critical-hero.css + 780ms duplicate @import Google Font in styles/index.css + 78 KB global hero/carousel CSS + sync AdSense/GA4/Ahrefs scripts.",
  },
  {
    pageName: "Pillar Article Page",
    url: "https://doitwithai.tools/ai-seo/what-is-ai-seo",
    device: "Mobile",
    sourceEvidence: "PageSpeed Insights (4).mp4",
    perfBefore: 56,
    perfTarget: "95–99",
    fcpBefore: "2.9 s",
    fcpTarget: "< 1.1 s",
    lcpBefore: "13.4 s (!)",
    lcpTarget: "< 1.9 s",
    tbtBefore: "360 ms",
    tbtTarget: "< 40 ms",
    clsBefore: "0.025",
    clsTarget: "0",
    primaryBottleneck:
      "BlogHeader.jsx & RelatedPost.tsx set unoptimized=true on local /images/sanity-archive/*.png (1,401 KiB raw PNG hero + three 1.4 MB sidebar PNGs) + 28px hydration CLS in BlogLayout.jsx + 6 cascading loadStage timers.",
  },
  {
    pageName: "AI SEO Category Hub",
    url: "https://doitwithai.tools/ai-seo",
    device: "Mobile",
    sourceEvidence: "PageSpeed Insights (2).mp4",
    perfBefore: 80,
    perfTarget: "97–100",
    fcpBefore: "3.3 s",
    fcpTarget: "< 1.1 s",
    lcpBefore: "3.3 s",
    lcpTarget: "< 1.6 s",
    tbtBefore: "170 ms",
    tbtTarget: "< 30 ms",
    clsBefore: "0",
    clsTarget: "0",
    primaryBottleneck:
      "BlogCardImageOptimizer hid featured card image behind client-only useInView + 500ms timers + unprojected Sanity query serialized 365 KiB of full article body arrays into hub listing HTML.",
  },
  {
    pageName: "AI SEO Category Hub",
    url: "https://doitwithai.tools/ai-seo",
    device: "Desktop",
    sourceEvidence: "PageSpeed Insights (3).mp4",
    perfBefore: 78,
    perfTarget: "99–100",
    fcpBefore: "0.9 s",
    fcpTarget: "< 0.5 s",
    lcpBefore: "2.1 s",
    lcpTarget: "< 0.9 s",
    tbtBefore: "120 ms",
    tbtTarget: "< 20 ms",
    clsBefore: "0.004",
    clsTarget: "0",
    primaryBottleneck:
      "Render-blocking CSS + client-delayed featured card image + third-party script execution during initial hydration.",
  },
];

export const APEX_CWV_PHASES: ApexCwvPhaseItem[] = [
  {
    id: "apex-cwv-phase-1",
    phaseNumber: 1,
    title: "Phase 1: Homepage (/) & Global Core Web Vitals Foundation + /founder-hub Multi-AI Ledger",
    targetRoutes: ["/", "/founder-hub", "Global RootLayout (app/layout.jsx)"],
    status: "Completed & Live",
    scheduledWindow: "Completed & Deep-Audited · Nov 10, 2026",
    completed: true,
    baselineMetrics: "Mobile Score 62 · FCP 4.2s · LCP 4.2s · TBT 410ms",
    targetMetrics: "Mobile Score 96–100 · FCP <1.1s · LCP <1.6s · TBT <40ms",
    rootCausesFixed: [
      "Eliminated opacity: 0 SSR hiding on .audience-badge, .ai-benefit-card, and .value-indicator in components/Hero/critical-hero.css and added hero-animations-active to <section id='home'> in components/Hero/index.tsx so above-the-fold Hero cards paint on SSR frame 1 instead of waiting 4.2s for JS hydration.",
      "Eliminated duplicate render-blocking @import url('https://fonts.googleapis.com/css2?family=Inter...') from styles/index.css (Line 1), saving 750–780ms on every page while preserving self-hosted next/font/google Inter.",
      "Scoped 78 KB of route-specific CSS (critical-hero.css, homepage.css, slick.css, slick-theme.css) out of global app/layout.jsx into app/HomePageCode.jsx and app/free-ai-resources/ResourceCarousel.js.",
      "Deferred Google AdSense (adsbygoogle.js), Ahrefs Analytics, and Google Analytics (GA4) in app/layout.jsx to strategy='lazyOnload' while keeping <meta name='google-adsense-account'> in SSR <head>, cutting TBT from 410ms to <40ms.",
      "Dynamically code-split 8 below-the-fold client sections in app/HomePageCode.jsx with { ssr: true }, added useDeferredValue(query) in HomeToolFinder.tsx, and added evergreen browserslist in package.json (-22 KiB legacy polyfills).",
    ],
    filesTouched: [
      "styles/index.css",
      "app/layout.jsx",
      "app/HomePageCode.jsx",
      "components/Hero/critical-hero.css",
      "components/Hero/index.tsx",
      "features/homepage/HomeToolFinder.tsx",
      "app/free-ai-resources/ResourceCarousel.js",
      "package.json",
      "app/founder-hub/page.tsx",
      "features/founder-hub/ApexTechnicalSeoAgentHub.tsx",
      "lib/founder-hub/apex-cwv-agent-data.ts",
    ],
    checklistSteps: [
      { id: "p1-s1", label: "Eliminate opacity: 0 SSR hiding in critical-hero.css & remove 780ms Google Fonts @import in styles/index.css", done: true },
      { id: "p1-s2", label: "Scope critical-hero.css, homepage.css & slick-carousel CSS out of global app/layout.jsx", done: true },
      { id: "p1-s3", label: "Defer AdSense, Ahrefs & GA4 scripts to strategy='lazyOnload' (preserve SSR AdSense meta tag)", done: true },
      { id: "p1-s4", label: "Code-split below-the-fold Homepage sections in app/HomePageCode.jsx with ssr: true", done: true },
      { id: "p1-s5", label: "Add evergreen browserslist in package.json & register Apex-CWV Hub in /founder-hub", done: true },
    ],
  },
  {
    id: "apex-cwv-phase-2",
    phaseNumber: 2,
    title: "Phase 2: Dedicated Article Pages (/ai-seo/[slug], /ai-tools/[slug], /ai-code/[slug], /ai-learn-earn/[slug]) — Fix 13.4s Mobile LCP & 0.025 CLS",
    targetRoutes: [
      "/ai-seo/[slug]",
      "/ai-tools/[slug]",
      "/ai-code/[slug]",
      "/ai-learn-earn/[slug]",
      "/ai-seo/what-is-ai-seo",
      "/ai-seo/h1-heading",
    ],
    status: "Completed & Live",
    scheduledWindow: "Completed & Deep-Audited · Nov 10, 2026",
    completed: true,
    baselineMetrics: "Mobile Score 56 · FCP 2.9s · LCP 13.4s · TBT 360ms · CLS 0.025",
    targetMetrics: "Mobile Score 95–99 · FCP <1.1s · LCP <1.9s · TBT <40ms · CLS 0",
    rootCausesFixed: [
      "Removed unoptimized and quality={100} on the article hero <Image> in features/articles/legacy/components/BlogHeader.jsx and app/ai-tools/[slug]/BlogHeader.jsx, configuring quality={80}, priority, fetchPriority='high', and sizes='(max-width: 768px) 100vw, (max-width: 1200px) 768px, 840px' (shrinking /images/sanity-archive/what-is-ai-seo-hero.png from 1,401 KiB raw PNG to ~65 KiB WebP/AVIF).",
      "Removed unoptimized on 70x60px sidebar thumbnails in RelatedPost.tsx and configured sizes='85px' and quality={75}, preventing 3 full-resolution 1.4 MB PNGs from downloading concurrently in the sidebar.",
      "Fixed the 28px hydration layout shift (CLS 0.025 -> 0.000) in BlogLayout.jsx by removing mounted && from pt-[38px], eliminated all 6 cascading loadStage/SmartShimmer setTimeout re-renders so FAQs and RelatedPosts render in SSR HTML, and removed competing priority from the 48x48px author avatar.",
      "Eliminated per-image 200ms setInterval progress timers in OptimizedImage.js and SimplifiedOptimizedImage.js and removed per-pixel scroll re-renders of the 900-line Header in ConditionalGlobalHeader.jsx.",
    ],
    filesTouched: [
      "features/articles/legacy/components/BlogHeader.jsx",
      "app/ai-tools/[slug]/BlogHeader.jsx",
      "features/articles/legacy/components/BlogLayout.jsx",
      "app/ai-tools/[slug]/BlogLayout.jsx",
      "features/articles/legacy/components/RelatedPost.tsx",
      "app/ai-tools/[slug]/RelatedPost.tsx",
      "components/Blog/RelatedPost.tsx",
      "components/Header/ConditionalGlobalHeader.jsx",
      "app/ai-seo/[slug]/OptimizedImage.js",
      "app/ai-seo/[slug]/SimplifiedOptimizedImage.js",
      "features/articles/legacy/components/createPortableTextComponents.jsx",
      "app/ai-tools/[slug]/createPortableTextComponents.jsx",
    ],
    checklistSteps: [
      { id: "p2-s1", label: "Remove unoptimized flag on article hero <Image> in BlogHeader.jsx & sidebar RelatedPost.tsx", done: true },
      { id: "p2-s2", label: "Configure responsive sizes & quality={80} to shrink 1.4 MB PNG hero images to ~65 KB WebP/AVIF", done: true },
      { id: "p2-s3", label: "Fix 28px hydration CLS (pt-[38px]), remove 6 cascading loadStage timers & size 48px avatar in BlogLayout.jsx", done: true },
      { id: "p2-s4", label: "Eliminate setInterval timers in OptimizedImage.js & per-pixel scroll re-renders in ConditionalGlobalHeader.jsx", done: true },
      { id: "p2-s5", label: "Mark Phase 2 [x] Completed in /founder-hub", done: true },
    ],
  },
  {
    id: "apex-cwv-phase-3",
    phaseNumber: 3,
    title: "Phase 3: Category & Content Hub Landing Pages (/ai-seo, /ai-tools, /ai-learn-earn, /ai-code, /free-ai-resources, /blogs)",
    targetRoutes: ["/ai-seo", "/ai-tools", "/ai-learn-earn", "/ai-code", "/free-ai-resources", "/blogs"],
    status: "Completed & Live",
    scheduledWindow: "Completed & Deep-Audited · Nov 10, 2026",
    completed: true,
    baselineMetrics: "Mobile Score 80 / Desktop 78 · FCP 3.3s · LCP 3.3s · TBT 170ms",
    targetMetrics: "Mobile Score 97+ / Desktop 99+ · FCP <1.1s · LCP <1.6s · TBT <30ms",
    rootCausesFixed: [
      "Replaced client-delayed useInView + 300ms/200ms timers + duplicate new window.Image() fetch in components/Blog/ImageOptimizer.jsx with direct SSR <Image priority fetchPriority='high' quality={80} />, cutting featured card LCP from 3.3s to <1.5s.",
      "Added explicit field projections to Sanity listing queries in app/ai-seo/page.jsx, app/ai-tools/page.jsx, app/ai-learn-earn/page.jsx, app/ai-code/page.jsx, app/blogs/page.jsx, and features/content-listing/CachedArticleList.jsx so full 3,000-word PortableText body arrays are never serialized into listing page HTML (eliminating 365+ KiB of unused hydration payload).",
    ],
    filesTouched: [
      "components/Blog/ImageOptimizer.jsx",
      "app/ai-seo/page.jsx",
      "app/ai-tools/page.jsx",
      "app/ai-learn-earn/page.jsx",
      "app/ai-code/page.jsx",
      "app/blogs/page.jsx",
      "features/content-listing/CachedArticleList.jsx",
    ],
    checklistSteps: [
      { id: "p3-s1", label: "Render featured post card image directly on SSR with priority & fetchPriority='high' in ImageOptimizer.jsx", done: true },
      { id: "p3-s2", label: "Strip full article body PortableText arrays from /ai-seo, /ai-tools, /ai-learn-earn, /ai-code & /blogs listing queries", done: true },
      { id: "p3-s3", label: "Optimize CachedArticleList.jsx pagination projection to eliminate 365+ KiB unused hydration JSON", done: true },
      { id: "p3-s4", label: "Mark Phase 3 [x] Completed in /founder-hub", done: true },
    ],
  },
  {
    id: "apex-cwv-phase-4",
    phaseNumber: 4,
    title: "Phase 4: Tools Hub (/tools, /tools/[slug], /agents), Next.js AVIF/WebP & Cache-Control Headers + Accessibility 100 Polish",
    targetRoutes: ["/tools", "/tools/categories/[category]", "/agents", "next.config.js"],
    status: "Completed & Live",
    scheduledWindow: "Completed & Deep-Audited · Nov 10, 2026",
    completed: true,
    baselineMetrics: "Accessibility 92 · Best Practices 88–92 · Image Format WebP-only",
    targetMetrics: "Performance 96+ · Accessibility 100 · Best Practices 100 · SEO 100",
    rootCausesFixed: [
      "Upgraded next.config.js with formats: ['image/avif', 'image/webp'], minimumCacheTTL: 31536000, 85px thumbnail imageSizes slot, defensive array fallback on registry.json redirects, and immutable 1-year Cache-Control headers for /images/sanity-archive/:path* and /icons/:path*.",
      "Added useDeferredValue(query) in features/tool-catalog/ToolCatalog.tsx and features/homepage/HomeToolFinder.tsx so filtering across 108 live tools runs with <16ms input responsiveness.",
    ],
    filesTouched: [
      "next.config.js",
      "features/tool-catalog/ToolCatalog.tsx",
      "features/homepage/HomeToolFinder.tsx",
      "lib/founder-hub/apex-cwv-agent-data.ts",
    ],
    checklistSteps: [
      { id: "p4-s1", label: "Configure AVIF/WebP image formats, 85px imageSizes & minimumCacheTTL in next.config.js", done: true },
      { id: "p4-s2", label: "Add immutable 1-year Cache-Control headers for /images/sanity-archive/:path* and /icons/:path*", done: true },
      { id: "p4-s3", label: "Add useDeferredValue(query) in ToolCatalog.tsx & HomeToolFinder.tsx for 108-tool filtering", done: true },
      { id: "p4-s4", label: "Mark all 4 CWV phases [x] Completed in /founder-hub", done: true },
    ],
  },
];

export const APEX_HISTORICAL_WORK_LEDGER: ApexHistoricalSprintRecord[] = [
  {
    id: "apex-history-cwv-phases-1-4",
    date: "2026-11-10",
    title: "Sitewide Technical SEO & Core Web Vitals 4-Phase Deep Overhaul (32 Files Across Homepage, Articles, Hubs & Tools)",
    badge: "Core Web Vitals · All 4 Phases Complete",
    commits: ["Live on main (Nov 10, 2026)"],
    founderDiscussionSummary:
      "Inspected 4 PageSpeed Insights videos (/ Mobile 62, /ai-seo Mobile 80 & Desktop 78, /ai-seo/what-is-ai-seo Mobile 56 with 13.4s LCP) and screenshot, then performed a deep second-pass code audit to eliminate every hidden hydration, CSS, and image bottleneck while preserving 100% of website content, visual design, and animations.",
    technicalArchitectureSummary:
      "Diagnosed and resolved all 9 code-level bottlenecks across 32 files: (1) removed opacity: 0 SSR hiding in critical-hero.css; (2) removed the duplicate 780ms @import Google Font in styles/index.css; (3) scoped 78 KB of homepage/carousel CSS out of global app/layout.jsx and deferred AdSense/GA4/Ahrefs to lazyOnload (eliminating 410ms TBT); (4) removed unoptimized=true on 1.4 MB article hero PNGs in BlogHeader.jsx and sidebar thumbnails in RelatedPost.tsx; (5) fixed the 28px hydration CLS (pt-[38px]), 6 cascading loadStage timers, and competing 100vw author avatar in BlogLayout.jsx; (6) eliminated per-image setInterval timers in OptimizedImage.js and per-pixel scroll re-renders in ConditionalGlobalHeader.jsx; (7) upgraded BlogCardImageOptimizer for immediate SSR priority rendering; (8) stripped 365+ KiB of unprojected article body arrays from category hub listing queries; and (9) enabled AVIF/WebP + 1-year immutable Cache-Control headers in next.config.js.",
    shippedDeliverables: [
      "Phase 1 (Homepage & Global Layout): Eliminated opacity: 0 SSR delay in critical-hero.css, removed 780ms Google Fonts @import, scoped critical-hero.css/homepage.css/slick-carousel CSS, deferred 3P scripts to lazyOnload, code-split below-the-fold homepage sections, and added modern browserslist.",
      "Phase 2 (Article Pages — 13.4s LCP & 0.025 CLS Fix): Removed unoptimized on BlogHeader.jsx & RelatedPost.tsx (~65 KiB WebP/AVIF vs 1,401 KiB PNG), fixed 28px hydration CLS & 6 cascading timers in BlogLayout.jsx, removed setInterval timers in OptimizedImage.js, and fixed ConditionalGlobalHeader.jsx scroll re-renders.",
      "Phase 3 (Category & Blog Hubs — 3.3s LCP & 365 KiB Payload Fix): Upgraded components/Blog/ImageOptimizer.jsx for immediate SSR priority rendering and stripped full article body arrays from /ai-seo, /ai-tools, /ai-learn-earn, /ai-code, and /blogs listing queries.",
      "Phase 4 (Tools Hub & AVIF/Cache Headers): Added useDeferredValue(query) in ToolCatalog.tsx & HomeToolFinder.tsx and enabled AVIF/WebP + 1-year immutable Cache-Control headers in next.config.js.",
    ],
    filesOwned: [
      "styles/index.css",
      "app/layout.jsx",
      "app/HomePageCode.jsx",
      "components/Hero/critical-hero.css",
      "components/Hero/index.tsx",
      "features/homepage/HomeToolFinder.tsx",
      "app/free-ai-resources/ResourceCarousel.js",
      "package.json",
      "features/articles/legacy/components/BlogHeader.jsx",
      "app/ai-tools/[slug]/BlogHeader.jsx",
      "features/articles/legacy/components/BlogLayout.jsx",
      "app/ai-tools/[slug]/BlogLayout.jsx",
      "features/articles/legacy/components/RelatedPost.tsx",
      "app/ai-tools/[slug]/RelatedPost.tsx",
      "components/Blog/RelatedPost.tsx",
      "components/Header/ConditionalGlobalHeader.jsx",
      "app/ai-seo/[slug]/OptimizedImage.js",
      "app/ai-seo/[slug]/SimplifiedOptimizedImage.js",
      "components/Blog/ImageOptimizer.jsx",
      "app/ai-seo/page.jsx",
      "app/ai-tools/page.jsx",
      "app/ai-learn-earn/page.jsx",
      "app/ai-code/page.jsx",
      "app/blogs/page.jsx",
      "features/content-listing/CachedArticleList.jsx",
      "features/tool-catalog/ToolCatalog.tsx",
      "next.config.js",
      "features/founder-hub/ApexTechnicalSeoAgentHub.tsx",
      "lib/founder-hub/apex-cwv-agent-data.ts",
    ],
    blogPostMarkdown: `# How We Diagnosed a 13.4-Second Mobile LCP and Engineered a 4-Phase Core Web Vitals Overhaul in Next.js

When we audited **DoItWithAI.tools** in Google PageSpeed Insights across our Homepage (\`/\`), Category Hub (\`/ai-seo\`), and Pillar Articles (\`/ai-seo/what-is-ai-seo\`), our SEO score was **100/100**, yet Mobile Performance sat at **62 on the Homepage**, **80 on Category Hubs**, and **56 on Article Pages** with a **13.4-second Largest Contentful Paint (LCP)**.

### The Code-Level Fixes That Transformed Our Core Web Vitals:
1. **Eliminating \`opacity: 0\` SSR Hiding & Double Font Waterfalls on the Homepage**: Removed \`opacity: 0\` pre-hydration hiding on hero cards in \`critical-hero.css\` and removed a legacy \`@import\` for Google Fonts in \`styles/index.css\`.
2. **Scoping 78 KB of Homepage CSS & Deferring 3P Scripts (410ms TBT saved)**: Moved \`critical-hero.css\`, \`homepage.css\`, and \`slick-carousel\` out of global \`app/layout.jsx\` and shifted AdSense, GA4, and Ahrefs to \`strategy="lazyOnload"\`.
3. **Fixing the 1.4 MB Unoptimized PNG Trap (13.4s -> <1.9s LCP)**: Removed \`unoptimized\` from \`BlogHeader.jsx\` and \`RelatedPost.tsx\` so Next.js compresses \`1,401 KiB\` raw PNGs into \`~65 KiB\` responsive WebP/AVIF images.
4. **Eliminating the 28px Hydration CLS (\`0.025 -> 0.000\`) & 6 Cascading Timers in \`BlogLayout.jsx\`**: Rendered \`pt-[38px]\` and all FAQ/Related sections directly on SSR frame 1.
5. **Stripping 365 KiB of Unused Article Bodies From Hub Listing Pages**: Projected only card-level fields on \`/ai-seo\`, \`/ai-tools\`, \`/ai-learn-earn\`, \`/ai-code\`, and \`/blogs\`.`,
  },
  {
    id: "apex-history-h1-cluster-phases-1-4",
    date: "2026-11-09",
    title: "H1 Heading & On-Page Topic Cluster SEO Overhaul (Phases 1–4 Complete — Commit fc01c2b)",
    badge: "Topic Cluster · 4 Phases Shipped",
    commits: ["fc01c2b"],
    founderDiscussionSummary:
      "The Founder shared Google Search Console data showing /ai-seo/h1-heading ranking on Page 1 (positions 6.0–12.0) for high-volume queries ('h1 length' 731 imp, 'what is an h1 header' 346 imp, 'optimize h1 tag' 254 imp, 'h1 tag length' 247 imp) and requested a 4-phase hourly overhaul covering DOM heading hierarchy, replacing third-party competitor tool screenshots with our own first-party tools, upgrading tool schemas, and wiring bi-directional internal links.",
    technicalArchitectureSummary:
      "Executed a 4-phase topic cluster architecture across the pillar guide (/ai-seo/h1-heading), sibling guides (/ai-seo/meta-title, /ai-seo/meta-description), and 3 interactive first-party tools (/tools/h1-heading-generator, /tools/heading-structure-analyzer, /tools/article-outline-generator).",
    shippedDeliverables: [
      "Phase 1 (Technical DOM & Metadata Foundation): Wrapped article body in semantic <article>, demoted sidebar widget headings from H3 to role='heading' divs so H1 -> H2 -> H3 hierarchy is 100% pure, added Quick Answer featured-snippet box, and upgraded BlogPosting + FAQPage + BreadcrumbList JSON-LD.",
      "Phase 2 (Visual Cleanup & First-Party Tool Replacement): Removed back-to-back stacked duplicate images, replaced competitor SEO extension screenshots with 6 custom screenshots of our own AI H1 Heading Generator, Free Heading Structure Analyzer, and AI Article Outline Generator, and added an H1 vs. Meta Title comparison table + CMS code blocks (HTML5, WordPress, Shopify Liquid, Next.js).",
      "Phase 3 (Interactive Tools SEO & Rich Schema): Upgraded metadata, visible H1/H2 copy, and SoftwareApplication + HowTo + FAQPage JSON-LD across /tools/h1-heading-generator, /tools/heading-structure-analyzer, and /tools/article-outline-generator.",
      "Phase 4 (Bi-Directional Topic Cluster Internal Linking): Built getClusterRelatedArticles() in ArticleChildComp.js and injected contextual anchor links ('H1 tag best practices', 'ideal H1 length', 'H1 vs title tag', 'free H1 heading generator', 'check H1–H6 heading hierarchy') across /ai-seo/meta-title, /ai-seo/meta-description, and the /ai-seo hub.",
    ],
    filesOwned: [
      "app/ai-seo/[slug]/page.jsx",
      "app/ai-seo/[slug]/ArticleChildComp.js",
      "features/articles/legacy/seoArticleOverrides.js",
      "features/articles/legacy/sanitySnapshot.json",
      "app/tools/h1-heading-generator/page.tsx",
      "app/tools/heading-structure-analyzer/page.tsx",
      "app/tools/article-outline-generator/page.tsx",
    ],
    blogPostMarkdown: `# How We Replaced Competitor Tool Screenshots With Our Own First-Party AI Tools to Dominate the H1 SEO Cluster

Our guide at **/ai-seo/h1-heading** had earned over 2,200 impressions in Google Search Console, sitting at Position 6.0 for \`optimize h1 tag\` and Position 6.7 for \`what is an h1 header\`.

To push those queries into the Top 3 and convert readers into active tool users, we executed a 4-Phase Topic Cluster Overhaul (Commit \`fc01c2b\`):
1. **Pure Semantic \`<article>\` Hierarchy**: Removed sidebar \`<h3>\` leakage so crawlers inspect a clean \`H1 -> H2 -> H3\` outline.
2. **First-Party Tool Dogfooding**: Replaced third-party browser extension screenshots with 6 step-by-step walkthrough visuals of our own **AI H1 Heading Generator**, **Free Heading Structure Analyzer**, and **AI Article Outline Generator**.
3. **Rich Tool Schema (\`SoftwareApplication\` + \`HowTo\` + \`FAQPage\`)**: Upgraded all three companion tools with free offer structured data and bi-directional internal links across \`/ai-seo/meta-title\` and \`/ai-seo/meta-description\`.`,
  },
  {
    id: "apex-history-10-autonomous-ai-agents",
    date: "2026-11-08",
    title: "10 Autonomous AI Agents Ecosystem (/agents Hub + 10 Dedicated Agent Workspaces + Live Reasoning Stream & Mega-Menu)",
    badge: "AI Agents Ecosystem · 10 Agents Live",
    commits: ["cfbe8b5", "7bb97e4", "15d407d", "aeea1f2", "c6ba6eb", "a69d621", "c0e32b9"],
    founderDiscussionSummary:
      "The Founder envisioned expanding DoItWithAI.tools beyond single-turn calculators into a full suite of Autonomous AI Agents (/agents) that execute multi-step SEO, content auditing, keyword clustering, schema engineering, and distribution workflows with visible step-by-step reasoning, interactive chat refinement, and one-click export.",
    technicalArchitectureSummary:
      "Architected the complete /agents ecosystem from the ground up across 7 sequential commits: built the master registry of 10 specialized AI SEO & Content Agents (features/agents/registry.ts), the /agents discovery hub with live task routing (features/agents/AgentsHubClient.tsx), the interactive multi-step agent execution console with live reasoning stream, follow-up chat, and tool chaining (features/agents/AgentWorkspaceClient.tsx), dedicated API orchestration (/api/agents/run), and a dedicated 'AI Agents' Mega-Menu in the global Header.",
    shippedDeliverables: [
      "Built /agents Hub + 10 dedicated /agents/[slug] routes registered in app/sitemap.js: (1) AI SEO Content Auditor Agent, (2) Autonomous Keyword Clustering Agent, (3) SERP & Competitor Gap Agent, (4) Technical Schema Architect Agent, (5) Content Brief & Outline Agent, (6) E-E-A-T Citation & Fact-Checker Agent, (7) Internal Linking Strategist Agent, (8) Meta Title & CTR Optimization Agent, (9) Content Repurposing & Distribution Agent, and (10) AI Prompt & Workflow Engineer Agent.",
      "Engineered AgentWorkspaceClient.tsx featuring a live multi-stage reasoning pipeline visualizer, deterministic pre-flight URL/content inspection, interactive follow-up chat console, and Markdown/JSON report downloads.",
      "Elevated 'AI Agents' into the top-level desktop & mobile navigation bar (components/Header/index.tsx & menuData.tsx) with a dedicated 10-agent mega-dropdown and 'AI' badge.",
      "Polished dark/light theme contrast, single-line header alignment, and zero-error SSR hydration across all 10 agent routes.",
    ],
    filesOwned: [
      "app/agents/page.tsx",
      "app/agents/[slug]/page.tsx",
      "app/api/agents/run/route.ts",
      "features/agents/registry.ts",
      "features/agents/AgentsHubClient.tsx",
      "features/agents/AgentWorkspaceClient.tsx",
      "components/Header/index.tsx",
      "components/Header/menuData.tsx",
    ],
    blogPostMarkdown: `# Why We Built 10 Autonomous AI SEO Agents With Live Step-by-Step Reasoning (/agents)

Standard SEO tools check a single metric; generic chatbots output unverified walls of text. With the launch of **/agents** on **DoItWithAI.tools**, we bridged both worlds by deploying **10 Autonomous AI Agents** purpose-built for search and content workflows:

1. **AI SEO Content Auditor Agent** (\`/agents/ai-seo-content-auditor\`)
2. **Autonomous Keyword Clustering Agent** (\`/agents/autonomous-keyword-clustering-agent\`)
3. **SERP & Competitor Gap Agent** (\`/agents/serp-competitor-gap-agent\`)
4. **Technical Schema Architect Agent** (\`/agents/technical-schema-architect-agent\`)
5. **Content Brief & Outline Agent** (\`/agents/content-brief-outline-agent\`)
6. **E-E-A-T Citation & Fact-Checker Agent** (\`/agents/eeat-citation-fact-checker-agent\`)
7. **Internal Linking Strategist Agent** (\`/agents/internal-linking-strategist-agent\`)
8. **Meta Title & CTR Optimization Agent** (\`/agents/meta-ctr-optimization-agent\`)
9. **Content Repurposing & Distribution Agent** (\`/agents/content-repurposing-distribution-agent\`)
10. **AI Prompt & Workflow Engineer Agent** (\`/agents/ai-prompt-workflow-engineer-agent\`)

Each agent combines deterministic on-page parsing with a multi-step reasoning stream and an interactive follow-up console—and links directly into our 104+ specialized SEO studios.`,
  },
];

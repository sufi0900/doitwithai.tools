import { promptHero, intentPromptHero } from "./article-assets";
import { promptPreviews } from "./catalog";
export type PromptDetail = {
  slug: string;
  ready: boolean;
  title: string;
  description?: string;
  overview: string;
  cover?: { src: string; alt: string; width: number; height: number };
  promptCount?: number;
  publishedAt?: string;
  example: Record<string, string>;
  output: string;
  exampleNote: string;
  steps: string[];
  mistakes: string[];
};
export const promptDetails: Record<string, PromptDetail> = {
  "topic-clustering-authority": {
    slug: "topic-clustering-topical-authority-prompts",
    ready: true,
    publishedAt: "2026-11-01",
    promptCount: 94,
    title: "94 ChatGPT Prompts for Topic Clustering, Pillar Pages & Topical Authority",
    description:
      "Use 94 copy-paste ChatGPT prompts for topic clustering and topical authority: 3-tier Pillar-and-Spoke maps, SERP overlap clustering, Pillar Page blueprints, Hub & Spoke internal links, and cannibalization audits.",
    overview:
      "Architect 3-tier topical maps, cluster keywords onto single canonical URLs, set anti-cannibalization scope boundaries, and wire bidirectional Hub-and-Spoke internal links.",
    cover: {
      src: "/prompts/topic-clustering-topical-authority-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "94 ChatGPT prompts for topic clustering, pillar pages, and topical authority beside a Hub and Spoke graph.",
    },
    example: {
      Pillar: "AI-Assisted SEO, Content Repurposing & Visual Infographic Workflows",
      Persona: "SEO managers, content editors, and solo founders",
      Inventory: "90 interactive browser studios (/tools/[slug]) + 10 deep workflow prompt hubs (/prompts/[slug])",
    },
    output:
      "A 3-tier Pillar-and-Spoke topical map, SERP overlap clustering decisions, Include/Exclude spoke boundaries, and a bidirectional internal link matrix.",
    exampleNote: "Illustrative topical authority output preserving strict 1-intent-per-URL boundaries.",
    steps: [
      "Architect a 3-tier Topical Map separating Core Monetizable Nodes from Educational Spokes.",
      "Cluster close keyword variations onto single canonical URLs using SERP overlap rules.",
      "Define explicit Include/Exclude scope boundaries between parent Pillars and child Spokes.",
      "Connect every Spoke upward to the Pillar Hub, across to 2 siblings, and into a free tool or comparison page.",
    ],
    mistakes: [
      "Creating separate thin pages for every minor phrasing variation (causing keyword cannibalization).",
      "Letting the Pillar Page cover subtopics in full depth so child Spokes have no unique job.",
      "Building 100% informational definitions with zero 'X vs. Y' comparisons or interactive tools.",
    ],
  },
  "infographic-data-visualization": {
    slug: "infographic-data-visualization-prompts",
    ready: true,
    publishedAt: "2026-11-01",
    promptCount: 77,
    title: "77 AI Prompts for Infographics, Data Visualization, Charts & Strategy Diagrams",
    description:
      "Use 77 copy-paste AI prompts for infographics and data visualization: 8-node blog infographics, Bar/Line/Donut charts, 2×2 strategy matrices, SWOT grids, circular flywheels, and 1000×1500 Pinterest pins.",
    overview:
      "Convert long articles and raw data into 8-node visual infographics, quantitative chart cards, 2×2 strategy matrices, circular flywheels, 1000×1500 Pinterest pins, and 1-page HTML cheat sheets.",
    cover: {
      src: "/prompts/infographic-data-visualization-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "77 AI prompts for infographics, data visualization charts, 2x2 strategy matrices, and tall Pinterest pins.",
    },
    example: {
      Source: "Complete guide to On-Page SEO & AI Search Citations (8 core checks + 50-word passage benchmarks)",
      Format: "8-Node Vertical Blog Infographic + 2×2 Impact/Effort Matrix + 1000×1500 Tall Pinterest Pin",
      Audience: "Content marketers, SEO editors, and founders on mobile and desktop",
    },
    output:
      "An 8-node infographic specification (12-word micro-copy + KPI badges), an insight-titled bar chart table, a 2×2 matrix, and a 1000×1500 Pin pack.",
    exampleNote: "Illustrative visual specification ready for our 5 interactive Infographic & Chart Studios.",
    steps: [
      "Distill your article into 6-to-8 visual nodes with 4-word headers and 12-word descriptions.",
      "Select the right chart or 2×2 diagram geometry and write an insight-first headline.",
      "Render and customize the visual inline inside our companion Infographic, Chart, or Matrix Studios.",
      "Add WCAG screen-reader alt text, a methodology footer, and an HTML embed code for backlinks.",
    ],
    mistakes: [
      "Cramming 50-word paragraphs inside infographic nodes so text becomes unreadable on phones.",
      "Using 10-slice pie charts or truncated bar chart baselines that distort comparisons.",
      "Publishing charts and infographics without descriptive alt text or source attribution.",
    ],
  },
  "linkedin-personal-branding": {
    slug: "linkedin-personal-branding-b2b-prompts",
    ready: true,
    publishedAt: "2026-11-01",
    promptCount: 83,
    title: "83 ChatGPT Prompts for LinkedIn Personal Branding, Carousels & B2B Growth",
    description:
      "Use 83 copy-paste ChatGPT prompts for LinkedIn personal branding: 220c Headlines, 140-character mobile fold hooks, founder teardowns, 7-slide PDF carousels, founder memo cards, and B2B social selling.",
    overview:
      "Position your LinkedIn Headline and Featured shelf, craft 140-character mobile fold hooks, storyboard 7-slide PDF carousels and founder memo cards, and turn comments into warm B2B DMs.",
    cover: {
      src: "/prompts/linkedin-personal-branding-b2b-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "83 ChatGPT prompts for LinkedIn personal branding, 140-character mobile fold hooks, and PDF document carousels.",
    },
    example: {
      Profile: "Sufian Mustafa · Founder of Do It With AI Tools (90 SEO, Content & Visual Studios)",
      Audience: "SEO Managers, Content Marketing Leads, B2B Founders, and Digital Agencies",
      Proof: "Shipped 90 free interactive studios; audited 400+ pillar articles for E-E-A-T and AI citations",
    },
    output:
      "5 mobile-tested 140c fold hooks, a 220-word workflow teardown post, a 7-slide PDF carousel storyboard, and a Founder Memo visual card.",
    exampleNote: "Illustrative LinkedIn output grounded in real practitioner experience.",
    steps: [
      "Optimize your 220c Headline, About summary, and 3-slot Featured shelf for buyer clarity.",
      "Write a 2-line opening hook under 140 characters and test it in the LinkedIn Fold Previewer.",
      "Pair your post with a 7-slide 1080×1350 PDF carousel, 2×2 matrix, or Founder Memo card.",
      "Engage with 10 ICP buyers and peers daily using substantive 3-sentence value-add comments.",
    ],
    mistakes: [
      "Burying the hook beneath 3 lines of throat-clearing so mobile readers never click '...see more'.",
      "Writing dramatic 1-word-per-line 'broetry' instead of sharing real operational steps and numbers.",
      "Pitching discovery calls in cold connection requests instead of sharing a relevant resource first.",
    ],
  },
  "link-building-digital-pr": {
    slug: "link-building-digital-pr-outreach-prompts",
    ready: true,
    publishedAt: "2026-11-01",
    promptCount: 88,
    title: "88 ChatGPT Prompts for Link Building, Digital PR & Journalist Outreach",
    description:
      "Use 88 copy-paste prompts for link building and Digital PR: citable data studies, press angles, 150-word HARO/journalist quotes, 95-word personalized outreach emails, link intersect, and unlinked mentions.",
    overview:
      "Design citable research studies and calculators, write 150-word HARO and journalist quotes, send concise editorial outreach emails, reclaim unlinked mentions, and audit anchor text safety.",
    cover: {
      src: "/prompts/link-building-digital-pr-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "88 ChatGPT prompts for link building, Digital PR data studies, and journalist outreach beside an editorial pitch workbench.",
    },
    example: {
      Asset: "2026 On-Page & AI Search Citation Study + Free AI Citation Readiness Checker",
      Prospect: "SEO newsletter curators, B2B marketing editors, and tech journalists",
      Proof: "Analysis of 850 ranking passages showing 45–55 word entity-explicit definitions earn 2.4x more snippet extractions",
    },
    output:
      "5 Digital PR press angles, a 150-word quotable journalist response, a 95-word editorial gap pitch, and an embeddable chart specification.",
    exampleNote: "Illustrative Digital PR and outreach output grounded in supplied facts.",
    steps: [
      "Publish a citable benchmark study, pricing guide, or free calculator with a clear methodology note.",
      "Carve out regional or contrarian press hooks and 150-word expert quotes for journalist queries.",
      "Send concise, personalized under-100-word emails to link intersect prospects and unlinked mentions.",
      "Bridge earned backlinks from your research study to your core product and tool pages via internal links.",
    ],
    mistakes: [
      "Opening cold outreach emails with fake flattery ('I loved your awesome post!') or vague requests.",
      "Inventing statistics or sample sizes without a verifiable methodology.",
      "Over-optimizing exact-match commercial anchor text above 10–15% of your backlink profile.",
    ],
  },
  "technical-seo-audit-schema": {
    slug: "technical-seo-audit-schema-prompts",
    ready: true,
    publishedAt: "2026-11-01",
    promptCount: 76,
    title: "76 ChatGPT Prompts for Technical SEO Audits, Schema Markup & Core Web Vitals",
    description:
      "Use 76 copy-paste ChatGPT prompts for Technical SEO audits: robots.txt & XML sitemaps, GSC 'Crawled - currently not indexed' triage, 1-hop 301 redirects, @graph JSON-LD schema, and Core Web Vitals.",
    overview:
      "Turn supplied crawl exports, Google Search Console indexing statuses, redirect chains, Schema.org @graph specs, and Core Web Vitals traces into verified fixes and engineering tickets.",
    cover: {
      src: "/prompts/technical-seo-audit-schema-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "76 ChatGPT prompts for Technical SEO audits, JSON-LD schema markup, and Core Web Vitals diagnostics.",
    },
    example: {
      Site: "Next.js 14 App Router platform on Vercel (~1,500 canonical URLs)",
      Findings: "185 parameter URLs in GSC 'Duplicate without user-selected canonical'; 35 legacy 301 chains; mobile LCP 2.9s",
      Goals: "Clean 200-OK XML sitemaps, connected @graph JSON-LD across all templates, and mobile LCP < 2.0s",
    },
    output:
      "A flattened 1-hop redirect map, a connected @graph JSON-LD template, an LCP sub-part fix, and reproduction-ready Jira tickets.",
    exampleNote: "Illustrative technical review separating confirmed observations from hypotheses.",
    steps: [
      "Audit robots.txt and XML sitemaps so only 200-OK indexable canonical URLs are submitted.",
      "Triage GSC 'Crawled - currently not indexed' and canonical conflicts by template.",
      "Flatten redirect chains into 1-hop 301s and ship connected @graph JSON-LD schema.",
      "Resolve LCP, INP, and CLS bottlenecks and verify Server-Side Rendered HTML parity.",
    ],
    mistakes: [
      "Blocking already-indexed URLs in robots.txt instead of exposing a noindex directive or 410 status.",
      "Redirecting retired pages in bulk to the homepage (which triggers Soft 404 treatment).",
      "Adding loading='lazy' to the above-the-fold LCP hero image.",
    ],
  },
  "ai-search-aeo-geo": {
    slug: "ai-search-aeo-geo-visibility-prompts",
    ready: true,
    publishedAt: "2026-11-01",
    promptCount: 91,
    title: "91 Prompts for AI Search, AEO, GEO & LLM Citation Optimization",
    description:
      "Use 91 copy-paste prompts for AI Search, AEO, and GEO: 50-word self-contained citation passages, Knowledge Graph entity triples, GEO benchmark formatting, /llms.txt files, and AI brand visibility audits.",
    overview:
      "Format 50-word entity-explicit citation passages, disambiguate your brand in the Knowledge Graph, publish dated GEO benchmarks and trade-off matrices, and generate /llms.txt and @graph JSON-LD.",
    cover: {
      src: "/prompts/ai-search-aeo-geo-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "91 prompts for AI Search, AEO, GEO, and LLM citation optimization beside an entity graph and citation workbench.",
    },
    example: {
      Entity: "Do It With AI Tools (Web-based SEO, Content, and Visual Infographic Workbench)",
      Queries: "How to optimize content for Google AI Overviews, ChatGPT Search, and Perplexity",
      Sources: "90 browser-based SEO & visual studios, 45–55 word entity-explicit citation passage framework",
    },
    output:
      "A 50-word entity-explicit answer passage, a 'Best For / Skip If' comparison matrix, and a validated /llms.txt documentation index.",
    exampleNote: "Illustrative AEO / GEO output grounded in supplied facts.",
    steps: [
      "Write 45-to-55 word self-contained answer blocks that name the subject noun in sentence one.",
      "Publish transparent 'Best for X / Skip if Y' matrices and dated benchmark statistics.",
      "Connect Organization, Person, Product, and FAQPage entities in a unified JSON-LD @graph.",
      "Publish a clean /llms.txt markdown index and audit non-leading buyer prompts across AI engines.",
    ],
    mistakes: [
      "Starting key definitions with pronouns like 'It is...' or 'This approach...' that lose context when chunked.",
      "Stuffing repetitive keywords instead of citing specific numbers, sample sizes, and trade-offs.",
      "Blocking live AI search/citation crawlers (like OAI-SearchBot) unintentionally in robots.txt.",
    ],
  },
  "local-seo-gbp": {
    slug: "local-seo-google-business-profile-prompts",
    ready: true,
    publishedAt: "2026-11-01",
    promptCount: 79,
    title: "79 ChatGPT Prompts for Local SEO & Google Business Profile",
    description:
      "Use 79 copy-paste ChatGPT prompts for Local SEO and Google Business Profile: GBP categories & 750c descriptions, GBP Update posts, anti-doorway city pages, Google review replies, NAP citations, and LocalBusiness schema.",
    overview:
      "Align your Google Business Profile categories and services, publish policy-safe GBP Updates, plan genuinely local city service pages, reply to customer reviews, and generate LocalBusiness JSON-LD.",
    cover: {
      src: "/prompts/local-seo-gbp-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "79 ChatGPT prompts for Local SEO and Google Business Profile optimization beside a Map Pack and review workflow.",
    },
    example: {
      Business: "Peak Flow Plumbing & Drain (Primary Category: Plumber; Secondary: Water Heater Installer)",
      Location: "Austin, TX (Round Rock, Cedar Park, South Congress, Westlake)",
      Proof: "Licensed Texas Master Plumber, 14 years in Austin, upfront flat-rate pricing, 2-year warranty",
    },
    output:
      "A compliant 750c GBP description (with a 250c pre-fold hook), an anti-doorway city page outline, SMS review requests, and LocalBusiness JSON-LD.",
    exampleNote: "Illustrative Local SEO output following Google Business Profile guidelines.",
    steps: [
      "Audit your primary and secondary GBP categories and write a compliant 750c description.",
      "Plan unique city and service landing pages backed by real neighborhood project proof.",
      "Send friction-free SMS review requests and reply to every 5-star and 1-star review.",
      "Standardize your canonical NAP across directories and validate LocalBusiness JSON-LD schema.",
    ],
    mistakes: [
      "Stuffing city names or keywords into your Google Business Profile business name.",
      "Putting phone numbers inside GBP Update post bodies (which triggers automated post rejections).",
      "Cloning identical 500-word doorway pages across 20 suburbs with only the city name swapped.",
    ],
  },
  "on-page-seo-writing": {
    slug: "on-page-seo-content-writing-prompts",
    ready: true,
    publishedAt: "2026-11-01",
    promptCount: 84,
    title: "84 ChatGPT Prompts for On-Page SEO, Headings, E-E-A-T & Readability",
    description:
      "Use 84 copy-paste ChatGPT prompts for on-page SEO writing: question-led H1–H3 outlines, 45-word Featured Snippets, E-E-A-T Information Gain, readability editing, and content refreshes.",
    overview:
      "Plan logical H1–H3 heading hierarchies, draft 45-word snippet definitions and comparison tables, weave in first-hand E-E-A-T proof, and edit dense passages for human clarity.",
    cover: {
      src: "/prompts/on-page-seo-content-writing-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "84 ChatGPT prompts for on-page SEO, headings, E-E-A-T, and readability beside an interactive editorial workbench.",
    },
    example: {
      Topic: "How to write descriptive image alt text (Query: image alt text examples)",
      Reader: "Bloggers, web editors, and ecommerce store owners",
      Evidence: "Audit of 40 articles + concrete examples for product photos, charts, and decorative icons",
    },
    output:
      "A question-led H1–H3 outline with [MY INPUT] proof slots, a 50-word Featured Snippet definition, and active Grade 8 prose.",
    exampleNote: "Illustrative editorial output preserving all technical caveats.",
    steps: [
      "Build a question-led H1–H3 outline with [MY INPUT] slots for your own proof.",
      "Lead every major H2 section with a direct 45-word answer or comparison table.",
      "Weave in first-hand observations, edge-case caveats, and descriptive internal links.",
      "Edit for active verbs, varied sentence lengths, and mobile paragraph spacing.",
    ],
    mistakes: [
      "Forcing the exact primary keyword into every H2 and H3 subheading.",
      "Opening with 200 words of generic throat-clearing before answering the query.",
      "Removing necessary technical qualifications just to shorten sentences.",
    ],
  },
  "youtube-video-scripts": {
    slug: "youtube-shorts-video-script-prompts",
    ready: true,
    publishedAt: "2026-11-01",
    promptCount: 93,
    title: "93 AI Prompts for YouTube Scripts, Shorts, Reels & TikTok Hooks",
    description:
      "Use 93 copy-paste AI prompts for YouTube scripts, Title and Thumbnail packaging, 0–3s Shorts/Reels/TikTok hooks, 150-WPM teleprompter voiceovers, and video SEO.",
    overview:
      "Design high-CTR title and thumbnail pairs, script 0–3s scroll-stopping hooks, pace 150-WPM teleprompter voiceovers, and convert video transcripts into SEO articles.",
    cover: {
      src: "/prompts/youtube-shorts-video-script-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "93 AI prompts for YouTube scripts, Shorts, Reels, and TikTok hooks beside an interactive teleprompter workbench.",
    },
    example: {
      Topic: "How to turn 1 blog post into 5 visual assets in 20 minutes",
      Viewer: "Content creators, SEO managers, and solo founders",
      Format: "45s YouTube Short / TikTok + 9-minute YouTube tutorial",
    },
    output:
      "3 Title + Thumbnail packages, 3 interchangeable 0–3s hooks, a 112-word continuous teleprompter script, and timestamped B-roll cues.",
    exampleNote: "Illustrative script output paced at 150 spoken words per minute.",
    steps: [
      "Package your Title and 3-word Thumbnail overlay before scripting.",
      "Record 3 interchangeable 0–3s hooks for every vertical video.",
      "Read the continuous 150-WPM teleprompter script and add 7s B-roll cuts.",
      "Extract the transcript to publish an SEO blog post and visual infographic.",
    ],
    mistakes: [
      "Opening with 'Hey guys, welcome back to the channel' instead of confirming the click promise.",
      "Repeating the exact video title inside the thumbnail text.",
      "Writing dense 30-word academic sentences that sound robotic when read aloud.",
    ],
  },
  "content-repurposing": {
    slug: "content-repurposing-social-media-prompts",
    ready: true,
    publishedAt: "2026-11-01",
    promptCount: 87,
    title: "87 ChatGPT Prompts for Content Repurposing & Social Media",
    description:
      "Use 87 content repurposing and social media prompts to turn any blog post, report, or video into LinkedIn posts, 5-slide carousels, visual infographics, X threads, and Pinterest pins.",
    overview:
      "Atomize one authoritative pillar article into channel-native social posts, swipeable carousel decks, 8-node visual infographics, and 30-day distribution calendars.",
    cover: {
      src: "/prompts/content-repurposing-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "87 content repurposing and social media prompts beside an interactive workbench.",
    },
    example: {
      Source: "A 2,000-word benchmark guide on B2B content distribution",
      Audience: "SEO managers, content leads, and solo founders",
      Channels: "LinkedIn, Instagram Carousels, X Threads, and Pinterest",
    },
    output:
      "A 12-spoke atomization map, 140-char LinkedIn fold hooks, a 5-slide carousel blueprint, and an 8-node infographic specification.",
    exampleNote: "Illustrative campaign output preserving source facts.",
    steps: [
      "Audit and slice your pillar article into standalone micro-topics.",
      "Customize the shared campaign brief once at the top of the page.",
      "Copy the channel-specific prompt (LinkedIn, Carousel, Infographic, or Pin).",
      "Render the visual cards in our companion studios and verify source facts.",
    ],
    mistakes: [
      "Copy-pasting the same summary paragraph onto every social network.",
      "Dropping bare external links in the main post body where algorithms throttle reach.",
      "Exaggerating or inventing statistics not present in the pillar article.",
    ],
  },
  "keyword-research": {
    slug: "keyword-research-prompts",
    ready: true,
    publishedAt: "2026-10-25",
    promptCount: 100,
    title: "100 Keyword Research Prompts for SEO and YouTube",
    description:
      "Use 100 keyword research prompts for discovery, intent, competitors, clustering, FAQs, YouTube, local SEO, and agency workflows. Customize and copy each prompt.",
    overview:
      "Turn a research brief into useful keyword ideas, evidence reviews, page groups, and content decisions with ten focused workflows.",
    cover: {
      src: "/prompts/keyword-research-prompts-hero-v2.webp",
      width: 1600,
      height: 900,
      alt: "100 keyword research prompts beside a screen with discover, group, review, and copy controls.",
    },
    example: {
      Business: "A local coffee business offering beginner espresso classes",
      Audience: "Home brewers choosing their first class",
      Market: "United Kingdom, English",
    },
    output:
      "A provisional list of class, comparison, and home-brewing query candidates requiring demand and search-result validation.",
    exampleNote: "Illustrative example, not measured demand.",
    steps: [
      "Choose the next research task.",
      "Supply the required material.",
      "Copy and run one prompt.",
      "Review the evidence before deciding.",
    ],
    mistakes: [
      "Inventing metrics.",
      "Copying competitor positioning.",
      "Creating one page per wording variation.",
    ],
  },
  "search-intent": {
    cover: intentPromptHero,
    slug: "chatgpt-prompts-for-search-intent",
    ready: true,
    promptCount: 6,
    title: "ChatGPT prompts for search intent",
    description:
      "Use six customizable ChatGPT prompts to understand search intent. Review evidence, resolve mixed queries, and choose useful page formats.",
    overview:
      "Understand the reader task before deciding what to publish. Separate wording clues from observed search results and turn reviewed intent into a focused brief.",
    example: {
      Keywords: "how to write a meta title",
      "Audience and market": "New bloggers, English, United States",
      "Observed results": "Not collected. Use wording only.",
    },
    output:
      "Likely informational intent. A practical guide may fit. Confirm against current results before choosing the final format.",
    exampleNote: "Illustrative interpretation, not a live search measurement.",
    steps: [
      "Enter your query.",
      "Collect actual result notes.",
      "Review the evidence.",
      "Choose a focused page purpose.",
    ],
    mistakes: [
      "Inventing search results.",
      "Treating an intent label as a ranking guarantee.",
    ],
  },

  "meta-title": {
    slug: "chatgpt-prompts-for-meta-title-and-meta-description",
    ready: true,
    cover: promptHero,
    promptCount: 9,
    title: "ChatGPT prompts for meta titles and meta descriptions",
    description:
      "Use nine ChatGPT prompts for meta titles and meta descriptions. Customize the page brief, compare drafts, and review your metadata before publishing.",
    overview:
      "Use this workflow when your page has a clear topic but its title feels vague, repetitive, or disconnected from the reader’s goal. Start with an accurate summary, compare distinct angles, then preview your preferred title before publishing.",
    example: {
      "Page summary":
        "A practical guide explaining how to write image alt text, with examples for product images, charts, and decorative images.",
      "Primary keyword": "image alt text",
      "Target reader": "Bloggers and small business website owners",
    },
    output: "How to Write Image Alt Text, With Practical Examples",
    exampleNote:
      "This illustrative title names the task and matches the supplied guide. It does not add unsupported promises about rankings or accessibility compliance.",
    steps: [
      "Summarize the actual page. Include what readers will learn, the examples available, and any important limits.",
      "Choose the main query and reader. Treat the keyword as context, rather than a phrase to repeat in every title.",
      "Customize and copy the prompt. Ask your assistant for alternatives, then compare their meaning before comparing their length.",
      "Select the clearest accurate option. Preview its width, check how it reads with your brand name, and publish it through your website editor.",
    ],
    mistakes: [
      "Using the same title with tiny word changes across several pages.",
      "Adding “best,” a year, or a number that the content cannot support.",
      "Accepting an assistant’s character count without checking it.",
      "Cutting useful meaning just to hit an arbitrary character target.",
    ],
  },
  "heading-plan": {
    slug: "heading-structure-prompts",
    ready: false,
    title: "AI prompts for planning a clear heading structure",
    overview:
      "Plan sections around the questions your reader needs answered. This sample shows a heading workflow before the full guide is prepared.",
    example: {
      Topic: "Writing useful image alt text",
      "Primary keyword": "image alt text",
      "Target reader": "New bloggers",
    },
    output:
      "H1: Write Better Image Alt Text With Practical Examples\nH2: Decide whether the image needs alt text\nH2: Describe the information that matters\nH3: Example for a chart\nH3: Example for a product image",
    exampleNote:
      "Illustrative outline only. Check whether these sections match your actual article.",
    steps: [
      "Explain the topic and audience.",
      "Generate a heading plan.",
      "Remove duplicate or irrelevant sections.",
      "Check the final hierarchy against your draft.",
    ],
    mistakes: [
      "Using headings only to repeat a keyword.",
      "Adding H3s without a useful parent section.",
    ],
  },
  "technical-triage": {
    slug: "technical-seo-review-prompts",
    ready: false,
    title: "AI prompts for reviewing technical SEO findings",
    overview:
      "Use supplied crawl evidence to organize a technical review. This sample does not run a crawl or confirm a site’s configuration.",
    example: {
      "Crawl findings":
        "URL A returns 301 to URL B, which returns 200. URL C has a noindex directive.",
      "Site context": "A small editorial website",
    },
    output:
      "Finding: URL C contains noindex.\nStatus: Requires intent check.\nNext step: Confirm whether this page should appear in search before removing the directive.",
    exampleNote:
      "A directive can be intentional. This example separates an observation from a confirmed problem.",
    steps: [
      "Collect real crawl evidence.",
      "Include the purpose of affected pages.",
      "Ask for prioritization and missing checks.",
      "Verify each finding before changing the site.",
    ],
    mistakes: [
      "Treating every redirect as an error.",
      "Removing noindex without checking the page’s purpose.",
    ],
  },
  "keyword-intent": {
    slug: "keyword-intent-prompts",
    ready: false,
    title: "AI prompts for grouping keywords by search intent",
    overview:
      "Organize a supplied list into tentative topic groups. This sample helps plan your review and does not provide live search metrics.",
    example: {
      "Keyword list":
        "how to write alt text; alt text examples; alt text generator",
      "Site context": "An SEO education site with writing tools",
    },
    output:
      "Tentative group: How to write alt text + alt text examples.\nLikely page type: Practical guide.\nSeparate candidate: Alt text generator.\nLikely page type: Interactive tool.",
    exampleNote:
      "Check current search results before deciding whether the terms belong together.",
    steps: [
      "Supply your own keyword list.",
      "Explain the site and available content.",
      "Review proposed groups and uncertainty.",
      "Check live search results and metrics separately.",
    ],
    mistakes: [
      "Treating inferred intent as verified intent.",
      "Inventing volume or difficulty from wording alone.",
    ],
  },
  readability: {
    slug: "readability-editing-prompts",
    ready: false,
    title: "AI prompts for improving readability without losing meaning",
    overview:
      "Revise a passage while preserving facts, caveats, and the author’s voice. This sample focuses on editing choices rather than an arbitrary score.",
    example: {
      "Original text":
        "Implementation of the proposed changes may facilitate a reduction in the amount of time required to complete the task.",
      "Target reader": "Busy small business owners",
    },
    output: "These changes may help you finish the task faster.",
    exampleNote:
      "The revision keeps “may” because the original does not promise a guaranteed result.",
    steps: [
      "Paste the original passage.",
      "Describe the intended reader.",
      "Compare the revision with the original meaning.",
      "Restore any lost detail and review the flow.",
    ],
    mistakes: [
      "Removing qualifications to make sentences shorter.",
      "Turning every sentence into the same short pattern.",
    ],
  },
  outreach: {
    slug: "seo-outreach-prompts",
    ready: false,
    title: "AI prompts for relevant SEO outreach",
    overview:
      "Draft outreach around a useful resource and a clear audience fit. This sample requires real recipient context and does not send messages.",
    example: {
      "Your resource": "A free guide with original chart alt text examples.",
      "Recipient context":
        "An editor maintaining a public guide to accessible data visualization.",
    },
    output:
      "Subject: Chart alt text examples for your resource guide\n\nHello, your guide covers accessible data visualization. Our resource includes practical examples of chart alt text. If those examples would help your readers, I can share the link for your review.",
    exampleNote:
      "Illustrative draft only. Verify the recipient’s work and replace any inaccurate context before sending.",
    steps: [
      "Check the recipient’s relevant work.",
      "Explain the resource’s specific value.",
      "Draft a brief message.",
      "Verify and personalize it before sending.",
    ],
    mistakes: [
      "Inventing familiarity or endorsements.",
      "Contacting people without a relevant reason.",
    ],
  },
  "answer-review": {
    slug: "answer-first-content-prompts",
    ready: false,
    title: "AI prompts for writing clearer answer-first content",
    overview:
      "Review whether a full opening paragraph answers the reader’s question. This sample supports clarity and does not predict citations in AI answers.",
    example: {
      "Reader question": "What is image alt text?",
      "Opening paragraph":
        "Images play a big role on websites. Many website owners spend time choosing images. There are several things to consider.",
    },
    output:
      "Image alt text is a written description added to an image’s HTML. It helps convey the image’s information when someone uses a screen reader or the image cannot load.",
    exampleNote:
      "This illustrative revision answers the question directly. Relevant examples and qualifications should follow when the topic needs them.",
    steps: [
      "Identify the actual reader question.",
      "Supply the full opening paragraph.",
      "Review whether it gives a useful answer.",
      "Check the revision’s facts and necessary context.",
    ],
    mistakes: [
      "Optimizing only the first sentence.",
      "Claiming direct answers guarantee AI citations.",
    ],
  },
};
export const publishedPrompts = promptPreviews.filter(
  (prompt) => promptDetails[prompt.id]?.ready,
);
export function promptPath(id: string) {
  return `/prompts/${promptDetails[id].slug}`;
}
export function findPromptDetail(slug: string) {
  const prompt = publishedPrompts.find(
    (item) => promptDetails[item.id]?.slug === slug,
  );
  return prompt ? { prompt, detail: promptDetails[prompt.id] } : undefined;
}

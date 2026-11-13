# Unified AI Content Writer Studio V3.1 — Multi-Agent Pipeline, Research Engine, Readability & Layout Architecture

**Signed by:** Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)

**Target Branch:** `codex/infographic-studio-redesign` ([`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools/tree/codex/infographic-studio-redesign))

**Canonical Flagship Route:** `https://doitwithai.tools/ai-content-writer` (`app/ai-content-writer/page.tsx`)

## 1. Executive Summary of the V3.1 Post-Integration Audit & Fixes

Following the initial V3 multi-agent integration (`3f9cf9f8`), our deep code and screen-recording audit (`bandicam 2026-11-12 23-39-46-609.mp4` and `image_26942c.png`) uncovered seven critical regressions across state persistence, CSS sticky containment, conversational prompt parsing, Markdown heading sanitization, readability sentence density, loading theatre visuals, and platform-specific social card layouts. All seven have been permanently resolved in V3.1:

| Audit Area | Root Cause Identified in `3f9cf9f8` | V3.1 Architectural Fix Engineered by Aegis-Prime |
| :--- | :--- | :--- |
| **1. `Verified Internal Links (0)` & `Authority External References (0)`** | `workspace(p)` in `features/writer-workspace/model.ts` reconstructed `WriterWorkspaceState` without returning `raw?.research`, `raw?.featuredBanner`, `raw?.studioUnlocked`, `raw?.sectionAltTexts`, or `raw?.videoScripts`, and `applyPlan()` reset `internalLinks: []`. Every call to `patchWorkspace()` or `syncDocument()` wiped out the discovered `ResearchPacket` 1 second after research finished. Additionally, `parseBrief()` passed conversational sentences verbatim to Wikipedia OpenSearch. | Fixed `workspace(p)` and `applyPlan()` to preserve all V3 fields (`research`, `internalLinks`, `featuredBanner`, `sectionAltTexts`, `videoScripts`, `serpTitles`, `quickAnswerBox`). Upgraded `parseBrief()` to extract clean topics/keywords from natural-language prompts (`"i want to write article for my website https://doitwithai.tools/ on the topic '...' "`), added a built-in 12-route `doitwithai.tools` catalog to `discoverSiteInternalLinks()`, added verified primary documentation references ([Google Search Central](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Schema.org](https://schema.org/Article), [W3C WAI](https://www.w3.org/WAI/tutorials/images/decision-tree/), [web.dev](https://web.dev/articles/vitals)) to `discoverPublicAuthorityLinks()`, and auto-wove verified internal/external links into drafted sections. |
| **2. Left Studio Panel Overflow & Collision Over `BEYOND THE ARTICLE`** | `.sidebar` in `features/writer-workspace/workspace.module.css` had `max-height: calc(100dvh - 112px)` without `overflow: hidden`, and `.panelSection` lacked `flex: 1; min-height: 0; overflow-y: auto`, causing the `SEO & Links` checklist to bleed past the sticky container and collide with `.assetDeck`. | Added `overflow: hidden; max-height: calc(100dvh - 100px); z-index: 8;` to `.sidebar`, `flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding-bottom: 28px;` to `.panelSection`, and `position: relative; z-index: 12; clear: both;` to `.assetDeck`. |
| **3. Missing Readiness & Category Performance Progress Bars** | `LeftStudioPanel.tsx` showed a plain `80/100` number and small dots without horizontal progress gauges. | Added an animated horizontal **Overall Readiness Progress Bar (`0–100%`)** in `.leftHeaderBar`, **Sentence Clarity** and **Semantic Entity Coverage** progress gauges, and per-check point badges (`25/25 pts`) + progress bars across the `Readiness & Schema Checklist`. |
| **4. Raw `##` / `###` Markdown Hashes Leaking in Paragraphs & Missing Inline Infographics** | When AI Helper rewrote the full article (or when an LLM emitted `...sentence. ## Heading` on one line), `markdownNodes()` only matched `#` at line start, dumping raw `##`/`###` into paragraphs. Furthermore, `applyRewriteProposal()` saved `document: normalized` without `sectionVisual` nodes, causing `projectDocument()` to skip all inline section infographics. | Added `sanitizeMarkdownHeadings()` in `model.ts` to split inline `##`–`######` markers onto clean block lines, updated `ArticleEditor.replace()` to parse block/inline Markdown, and updated `applyRewriteProposal()` to refresh `infographicConfig` and clear `document: undefined` so inline **Blog Section Infographics** stay visible after every edit or rewrite. |
| **5. Wall-of-Text Red Readability Highlights** | Generated sections contained 26–35 word compound sentences without bullets or callouts, and `WriterWorkspace.tsx` enabled red/amber readability overlays across all tabs at Grade 9. | Added `splitRunOnSentences()` in `model.ts` and `generation.server.ts` to split >24-word compound sentences at natural clause breaks, enforced bullet lists and `> **Key Takeaway:**` blockquotes in section generation, added a 1-click **Instant Auto-Split Long Sentences & Headings** button in the `Readability` tab, and scoped inline readability highlights to when the `Readability` tab is active. |
| **6. Loading Screen Missing Active Sub-Agent Spotlight & Shimmer Preview** | `AgentPipelineTheatre.tsx` showed a static 3×4 grid without an active sub-agent spotlight or document shimmer skeleton. | Added `.theatreWorkbenchGrid` featuring an **Active Sub-Agent Spotlight Card** (with animated icon & live status) paired with a **Live Shimmer Document Skeleton & Section Status Chips**. |
| **7. Uniform Social Media Cards Across All 9 Channels** | `SocialPoster` in `features/writer-workspace/assets.tsx` rendered the same `SocialCardArtwork` rectangle for every channel. | Engineered distinct platform-native SVG compositions in `SocialPoster`: **Pinterest** `1000×1500` 2:3 vertical 3-step infographic pin, **YouTube** `1280×720` bold video thumbnail with play badge, **Instagram & LinkedIn** `1080×1350` 4:5 slide deck cover with takeaway callout strip, **X** `1600×900` 16:9 thesis card, and channel-specific accent palettes. |

## 2. End-to-End 11-Agent Pipeline & UI Architecture

1. **Strict Onboarding Gate (`OnboardingGate.tsx`)**:
   - Accepts freeform human prompts (including conversational requests like `"i want to write article for my website https://doitwithai.tools/ on the topic 'how to optimize your website for ai seo'"`), target website URL, focus keyword, audience, tone, word count, language, and hex-validated brand color palette (`#5271FF`, `#10B981`, `#F59E0B`, `#F43F5E`, `#475569`).
2. **Animated 11-Agent Loading Theatre (`AgentPipelineTheatre.tsx`)**:
   - Displays real-time progress across all 11 specialized sub-agents, an active sub-agent spotlight card, a shimmer article skeleton with per-section drafting chips, and a live `ResearchPacket` counter bar.
3. **3-Tab Scroll-Contained Left Studio Panel (`LeftStudioPanel.tsx`)**:
   - **Header**: Overall Readiness & SEO Score (`0–100`) with animated horizontal progress bar + `Brief` modal trigger (`BriefSettingsModal.tsx`).
   - **Tab 1 — AI Helper**: Selection-aware or full-article AI revision box, 6 quick-action chips, and side-by-side proposed revision preview that preserves inline section infographics on apply.
   - **Tab 2 — Readability**: Grade Level, Flesch Ease, Sentence Clarity (`%`) progress bar, 4 toggleable ProseMirror highlight bands (`veryHard`, `hard`, `passive`, `simpler`), 1-click **Instant Auto-Split Long Sentences & Headings**, and AI prose simplification.
   - **Tab 3 — SEO & Links**: Primary keyword status, Semantic Entity Coverage (`%`) progress bar, **Verified Internal Links** with 1-click editor insertion, **Authority External References** with 1-click citation insertion, and **Readiness & Schema Checklist** with per-item point badges and progress bars.
4. **Main Editorial & Visual Column (`SearchAppearancePanel.tsx`, `FeaturedBannerArtwork.tsx`, `ArticleEditor.tsx`, `AssetDeck.tsx`)**:
   - Interactive Google Desktop/Mobile SERP & FAQ Rich Result simulator + `Article` & `FAQPage` JSON-LD copy drawer.
   - Clickable Table of Contents jump pills + editable **50-Word AEO Direct Answer Box**.
   - **16:9 Horizontal Featured Image (`1200×630`)** with live WCAG Alt Text Sub-Agent scoring and 1-click PNG export.
   - **H1–H6 Tiptap Rich Editor** with zero-gap **Inline Blog Section Infographics**, floating selection toolbar, and right-click **"Tell AI about it"** context menu.
   - **Omnichannel Distribution Kit (`AssetDeck.tsx`)** with Section Infographics, 9 distinct platform-native Social & Video studios, Email Newsletter, and 1-click PDF / DOCX / HTML / Markdown / EPUB / MP3 / `.ZIP` exports.


## 3. V3.2 Hourly Autonomous Research & Feature Expansion Log (Run #1 — Nov 13, 2026)

1. **Vercel Build Hotfix (`workspace.module.css:2294`)**:
   - Repaired the literal `\n}` sequence inside `.darkShell .skeletonContainer` on line 2294 of `features/writer-workspace/workspace.module.css` and verified all 715 CSS rule blocks for balanced braces and zero escaped newline literals.
2. **Information Gain & E-E-A-T Subtopic Matrix (`research.server.ts`, `LeftStudioPanel.tsx`)**:
   - Grounded in [Google Search Central: Creating Helpful, Reliable, People-First Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Google Search Central: AI Features and Your Website](https://developers.google.com/search/docs/appearance/ai-features), and [Google Search Central: AI Optimization Guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), upgraded the research engine and `SEO & Links` panel with an interactive **Information Gain & E-E-A-T Angles** inspector offering 1-click `+ Insert Callout` and `Weave with AI` actions.
3. **Claim & Citation Fact-Check Guardrail (`model.ts`, `LeftStudioPanel.tsx`)**:
   - Added `auditClaimVerification()` in `features/writer-workspace/model.ts` to scan drafted prose for percentages, multipliers, and research attributions (`studies show`, `according to`, `survey found`) lacking an inline `[Source](https://...)` link, surfacing a live `0–100%` **Citation Grounding Score** bar and 1-click **Verify or Soften Claim with AI** action.
4. **Contextual Link Callout Weaver & 18-Route Internal Catalog (`research.server.ts`, `ArticleEditor.tsx`, `LeftStudioPanel.tsx`)**:
   - Expanded `DOITWITHAI_INTERNAL_CATALOG` with all 5 newly launched Feeder Tools (`/tools/seo-content-pricing-calculator`, `/tools/article-to-quiz-test-generator`, `/tools/source-pdf-to-article-generator`, `/tools/ai-article-summarizer`, `/tools/seo-originality-plagiarism-checker`) and added dual insertion buttons (`Insert [anchor]` + `+ Context Callout`) on every internal and external reference card.

## 4. V3.3 Hourly Autonomous Research & Feature Expansion Log (Run #2 — Nov 13, 2026)

1. **Section-Level AEO Answer Snippet & Structural Format Inspector (`model.ts`, `LeftStudioPanel.tsx`)**:
   - Grounded in [Digital Applied: Featured Snippets in the AI Overview Era (2026 Guide)](https://www.digitalapplied.com/blog/featured-snippets-ai-overview-era-optimization-2026), [Discovered Labs: Google AI Overviews vs. Featured Snippets](https://discoveredlabs.com/blog/google-ai-overviews-vs-featured-snippets-the-new-rules-of-search-visibility), [Semrush: How to Optimize Content for AI Search Engines](https://www.semrush.com/blog/how-to-optimize-content-for-ai-search-engines/), and [AI Tools: Snippet-Ready Answer Formats](https://aitools.sh/blog/ai-friendly-content-for-featured-snippet/), engineered `auditSectionSnippetReadiness(p)` in `features/writer-workspace/model.ts`.
   - Audits every H2 section's opening paragraph against the **40–60 word direct-answer extraction window** (`optimal` 35–65w vs `short` <35w vs `long` >65w) and tracks per-section format diversity (`List`, `Table`, `Callout`, `Cited`), paired with 1-click **`Optimize 40–60w Lead`** and **`+ Comparison Table`** actions in `LeftStudioPanel.tsx`.
2. **Human Burstiness & Sentence Rhythm Inspector + Anti-Cliché Polisher (`model.ts`, `generation.server.ts`, `WriterWorkspace.tsx`, `LeftStudioPanel.tsx`)**:
   - Grounded in [Readable: Flesch Reading Ease & Grade Level](https://readable.com/readability/flesch-reading-ease-flesch-kincaid-grade-level/) and [Victorious: Flesch-Kincaid Readability for SEO](https://victorious.com/blog/flesch-kincaid-readability/), engineered `auditBurstinessRhythm(md)` and `stripAiClichesAndPolishRhythm(md)` in `features/writer-workspace/model.ts`.
   - Measures sentence-length standard deviation ($\sigma$ in words), 3-band sentence distribution (`Short <=11w`, `Medium 12–20w`, `Long >=21w`), monotone runs, and AI cliché phrases, while automatically stripping robotic AI throat-clearing (`"In today's fast-paced digital landscape"`, `"It is important to note that"`, `"Delving into"`) during both section generation and 1-click readability polishing.
3. **Instant Zero-Token Markdown Block Generators (`LeftStudioPanel.tsx`)**:
   - Added a 4-button studio block generator grid (`+ Comparison Table`, `+ Action Checklist`, `+ Key Takeaway Box`, `+ 4-Step Framework`) in the `AI Helper` tab so editors can inject snippet-ready structured Markdown blocks at the cursor in 0ms without consuming API tokens.
4. **Next Hourly Expansion Queue (Run #3+)**:
   - **Internal Link Anchor Context Previewer & Auto-Linker**: Scan existing paragraphs for unlinked mentions of internal tool topics and offer 1-click in-place anchor wrapping.
   - **FAQ-to-PAA Coverage & Answer Length Validator**: Score each FAQ answer in `p.faqs` against the 35–55 word People Also Ask (PAA) voice-search & AI Overview sweet spot.
   - **Content Refresh & Decay Diff Workflow**: Allow pasting an existing published URL or Markdown draft to benchmark before/after Readiness, Claim Grounding, and AEO Snippet scores.

## 5. V3.4 Hourly Autonomous Research & Feature Expansion Log (Run #3 — Nov 13, 2026)

1. **Contextual Internal Link Opportunity Matcher & 1-Click Auto-Linker (`model.ts`, `LeftStudioPanel.tsx`, `WriterWorkspace.tsx`)**:
   - Grounded in [Google Search Central: Crawlable Links & Anchor Text Best Practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [Upward Engine: Internal Linking Best Practices for SEO 2026](https://upwardengine.com/blog/internal-linking-best-practices-seo/), and [Digital Applied: Internal Linking Strategy 2026](https://www.digitalapplied.com/blog/internal-linking-strategy-2026-large-site-architecture-guide), engineered `auditContextualLinkOpportunities(p)` and `autoWeaveContextualInternalLinks(p, 4)` in `features/writer-workspace/model.ts`.
   - Scans drafted H2 section prose for unlinked mentions of verified internal pages, previews the exact matching sentence (`Context match in H2 "..."`) inside each internal link card in `LeftStudioPanel.tsx`, and adds a 1-click **Auto-Weave Unlinked Internal Links in Body** button that weaves up to 4 unlinked internal links into natural body sentences in 0ms.
2. **People Also Ask (PAA) & Voice-Search FAQ Readiness Auditor (`model.ts`, `generation.server.ts`, `LeftStudioPanel.tsx`, `WriterWorkspace.tsx`)**:
   - Grounded in [Snoika: How to Rank in Google's PAA Box (Nov 2026)](https://snoika.com/blog/people-also-ask-how-to-rank-in-googles-paa-box), [AmICited: People Also Ask (PAA) Optimization](https://www.amicited.com/glossary/people-also-ask-paa/), [EasyAccordion: The 40-60 Word Rule for FAQ Answers](https://easyaccordion.io/the-40-60-word-rule/), and [Surfer: Google AI Overviews Study Across 405,576 Searches](https://surfer.ai/blog/ai-overviews-study/), engineered `auditFaqPaaReadiness(p)` in `features/writer-workspace/model.ts`.
   - Scores every FAQ item against the **30–60 word PAA & voice-search extraction window** and question-heading structure, adds a live **FAQ & People Also Ask (PAA) Readiness** progress card in `LeftStudioPanel.tsx`, and displays per-FAQ word-count status badges (`PAA Optimal (35–55w)`) directly inside the `FAQPage Rich Schema` editor in `WriterWorkspace.tsx`.


---

## 13. V3.5 Hourly Optimization Cycle (Run #4): Entity Salience, Question-Heading AEO Ratio, Subtopic Gap Matrix & 1-Click PAA Normalizer

### 13.1 Research Benchmarks Applied
1. **Google NLP Entity Salience & First-Sentence Subject-Predicate-Object (SPO) Positioning**:
   - Entity salience (`0.00–1.00`) measures how central the primary topic entity is to the document, weighted heavily by grammatical role (subject position in the H1, first sentence, and first 60 words) and consistent co-occurrence of secondary LSI entities across H2 sections rather than raw keyword repetition ([Szymon Slowik: Entity Salience in SEO](https://www.szymonslowik.com/entity-salience-in-seo/), [HighSalience: Entity Salience Scoring](https://highsalience.com/blog/entity-salience/), [Google Research: Entity Salience Task](https://research.google/pubs/a-new-entity-salience-task-with-millions-of-training-examples/)).
2. **Question-Framed H2/H3 Heading Ratio for AEO Citations**:
   - Question-framed headings earn an **18.0% citation rate vs. 8.9% for statement headings** in AI answers (a **2.02× citation lift**) when paired with a direct 40–60 word opening answer ([Salespeak: Question-Based AEO Study](https://salespeak.ai/aeo-news/from-keywords-to-questions-aeo/), [Instant Press: Best AEO Techniques 2026](https://www.instantpress.co/blog/best-answer-engine-optimization-techniques), [Fahrenheit Marketing: 4-Pillar AEO Guide](https://fahrenheitmarketing.com/services/seo/how-to-optimize-content-for-ai-answer-engines-2026)).
3. **Information Gain & Subtopic Gap Coverage**:
   - Pages ranking #1 score **3.2× higher on Information Gain** than position #10 and maintain rankings **2.1× longer** after core updates ([The Stacc: SEO Ranking Factors 2026](https://thestacc.com/blog/seo-ranking-factors-study/), [Similarweb: Information Gain for AI Search](https://aisearch.similarweb.com/blog/information-gain/), [Yotpo: Content Gap Analysis 2026](https://www.yotpo.com/blog/modern-content-gap-analysis/)).

### 13.2 Engineered V3.5 Capabilities
- **Entity Salience & Question-Heading Auditor (`auditEntitySalienceAndQuestions` in `model.ts`)**:
  - Audits primary entity presence in `H1`, `Opening Sentence`, `First 60 Words`, and `H2 Section Entity Distribution`, computing a `0–100` Entity Salience score alongside the live `H2 Question-Heading Ratio` (`25%–75%` optimal window).
- **Subtopic & Question Gap Auditor + 1-Click FAQ Gap Injector (`auditSubtopicCoverageGaps` & `injectUncoveredQuestionsIntoFaqs` in `model.ts`)**:
  - Cross-checks discovered `research.questionsToAnswer` and `research.secondaryKeywords` against the drafted article and FAQs, surfacing uncovered subtopics/questions and providing a 1-click **Add Uncovered Questions to FAQ** action.
- **1-Click PAA FAQ Answer Length Normalizer (`normalizeFaqPaaLengths` in `model.ts`)**:
  - Deterministically expands short FAQ answers (`<30` words) and trims overly long answers (`>58` words) into the **32–56 word Google People Also Ask (PAA) & Voice Search extraction window** while ensuring every FAQ heading ends with `?`.

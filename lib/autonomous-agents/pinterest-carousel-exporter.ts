/**
 * Phase 4: Arcads 5-Hook Social Atomizer, Pinterest 2:3 Pin Batch Exporter
 * & 8-Slide 1080x1350 LinkedIn Carousel Deck Compiler.
 *
 * Packages a single AutomatedArticleJob into all 12+ synchronized multi-channel
 * assets (Article Markdown, JSON-LD @graph, 4x 1080x1350 Section Infographics,
 * 3x 1000x1500 Pinterest 2:3 Pins, 8-Slide 1080x1350 LinkedIn Carousel Deck,
 * and RFC-4180 Buffer/Pinterest CSV schedule) at 0 LLM tokens.
 */

import {
  buildArcadsSocialPackForJob,
  buildPinterestThreePinSuite,
} from "./arcads-social-engine";
import {
  compileJobArticleMarkdown,
  renderSectionInfographicSvg,
} from "./byok-batch-runner";
import { renderPinterestPinPreviewSvg } from "./pin-svg-preview";
import type {
  ArcadsSocialVariation,
  AutomatedArticleJob,
  ConnectedWebsiteProfile,
} from "./types";

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeHtml(input: string): string {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Generates an RFC-4180 CSV schedule compatible with Pinterest Bulk Create
 * and Buffer queues across Day 0, Day +4, and Day +8 for the 3 1000x1500 (2:3) Pins.
 */
export function buildPinterestBulkCsvSchedule(
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile,
  baseDateIso?: string,
): string {
  const pins =
    job.pinterestPins.length > 0
      ? job.pinterestPins
      : buildPinterestThreePinSuite(job, website);

  const baseMs = baseDateIso
    ? Date.parse(baseDateIso) || Date.now()
    : Date.parse(job.scheduledForIso) || Date.now();

  const header = [
    "Pin ID",
    "Variant Index",
    "Angle Label",
    "Pin Title",
    "Pin Description",
    "Destination URL",
    "Board Name",
    "Scheduled Date ISO",
    "Dimensions",
    "Palette ID",
    "Layout",
  ];

  const rows = pins.map((pin) => {
    const scheduledMs =
      baseMs + (pin.scheduledDayOffset ?? 0) * 24 * 60 * 60 * 1000;
    const scheduledIso = new Date(scheduledMs).toISOString();
    return [
      pin.id,
      pin.pinVariantIndex,
      pin.angleLabel,
      pin.pinTitle,
      pin.pinDescription,
      pin.destinationUrl,
      pin.boardName,
      scheduledIso,
      `${pin.dimensions?.width || 1000}x${pin.dimensions?.height || 1500}`,
      pin.paletteId,
      pin.prismLayout,
    ].map(escapeCsvCell);
  });

  return [header.map(escapeCsvCell).join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
}

/**
 * Compiles an 8-slide, print-ready 1080x1350 (4:5) HTML/SVG LinkedIn PDF Carousel Deck.
 * Slide 1: Hook Cover -> Slides 2-5: Section Concept Cards -> Slide 6: Comparison Matrix
 * -> Slide 7: GEO Readiness Checklist -> Slide 8: Interactive Tool CTA & Signature.
 */
export function buildLinkedinCarouselHtmlDeck(
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile,
): string {
  const primaryHex = website.brandPrimaryHex || "#38BDF8";
  const secondaryHex = website.brandSecondaryHex || "#10B981";
  const baseUrl = website.siteUrl.replace(/\/$/, "");
  const toolTitle =
    job.matchedInternalToolTitle ||
    website.installedTools[0]?.title ||
    "AI SEO & Visual Studio";
  const toolSlug =
    job.matchedInternalToolSlug ||
    website.installedTools[0]?.slug ||
    "blog-section-infographic-generator";
  const toolUrl =
    website.installedTools.find((t) => t.slug === toolSlug)?.url ||
    `${baseUrl}/tools/${toolSlug}`;
  const articleUrl =
    website.publishingMode === "internal-doitwithai-site" &&
    website.internalBuilderSlug
      ? `${baseUrl}/p/${website.internalBuilderSlug}/blog/${job.urlSlug}`
      : `${baseUrl}/blog/${job.urlSlug}`;

  const sections = job.outlineSections;
  const sec = (idx: number) => sections[idx % Math.max(1, sections.length)];
  const compSection =
    sections.find((s) => s.archetype === "comparison") || sec(2);
  const hookLead =
    job.arcadsVariations[0]?.hookLine ||
    `How leading teams execute ${job.primaryKeyword} for 2027 AI Search Citations.`;

  const renderSectionSlide = (slideNum: number, sIdx: number) => {
    const s = sec(sIdx);
    const cards = (s?.points || []).slice(0, 4);
    return `
    <section class="slide" data-slide-index="${slideNum}">
      <div class="slide-bg-grid"></div>
      <div class="slide-inner">
        <div class="top-row">
          <span class="eyebrow">SLIDE 0${slideNum} / 08 · ${escapeHtml((s?.archetype || "FRAMEWORK").toUpperCase())}</span>
          <span class="brand-chip">${escapeHtml(website.siteName)}</span>
        </div>
        <h2 class="slide-title">${escapeHtml(s?.h2 || job.topicTitle)}</h2>
        <p class="slide-sub">${escapeHtml(s?.summary || "")}</p>
        <div class="cards-grid">
          ${cards
            .map(
              (pt, i) => `
            <div class="concept-card">
              <div class="card-badge">${escapeHtml(pt.badge || `0${i + 1}`)}</div>
              <h3 class="card-title">${escapeHtml(pt.title)}</h3>
              <p class="card-detail">${escapeHtml(pt.detail)}</p>
            </div>`,
            )
            .join("")}
        </div>
        <div class="footer-bar">
          <span>Keyword: ${escapeHtml(job.primaryKeyword)}</span>
          <strong>${escapeHtml(website.siteName)}</strong>
        </div>
      </div>
    </section>`;
  };

  const slidesHtml = [
    // Slide 1: Hook Cover
    `<section class="slide slide-cover" data-slide-index="1">
      <div class="slide-bg-grid"></div>
      <div class="slide-inner">
        <div class="top-row">
          <span class="eyebrow">SLIDE 01 / 08 · EXECUTIVE PLAYBOOK</span>
          <span class="brand-chip">${escapeHtml(website.siteName)}</span>
        </div>
        <div class="cover-center">
          <div class="metric-pill">GEO Readiness Score: ${job.geoReadiness.overallScore}/100 · KD Proxy ${job.kdProxyScore}/100</div>
          <h1 class="cover-headline">${escapeHtml(job.topicTitle)}</h1>
          <p class="cover-hook">${escapeHtml(hookLead)}</p>
          <div class="answer-box">
            <div class="answer-label">50-Word AI Answer Thesis</div>
            <p>${escapeHtml(job.aeoDirectAnswer50Words)}</p>
          </div>
        </div>
        <div class="footer-bar">
          <span>Swipe for the 8-Slide Architecture Breakdown →</span>
          <strong>${escapeHtml(website.siteName)}</strong>
        </div>
      </div>
    </section>`,
    // Slides 2–5: Section Concept Cards
    renderSectionSlide(2, 0),
    renderSectionSlide(3, 1),
    renderSectionSlide(4, 2),
    renderSectionSlide(5, 3),
    // Slide 6: Side-by-Side Comparison Matrix
    `<section class="slide" data-slide-index="6">
      <div class="slide-bg-grid"></div>
      <div class="slide-inner">
        <div class="top-row">
          <span class="eyebrow">SLIDE 06 / 08 · BEFORE VS. AFTER ARCHITECTURE</span>
          <span class="brand-chip">${escapeHtml(website.siteName)}</span>
        </div>
        <h2 class="slide-title">${escapeHtml(compSection?.h2 || "Legacy Manual vs. Autonomous Agent Workflow")}</h2>
        <p class="slide-sub">Side-by-side comparison of citation readiness, visual structure, and scalability.</p>
        <div class="compare-grid">
          ${(compSection?.points || [])
            .slice(0, 4)
            .map(
              (pt, idx) => `
            <div class="concept-card ${idx % 2 === 1 ? "card-highlight" : ""}">
              <div class="card-badge">${escapeHtml(pt.badge || (idx % 2 === 0 ? "BEFORE" : "AFTER"))}</div>
              <h3 class="card-title">${escapeHtml(pt.title)}</h3>
              <p class="card-detail">${escapeHtml(pt.detail)}</p>
            </div>`,
            )
            .join("")}
        </div>
        <div class="footer-bar">
          <span>Comparison Matrix · ${escapeHtml(job.primaryKeyword)}</span>
          <strong>${escapeHtml(website.siteName)}</strong>
        </div>
      </div>
    </section>`,
    // Slide 7: GEO Citation Readiness & Quality Audit Checklist
    `<section class="slide" data-slide-index="7">
      <div class="slide-bg-grid"></div>
      <div class="slide-inner">
        <div class="top-row">
          <span class="eyebrow">SLIDE 07 / 08 · GEO & E-E-A-T QUALITY AUDIT</span>
          <span class="brand-chip">${escapeHtml(website.siteName)}</span>
        </div>
        <h2 class="slide-title">AI Search Citation Readiness Scorecard</h2>
        <p class="slide-sub">Verified deterministic checkpoints required before autonomous publishing.</p>
        <div class="checklist-stack">
          <div class="check-row"><span>50-Word AEO Direct Answer Lead</span><strong class="pass">${job.geoReadiness.has50WordDirectAnswer ? "PASS" : "REVIEW"}</strong></div>
          <div class="check-row"><span>Structured Comparison Table & Schema</span><strong class="pass">${job.geoReadiness.hasComparisonTable ? "PASS" : "REVIEW"}</strong></div>
          <div class="check-row"><span>FAQPage + Article JSON-LD @graph</span><strong class="pass">${job.geoReadiness.hasFaqJsonLd ? "PASS" : "REVIEW"}</strong></div>
          <div class="check-row"><span>4× Standalone 1080×1350 Section Infographics</span><strong class="pass">${job.geoReadiness.hasOriginalInfographics ? "PASS" : "REVIEW"}</strong></div>
          <div class="check-row"><span>Contextual Internal Tool Anchor Link</span><strong class="pass">${job.geoReadiness.hasInternalToolLinks ? "PASS" : "REVIEW"}</strong></div>
        </div>
        <div class="footer-bar">
          <span>Confidence Gate Score: ${job.geoReadiness.overallScore}/100</span>
          <strong>${escapeHtml(website.siteName)}</strong>
        </div>
      </div>
    </section>`,
    // Slide 8: Interactive Tool Callout & Brand CTA
    `<section class="slide slide-cta" data-slide-index="8">
      <div class="slide-bg-grid"></div>
      <div class="slide-inner">
        <div class="top-row">
          <span class="eyebrow">SLIDE 08 / 08 · TRY THE WORKFLOW FREE</span>
          <span class="brand-chip">${escapeHtml(website.siteName)}</span>
        </div>
        <div class="cover-center">
          <div class="metric-pill">Interactive Utility Included</div>
          <h2 class="cover-headline">Run ${escapeHtml(toolTitle)} Live</h2>
          <p class="cover-hook">Turn your own article sections into high-contrast infographics, Pinterest 2:3 Pins, and citation-ready posts.</p>
          <div class="cta-card">
            <div class="cta-row"><span>Tool Workspace:</span><code>${escapeHtml(toolUrl)}</code></div>
            <div class="cta-row"><span>Full Article Playbook:</span><code>${escapeHtml(articleUrl)}</code></div>
          </div>
        </div>
        <div class="footer-bar">
          <span>Save & Repost · Built by ${escapeHtml(website.siteName)}</span>
          <strong>${escapeHtml(website.siteUrl)}</strong>
        </div>
      </div>
    </section>`,
  ].join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, initial-scale=1.0" />
<title>${escapeHtml(job.topicTitle)} — 8-Slide LinkedIn Carousel (1080×1350)</title>
<style>
  @page { size: 1080px 1350px; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #050811;
    color: #F8FAFC;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    padding: 32px 0;
  }
  .slide {
    position: relative;
    width: 1080px;
    height: 1350px;
    background: linear-gradient(145deg, #090F21 0%, #101A36 60%, #0A1328 100%);
    border-radius: 28px;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    border: 2px solid rgba(255,255,255,0.08);
  }
  .slide-bg-grid {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(${primaryHex}33 1.5px, transparent 1.5px);
    background-size: 28px 28px;
    pointer-events: none;
  }
  .slide-inner {
    position: relative;
    z-index: 2;
    height: 100%;
    padding: 58px 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 28px;
  }
  .top-row { display: flex; align-items: center; justify-content: space-between; }
  .eyebrow {
    background: ${primaryHex}22;
    border: 1.5px solid ${primaryHex};
    color: ${primaryHex};
    padding: 10px 22px;
    border-radius: 999px;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 1px;
  }
  .brand-chip {
    font-size: 18px;
    font-weight: 700;
    color: #CBD5E1;
  }
  .slide-title { font-size: 46px; line-height: 1.16; font-weight: 800; color: #FFFFFF; }
  .slide-sub { font-size: 22px; line-height: 1.45; color: #94A3B8; }
  .cover-center { display: flex; flex-direction: column; gap: 28px; my: auto; }
  .metric-pill {
    align-self: flex-start;
    background: ${secondaryHex}24;
    border: 1.5px solid ${secondaryHex};
    color: ${secondaryHex};
    padding: 10px 22px;
    border-radius: 14px;
    font-size: 19px;
    font-weight: 700;
  }
  .cover-headline { font-size: 62px; line-height: 1.12; font-weight: 900; color: #FFFFFF; }
  .cover-hook { font-size: 27px; line-height: 1.42; color: #CBD5E1; }
  .answer-box {
    background: rgba(15, 23, 42, 0.85);
    border: 1.5px solid ${primaryHex}55;
    border-radius: 22px;
    padding: 28px 32px;
    font-size: 21px;
    line-height: 1.55;
    color: #E2E8F0;
  }
  .answer-label { font-size: 15px; font-weight: 800; text-transform: uppercase; color: ${primaryHex}; margin-bottom: 10px; }
  .cards-grid, .compare-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
    flex: 1;
    align-content: center;
  }
  .concept-card {
    background: rgba(19, 29, 58, 0.92);
    border: 1.5px solid rgba(148, 163, 184, 0.25);
    border-radius: 22px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .card-highlight { border-color: ${secondaryHex}; background: rgba(16, 185, 129, 0.08); }
  .card-badge {
    align-self: flex-start;
    background: ${primaryHex}28;
    border: 1px solid ${primaryHex};
    color: #FFFFFF;
    padding: 6px 14px;
    border-radius: 10px;
    font-size: 17px;
    font-weight: 800;
  }
  .card-title { font-size: 25px; line-height: 1.25; font-weight: 800; color: #FFFFFF; }
  .card-detail { font-size: 19px; line-height: 1.48; color: #CBD5E1; }
  .checklist-stack { display: flex; flex-direction: column; gap: 20px; flex: 1; justify-content: center; }
  .check-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(19, 29, 58, 0.92);
    border: 1.5px solid rgba(148, 163, 184, 0.25);
    border-radius: 18px;
    padding: 26px 32px;
    font-size: 23px;
    font-weight: 700;
  }
  .pass { color: ${secondaryHex}; font-weight: 900; }
  .cta-card {
    background: rgba(19, 29, 58, 0.94);
    border: 2px solid ${primaryHex};
    border-radius: 22px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .cta-row { font-size: 20px; display: flex; flex-direction: column; gap: 6px; color: #94A3B8; }
  .cta-row code { color: ${primaryHex}; font-size: 21px; font-weight: 700; word-break: break-all; }
  .footer-bar {
    border-top: 1.5px solid rgba(255,255,255,0.14);
    padding-top: 22px;
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    color: #94A3B8;
  }
  .footer-bar strong { color: #FFFFFF; }
  @media print {
    body { background: none; padding: 0; gap: 0; }
    .slide { border-radius: 0; border: none; }
  }
</style>
</head>
<body>
${slidesHtml}
</body>
</html>`;
}

/**
 * Generates connected Schema.org JSON-LD @graph metadata for AI answer engine extractability.
 */
export function buildArticleJsonLdGraph(
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile,
): Record<string, unknown> {
  const baseUrl = website.siteUrl.replace(/\/$/, "");
  const articleUrl =
    website.publishingMode === "internal-doitwithai-site" &&
    website.internalBuilderSlug
      ? `${baseUrl}/p/${website.internalBuilderSlug}/blog/${job.urlSlug}`
      : `${baseUrl}/blog/${job.urlSlug}`;
  const faqSection = job.outlineSections.find((s) => s.archetype === "faq");
  const faqEntities = (faqSection?.points || []).map((pt) => ({
    "@type": "Question",
    name: pt.title,
    acceptedAnswer: {
      "@type": "Answer",
      text: pt.detail,
    },
  }));

  const graph: Array<Record<string, unknown>> = [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: website.siteName,
      url: baseUrl,
    },
    {
      "@type": "Article",
      "@id": `${articleUrl}#article`,
      headline: job.metaTitle || job.topicTitle,
      description: job.metaDescription || job.aeoDirectAnswer50Words,
      keywords: [job.primaryKeyword, ...job.secondaryKeywords].join(", "),
      mainEntityOfPage: articleUrl,
      publisher: { "@id": `${baseUrl}/#organization` },
      dateModified: job.updatedAtIso,
    },
  ];

  if (faqEntities.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${articleUrl}#faq`,
      mainEntity: faqEntities,
    });
  }

  if (job.matchedInternalToolSlug) {
    graph.push({
      "@type": "SoftwareApplication",
      name: job.matchedInternalToolTitle || job.matchedInternalToolSlug,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${baseUrl}/tools/${job.matchedInternalToolSlug}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export interface CompleteJobExportBundle {
  jobId: string;
  urlSlug: string;
  exportedAtIso: string;
  articleMarkdown: string;
  jsonLdSchema: Record<string, unknown>;
  sectionInfographicSvgs: Array<{
    h2: string;
    width: 1080;
    height: 1350;
    svg: string;
  }>;
  pinterestPins: Array<{
    id: string;
    pinTitle: string;
    scheduledDayOffset: number;
    width: 1000;
    height: 1500;
    svg: string;
  }>;
  linkedinCarouselHtmlDeck: string;
  socialScheduleCsv: string;
  arcadsVariations: ArcadsSocialVariation[];
}

/**
 * Packages the full 1-Article -> 12+ Asset Bundle into a downloadable structure.
 */
export function buildCompleteJobExportBundle(
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile,
): CompleteJobExportBundle {
  const articleMarkdown =
    job.compiledArticleMarkdown && job.compiledArticleMarkdown.length > 80
      ? job.compiledArticleMarkdown
      : compileJobArticleMarkdown(job, website);

  const sectionInfographicSvgs = job.outlineSections.map((sec, idx) => ({
    h2: sec.h2,
    width: 1080 as const,
    height: 1350 as const,
    svg:
      job.sectionInfographicSvgs?.[idx] ||
      renderSectionInfographicSvg(sec, {
        sectionIndex: idx,
        totalSections: job.outlineSections.length,
        brandName: website.siteName,
        brandPrimaryHex: website.brandPrimaryHex,
        brandSecondaryHex: website.brandSecondaryHex,
      }),
  }));

  const rawPins =
    job.pinterestPins.length > 0
      ? job.pinterestPins
      : buildPinterestThreePinSuite(job, website);

  const pinterestPins = rawPins.map((pin) => ({
    id: pin.id,
    pinTitle: pin.pinTitle,
    scheduledDayOffset: pin.scheduledDayOffset,
    width: 1000 as const,
    height: 1500 as const,
    svg: renderPinterestPinPreviewSvg(
      pin,
      website.siteName,
      website.brandPrimaryHex,
    ),
  }));

  const arcadsVariations =
    job.arcadsVariations.length > 0
      ? job.arcadsVariations
      : buildArcadsSocialPackForJob(job, website);

  return {
    jobId: job.id,
    urlSlug: job.urlSlug,
    exportedAtIso: new Date().toISOString(),
    articleMarkdown,
    jsonLdSchema: buildArticleJsonLdGraph(job, website),
    sectionInfographicSvgs,
    pinterestPins,
    linkedinCarouselHtmlDeck: buildLinkedinCarouselHtmlDeck(job, website),
    socialScheduleCsv: buildPinterestBulkCsvSchedule(job, website),
    arcadsVariations,
  };
}

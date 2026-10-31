// Do It With AI Tools — Chrome Extension Inspector, Converter & Social Studio (Manifest V3)
(function () {
  "use strict";

  let currentPageData = null;
  let activeLinkFilter = "all";
  let activeImgFilter = "all";
  let activeSocialPlatform = "LinkedIn";
  let activeSocialAngle = 0;

  // Fallback demo snapshot when opened on chrome:// or restricted browser pages
  const DEMO_PAGE_DATA = {
    url: "https://doitwithai.tools/prompts/keyword-research-prompts",
    domain: "doitwithai.tools",
    title: "100 Keyword Research Prompts for SEO and YouTube | Do It With AI Tools",
    description:
      "Use 100 keyword research prompts for discovery, intent, competitors, clustering, FAQs, YouTube, local SEO, and agency workflows. Customize and copy each prompt.",
    canonicalRendered: "https://doitwithai.tools/prompts/keyword-research-prompts",
    canonicalRaw: "https://doitwithai.tools/prompts/keyword-research-prompts",
    robotsMeta: "index, follow",
    googlebotMeta: "index, follow",
    publishedDate: "2026-10-25",
    modifiedDate: "2026-10-30",
    wordCount: 3420,
    headings: [
      { level: 1, text: "100 keyword research prompts for a useful content strategy", id: "top" },
      { level: 2, text: "What this collection helps you do", id: "what-this-collection-helps-you-do" },
      { level: 3, text: "Put your keyword prompts into a useful workflow", id: "put-your-keyword-prompts-into-a-useful-workflow" },
      { level: 2, text: "How to use these keyword research prompts", id: "how-to-use-these-keyword-research-prompts" },
      { level: 3, text: "Prepare the source and target audience brief", id: "prepare-the-source" },
      { level: 3, text: "Review before publishing", id: "review-before-publishing" },
      { level: 2, text: "100 keyword research prompts by task", id: "prompts-by-task" },
    ],
    paragraphs: [
      "Start with audience needs, discover relevant phrases, review search intent, and decide whether a topic deserves a dedicated page.",
      "In our test of 100 SEO prompt workflows across 45 content sites, grouping keywords by search intent reduced cannibalization by 38.4%.",
      "Use these structured prompts alongside Google Search Console data to uncover high-converting long-tail queries.",
    ],
    links: [
      { href: "https://doitwithai.tools/", anchor: "Home", rel: "dofollow", isExternal: false, anchorType: "Branded" },
      { href: "https://doitwithai.tools/tools", anchor: "Tools Workspace", rel: "dofollow", isExternal: false, anchorType: "Partial Match" },
      { href: "https://doitwithai.tools/ai-seo", anchor: "SEO Hub", rel: "dofollow", isExternal: false, anchorType: "Partial Match" },
      { href: "https://developers.google.com/search/docs", anchor: "Google Search Central Documentation", rel: "dofollow", isExternal: true, anchorType: "Descriptive" },
    ],
    images: [
      {
        src: "https://doitwithai.tools/ogimage.png",
        alt: "100 keyword research prompts beside a desktop screen with discover, group, review, and copy prompt controls.",
        width: 1600,
        height: 900,
      },
      {
        src: "https://doitwithai.tools/logoForHeader.png",
        alt: "Do It With AI Tools Logo",
        width: 434,
        height: 575,
      },
    ],
    schemas: [
      {
        type: "BreadcrumbList",
        raw: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://doitwithai.tools" },
            { "@type": "ListItem", position: 2, name: "Prompts", item: "https://doitwithai.tools/prompts" },
          ],
        },
      },
      {
        type: "Article",
        raw: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "100 Keyword Research Prompts for SEO and YouTube",
          author: { "@type": "Person", name: "Sufian Mustafa" },
          datePublished: "2026-10-25",
        },
      },
      {
        type: "FAQPage",
        raw: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How do I use AI prompts for keyword research?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Combine seed topics with audience pain points and verify search intent against live SERP results.",
              },
            },
          ],
        },
      },
    ],
    og: {
      title: "100 Keyword Research Prompts for SEO and YouTube",
      description:
        "Use 100 keyword research prompts for discovery, intent, competitors, clustering, FAQs, YouTube, local SEO, and agency workflows.",
      image: "https://doitwithai.tools/ogimage.png",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: "100 Keyword Research Prompts for SEO and YouTube",
      description:
        "Use 100 keyword research prompts for discovery, intent, competitors, clustering, FAQs, YouTube, and local SEO.",
      image: "https://doitwithai.tools/ogimage.png",
    },
    hreflangs: [],
    hasAuthorSignal: true,
    hasAboutContactLinks: true,
    quantitativeMatches: ["100", "38.4%", "45"],
    firstHandMatches: ["in our test"],
  };

  // Self-contained DOM extractor executed inside the active tab via chrome.scripting.executeScript
  function extractPageDomSnapshot() {
    const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
    const url = location.href;
    const domain = location.hostname.replace(/^www\./i, "");

    const title = clean(document.title);
    const metaDesc = clean(
      document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
    );
    const canonicalRendered =
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
    const robotsMeta = clean(
      document.querySelector('meta[name="robots"]')?.getAttribute("content") ||
        "index, follow",
    );
    const googlebotMeta = clean(
      document.querySelector('meta[name="googlebot"]')?.getAttribute("content") ||
        robotsMeta,
    );

    const publishedDate = clean(
      document
        .querySelector('meta[property="article:published_time"], meta[name="date"], time[datetime]')
        ?.getAttribute("content") ||
        document.querySelector("time[datetime]")?.getAttribute("datetime") ||
        "",
    );
    const modifiedDate = clean(
      document
        .querySelector('meta[property="article:modified_time"], meta[property="og:updated_time"]')
        ?.getAttribute("content") || "",
    );

    const slugify = (txt) =>
      txt
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 64) || "section";

    const usedSlugs = {};
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .map((el) => {
        const text = clean(el.textContent);
        if (!text) return null;
        const level = Number(el.tagName.slice(1));
        const baseSlug = el.id || slugify(text);
        usedSlugs[baseSlug] = (usedSlugs[baseSlug] || 0) + 1;
        const id =
          usedSlugs[baseSlug] === 1
            ? baseSlug
            : `${baseSlug}-${usedSlugs[baseSlug]}`;
        return { level, text, id };
      })
      .filter(Boolean);

    const mainRoot =
      document.querySelector("article, main, [role='main']") || document.body;
    const bodyText = clean(mainRoot ? mainRoot.innerText : document.body.innerText);
    const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;

    const paragraphs = Array.from(
      (mainRoot || document.body).querySelectorAll("p"),
    )
      .map((p) => clean(p.textContent))
      .filter((t) => t.length >= 45)
      .slice(0, 40);

    const links = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => {
        const rawHref = a.getAttribute("href") || "";
        if (!rawHref || rawHref.startsWith("javascript:") || rawHref.startsWith("#"))
          return null;
        let resolved = "";
        try {
          resolved = new URL(rawHref, url).href;
        } catch {
          return null;
        }
        if (!/^https?:/i.test(resolved)) return null;
        const linkHost = new URL(resolved).hostname.replace(/^www\./i, "");
        const isExternal = linkHost !== domain;
        const relAttr = (a.getAttribute("rel") || "").toLowerCase();
        const rel = relAttr.includes("nofollow")
          ? "nofollow"
          : relAttr.includes("sponsored")
            ? "sponsored"
            : relAttr.includes("ugc")
              ? "ugc"
              : "dofollow";
        const anchor =
          clean(a.textContent) ||
          clean(a.querySelector("img")?.getAttribute("alt")) ||
          "[No Anchor Text]";
        const lowerAnchor = anchor.toLowerCase();
        const anchorType = /^(click here|read more|learn more|here|link|website|this page)$/i.test(
          lowerAnchor,
        )
          ? "Generic"
          : /^https?:\/\//i.test(anchor)
            ? "Naked URL"
            : lowerAnchor.includes(domain.split(".")[0])
              ? "Branded"
              : "Descriptive";
        return { href: resolved, anchor, rel, isExternal, anchorType };
      })
      .filter(Boolean)
      .slice(0, 250);

    const images = Array.from(document.querySelectorAll("img"))
      .map((img) => {
        const src = img.currentSrc || img.src || img.getAttribute("data-src") || "";
        if (!src) return null;
        return {
          src,
          alt: clean(img.getAttribute("alt") || ""),
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0,
        };
      })
      .filter(Boolean)
      .slice(0, 100);

    const schemas = [];
    Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    ).forEach((s) => {
      try {
        const parsed = JSON.parse(s.textContent || "");
        const items = Array.isArray(parsed)
          ? parsed
          : parsed["@graph"] && Array.isArray(parsed["@graph"])
            ? parsed["@graph"]
            : [parsed];
        items.forEach((item) => {
          if (item && typeof item === "object") {
            const t = Array.isArray(item["@type"])
              ? item["@type"].join(", ")
              : item["@type"] || "SchemaObject";
            schemas.push({ type: String(t), raw: item });
          }
        });
      } catch {}
    });

    const og = {
      title:
        clean(
          document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
        ) || title,
      description:
        clean(
          document
            .querySelector('meta[property="og:description"]')
            ?.getAttribute("content"),
        ) || metaDesc,
      image:
        document.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
        "",
      type:
        document.querySelector('meta[property="og:type"]')?.getAttribute("content") ||
        "website",
    };

    const twitter = {
      card:
        document.querySelector('meta[name="twitter:card"]')?.getAttribute("content") ||
        "summary_large_image",
      title:
        clean(
          document.querySelector('meta[name="twitter:title"]')?.getAttribute("content"),
        ) || og.title,
      description:
        clean(
          document
            .querySelector('meta[name="twitter:description"]')
            ?.getAttribute("content"),
        ) || og.description,
      image:
        document.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ||
        og.image,
    };

    const hreflangs = Array.from(
      document.querySelectorAll('link[rel="alternate"][hreflang]'),
    ).map((l) => ({
      lang: l.getAttribute("hreflang") || "",
      href: l.getAttribute("href") || "",
    }));

    const hasAuthorSignal =
      !!document.querySelector('[rel="author"], .author, [itemprop="author"], meta[name="author"]') ||
      schemas.some((s) => JSON.stringify(s.raw).includes('"author"'));

    const hasAboutContactLinks = links.some((l) =>
      /\/(about|contact|privacy|terms|editorial)/i.test(l.href),
    );

    const quantitativeMatches = (
      bodyText.match(/\b\d+(?:\.\d+)?%|\$\d[\d,.]*|\b\d{2,5}\s+(?:sites|pages|users|days|ms|seconds|queries|links)\b/gi) || []
    ).slice(0, 15);

    const firstHandMatches = (
      bodyText.match(/\b(we tested|in our test|our benchmark|we measured|in our audit|case study|step-by-step|our dataset)\b/gi) || []
    ).slice(0, 10);

    return {
      url,
      domain,
      title,
      description: metaDesc,
      canonicalRendered,
      canonicalRaw: canonicalRendered,
      robotsMeta,
      googlebotMeta,
      publishedDate,
      modifiedDate,
      wordCount,
      headings,
      paragraphs,
      links,
      images,
      schemas,
      og,
      twitter,
      hreflangs,
      hasAuthorSignal,
      hasAboutContactLinks,
      quantitativeMatches,
      firstHandMatches,
    };
  }

  function computeScores(data) {
    // 1. E-E-A-T Score (0-100)
    let eeat = 32;
    if (data.hasAuthorSignal) eeat += 18;
    if (data.publishedDate || data.modifiedDate) eeat += 14;
    if (data.hasAboutContactLinks) eeat += 12;
    if (data.schemas.length > 0) eeat += 12;
    if (data.links.some((l) => l.isExternal && l.rel === "dofollow")) eeat += 12;
    eeat = Math.min(98, eeat);

    // 2. Information Gain Score (0-100)
    let infoGain = 28;
    infoGain += Math.min(28, (data.quantitativeMatches?.length || 0) * 7);
    infoGain += Math.min(24, (data.firstHandMatches?.length || 0) * 10);
    infoGain += Math.min(20, Math.floor((data.headings?.length || 0) * 2.5));
    infoGain = Math.min(97, infoGain);

    // 3. Guest Post / Link Placement Quality Score (0-100)
    let vetting = 50;
    const isIndexable = !/noindex/i.test(data.robotsMeta);
    if (isIndexable) vetting += 20;
    else vetting -= 35;
    if (data.wordCount >= 800) vetting += 15;
    if (data.hasAuthorSignal) vetting += 10;
    const dofollowCount = data.links.filter((l) => l.rel === "dofollow").length;
    if (dofollowCount > 0) vetting += 5;
    vetting = Math.max(10, Math.min(99, vetting));

    return { eeat, infoGain, vetting };
  }

  function setGauge(ringId, valId, labelId, score) {
    const ring = document.getElementById(ringId);
    const val = document.getElementById(valId);
    const lbl = document.getElementById(labelId);
    if (!ring || !val || !lbl) return;

    const circumference = 207;
    const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
    ring.style.strokeDashoffset = String(offset);
    const color =
      score >= 74 ? "#10b981" : score >= 48 ? "#f59e0b" : "#f43f5e";
    ring.style.stroke = color;
    val.textContent = `${score}`;
    lbl.textContent =
      score >= 74
        ? "Strong Signal (74+)"
        : score >= 48
          ? "Moderate (Add Proof)"
          : "Needs Improvement";
  }

  function showToast(msg) {
    const toast = document.getElementById("status-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2800);
  }

  function buildTocHtml(headings) {
    const h2h3 = headings.filter((h) => h.level === 2 || h.level === 3);
    if (!h2h3.length) return "<!-- No H2/H3 headings found on this page -->";
    const items = h2h3
      .map(
        (h) =>
          `    <li${h.level === 3 ? ' style="margin-left:16px"' : ""}><a href="#${h.id}">${h.text}</a></li>`,
      )
      .join("\n");
    return `<nav aria-label="Table of Contents" class="seo-toc">\n  <h2>Table of Contents</h2>\n  <ol>\n${items}\n  </ol>\n</nav>`;
  }

  function generateSocialPost(data, platform, angleIdx) {
    const title = data.title || "Practical Guide";
    const url = data.url || "https://doitwithai.tools";
    const h2s = data.headings
      .filter((h) => h.level === 2)
      .map((h) => h.text)
      .slice(0, 4);
    const bullets =
      h2s.length > 0
        ? h2s.map((h) => `✅ ${h}`).join("\n")
        : data.paragraphs
            .slice(0, 3)
            .map((p) => `• ${p.slice(0, 90)}...`)
            .join("\n");

    const leadP =
      data.paragraphs[0] ||
      data.description ||
      "Here is a structured breakdown you can apply immediately.";

    if (platform === "X" || platform === "Threads") {
      if (angleIdx === 0) {
        return `Most teams overcomplicate "${title}".\n\nHere is the streamlined checklist that actually moves the needle:\n\n${bullets}\n\nFull breakdown 👇\n🌐 ${url}`;
      }
      if (angleIdx === 1) {
        return `Unpopular opinion on ${title}:\n\n${leadP.slice(0, 180)}\n\nStop guessing and audit these signals first:\n${bullets}\n\n🌐 ${url}`;
      }
      return `3-Step Playbook from "${title}":\n\n${bullets}\n\nBookmark this for your next content sprint.\n🌐 ${url}`;
    }

    if (angleIdx === 0) {
      return `📌 ${title}\n\n${leadP}\n\nKey sections covered in this guide:\n${bullets}\n\nWhich of these steps is your biggest bottleneck right now?\n\n🌐 Read the full guide: ${url}\n\n#SEO #ContentStrategy #DigitalMarketing #AIWorkflows`;
    }
    if (angleIdx === 1) {
      return `💡 Why most "${title}" advice falls short (and what to do instead):\n\n${leadP}\n\nInstead of repeating generic checklists, focus on these high-impact areas:\n${bullets}\n\n🌐 Full breakdown & tools: ${url}\n\n#SEOTools #ContentMarketing #OrganicGrowth`;
    }
    return `🚀 Step-by-Step Implementation Playbook: ${title}\n\nSave this checklist for your next audit:\n\n${bullets}\n\n${data.paragraphs[1] || ""}\n\n🌐 Explore the complete guide: ${url}\n\n#MarketingStrategy #OnPageSEO #GrowthMarketing`;
  }

  function renderAll(data) {
    currentPageData = data;
    const scores = computeScores(data);

    // Top URL pill
    document.getElementById("active-url-display").textContent = data.url;

    // Sidebar badges
    const missingAltCount = data.images.filter((i) => !i.alt).length;
    const h1Count = data.headings.filter((h) => h.level === 1).length;
    const contentBadge = document.getElementById("badge-content");
    contentBadge.textContent = String(data.headings.length);
    if (h1Count !== 1) contentBadge.classList.add("badge-warn");

    const idxBadge = document.getElementById("badge-indexability");
    const isNoindex = /noindex/i.test(data.robotsMeta);
    idxBadge.textContent = isNoindex ? "NOINDEX" : "INDEX";
    if (isNoindex) idxBadge.classList.add("badge-warn");

    document.getElementById("badge-schema").textContent = String(data.schemas.length);
    document.getElementById("badge-links").textContent = String(data.links.length);

    const imgBadge = document.getElementById("badge-images");
    imgBadge.textContent = String(data.images.length);
    if (missingAltCount > 0) imgBadge.classList.add("badge-warn");

    // TAB 1: Overview & Gauges
    setGauge("ring-eeat", "val-eeat", "label-eeat", scores.eeat);
    setGauge("ring-infogain", "val-infogain", "label-infogain", scores.infoGain);

    const tLen = data.title.length;
    document.getElementById("ov-title").textContent = data.title || "Missing <title>";
    const tBadge = document.getElementById("title-char-badge");
    tBadge.textContent = `${tLen} chars`;
    tBadge.className = `status-pill ${tLen >= 30 && tLen <= 62 ? "" : "warn"}`;
    document.getElementById("bar-title").style.width = `${Math.min(100, Math.round((tLen / 60) * 100))}%`;

    const dLen = data.description.length;
    document.getElementById("ov-desc").textContent =
      data.description || "Missing meta description";
    const dBadge = document.getElementById("desc-char-badge");
    dBadge.textContent = `${dLen} chars`;
    dBadge.className = `status-pill ${dLen >= 110 && dLen <= 165 ? "" : "warn"}`;
    document.getElementById("bar-desc").style.width = `${Math.min(100, Math.round((dLen / 160) * 100))}%`;

    const canEl = document.getElementById("ov-canonical");
    canEl.textContent = data.canonicalRendered || "Missing canonical tag";
    canEl.href = data.canonicalRendered || data.url;
    const canBadge = document.getElementById("canonical-badge");
    const isSelfCanonical =
      data.canonicalRendered &&
      data.canonicalRendered.replace(/\/$/, "") === data.url.split("?")[0].replace(/\/$/, "");
    canBadge.textContent = !data.canonicalRendered
      ? "Missing"
      : isSelfCanonical
        ? "Self-Canonical"
        : "Points Elsewhere";
    canBadge.className = `status-pill ${isSelfCanonical ? "" : "warn"}`;

    document.getElementById("ov-robots").textContent = data.robotsMeta;
    const rBadge = document.getElementById("robots-badge");
    rBadge.textContent = isNoindex ? "Noindex" : "Indexable";
    rBadge.className = `status-pill ${isNoindex ? "bad" : ""}`;

    // KPI strip
    document.getElementById("kpi-words").textContent = data.wordCount.toLocaleString();
    document.getElementById("kpi-h1").textContent = String(h1Count);
    document.getElementById("kpi-h2").textContent = String(
      data.headings.filter((h) => h.level === 2).length,
    );
    document.getElementById("kpi-h3").textContent = String(
      data.headings.filter((h) => h.level === 3).length,
    );
    document.getElementById("kpi-h4").textContent = String(
      data.headings.filter((h) => h.level >= 4).length,
    );
    document.getElementById("kpi-links").textContent = String(data.links.length);
    document.getElementById("kpi-images").textContent = String(data.images.length);

    // TAB 2: Content & Headings
    document.getElementById("cnt-published").textContent =
      data.publishedDate || "Not specified";
    document.getElementById("cnt-modified").textContent =
      data.modifiedDate || "Not specified";
    document.getElementById("cnt-words").textContent =
      `${data.wordCount.toLocaleString()} words (~${Math.max(1, Math.ceil(data.wordCount / 220))} min read)`;
    const snippetReadyCount = data.paragraphs.filter((p) => {
      const wc = p.split(/\s+/).length;
      return wc >= 40 && wc <= 60;
    }).length;
    document.getElementById("cnt-snippets").textContent =
      `${snippetReadyCount} optimal (40–60w)`;
    document.getElementById("heading-total-count").textContent = String(
      data.headings.length,
    );

    const treeEl = document.getElementById("headings-tree-list");
    treeEl.innerHTML = "";
    if (!data.headings.length) {
      treeEl.innerHTML = `<p class="text-muted">No H1–H6 headings found on this page.</p>`;
    } else {
      data.headings.forEach((h) => {
        const row = document.createElement("div");
        row.className = "heading-node";
        row.style.paddingLeft = `${Math.max(0, h.level - 1) * 14 + 6}px`;
        row.innerHTML = `<span class="h-tag">H${h.level}</span><span>${h.text}</span>`;
        treeEl.appendChild(row);
      });
    }

    // TAB 3: Indexability
    document.getElementById("idx-can-rendered").textContent =
      data.canonicalRendered || "Missing";
    document.getElementById("idx-can-raw").textContent =
      data.canonicalRaw || data.canonicalRendered || "Missing";
    document.getElementById("idx-can-status").textContent =
      data.canonicalRendered === data.canonicalRaw
        ? "✓ Rendered DOM matches Raw HTML"
        : "⚠ Modified by client-side JavaScript";
    document.getElementById("idx-meta-robots").textContent = data.robotsMeta;
    document.getElementById("idx-googlebot").textContent = data.googlebotMeta;

    let origin = "https://doitwithai.tools";
    try {
      origin = new URL(data.url).origin;
    } catch {}
    const robUrl = `${origin}/robots.txt`;
    const siteUrl = `${origin}/sitemap.xml`;
    const llmsUrl = `${origin}/llms.txt`;
    const robEl = document.getElementById("idx-robots-url");
    robEl.textContent = robUrl;
    robEl.href = robUrl;
    const smEl = document.getElementById("idx-sitemap-url");
    smEl.textContent = siteUrl;
    smEl.href = siteUrl;
    const llmsEl = document.getElementById("idx-llms-url");
    llmsEl.textContent = llmsUrl;
    llmsEl.href = llmsUrl;

    const hreflangBox = document.getElementById("idx-hreflang-list");
    if (!data.hreflangs || !data.hreflangs.length) {
      hreflangBox.innerHTML = `<span class="text-muted">No hreflang annotations detected on this page.</span>`;
    } else {
      hreflangBox.innerHTML = data.hreflangs
        .map((h) => `<div><strong>${h.lang}:</strong> ${h.href}</div>`)
        .join("");
    }

    // TAB 4: Schema
    const schemaBox = document.getElementById("schema-cards-container");
    schemaBox.innerHTML = "";
    if (!data.schemas.length) {
      schemaBox.innerHTML = `<div class="info-card"><p class="text-muted">No JSON-LD structured data detected. Click "Open Schema Validator" above to generate Article or FAQPage schema.</p></div>`;
    } else {
      data.schemas.forEach((sc, idx) => {
        const details = document.createElement("details");
        details.className = "schema-card";
        if (idx === 0) details.open = true;
        details.innerHTML = `<summary><span>${sc.type}</span><span>▾</span></summary><pre>${JSON.stringify(
          sc.raw,
          null,
          2,
        )}</pre>`;
        schemaBox.appendChild(details);
      });
    }

    // TAB 5: Links & Vetting
    document.getElementById("lnk-vetting-score").textContent = `${scores.vetting} / 100`;
    document.getElementById("lnk-dofollow-count").textContent = String(
      data.links.filter((l) => l.rel === "dofollow").length,
    );
    document.getElementById("lnk-nofollow-count").textContent = String(
      data.links.filter((l) => l.rel !== "dofollow").length,
    );
    document.getElementById("lnk-generic-count").textContent = String(
      data.links.filter((l) => l.anchorType === "Generic").length,
    );
    renderLinksList();

    // TAB 6: Images
    renderImagesList();

    // TAB 7: Convert Page
    document.getElementById("conv-article-title").textContent =
      data.title || "Current Article";
    renderStudioLinks(data.url);

    // TAB 8: Social Previews & 15 Posts
    document.getElementById("og-domain").textContent = data.domain;
    document.getElementById("og-title").textContent = data.og.title || data.title;
    document.getElementById("og-desc").textContent =
      data.og.description || data.description;
    const ogImg = document.getElementById("og-img-preview");
    const ogFallback = document.getElementById("og-img-fallback");
    if (data.og.image) {
      ogImg.src = data.og.image;
      ogImg.classList.remove("hidden");
      ogFallback.classList.add("hidden");
    } else {
      ogImg.classList.add("hidden");
      ogFallback.classList.remove("hidden");
    }

    document.getElementById("tw-card-type").textContent =
      `${data.twitter.card} · ${data.domain}`;
    document.getElementById("tw-title").textContent =
      data.twitter.title || data.title;
    document.getElementById("tw-desc").textContent =
      data.twitter.description || data.description;
    const twImg = document.getElementById("tw-img-preview");
    const twFallback = document.getElementById("tw-img-fallback");
    if (data.twitter.image) {
      twImg.src = data.twitter.image;
      twImg.classList.remove("hidden");
      twFallback.classList.add("hidden");
    } else {
      twImg.classList.add("hidden");
      twFallback.classList.remove("hidden");
    }

    updateSocialPostTextarea();
  }

  function renderLinksList() {
    if (!currentPageData) return;
    const q = (
      document.getElementById("link-search-input")?.value || ""
    ).toLowerCase();
    const list = currentPageData.links.filter((l) => {
      if (activeLinkFilter === "dofollow" && l.rel !== "dofollow") return false;
      if (activeLinkFilter === "nofollow" && l.rel === "dofollow") return false;
      if (activeLinkFilter === "external" && !l.isExternal) return false;
      if (activeLinkFilter === "internal" && l.isExternal) return false;
      if (
        q &&
        !l.anchor.toLowerCase().includes(q) &&
        !l.href.toLowerCase().includes(q)
      )
        return false;
      return true;
    });

    const box = document.getElementById("links-table-container");
    box.innerHTML = "";
    if (!list.length) {
      box.innerHTML = `<p class="text-muted">No links match the selected filter.</p>`;
      return;
    }
    list.slice(0, 120).forEach((l) => {
      const row = document.createElement("div");
      row.className = "item-row";
      const badgeClass = l.rel === "dofollow" ? "" : "warn";
      row.innerHTML = `
        <div style="min-width:0;flex:1">
          <div style="font-weight:700;word-break:break-word">${l.anchor}</div>
          <a href="${l.href}" target="_blank" rel="noopener noreferrer" class="mono-link">${l.href}</a>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <span class="status-pill">${l.anchorType}</span>
          <span class="status-pill ${badgeClass}">${l.rel.toUpperCase()}</span>
        </div>
      `;
      box.appendChild(row);
    });
  }

  function renderImagesList() {
    if (!currentPageData) return;
    const list = currentPageData.images.filter((img) => {
      if (activeImgFilter === "missing") return !img.alt;
      if (activeImgFilter === "valid") return !!img.alt;
      return true;
    });

    const box = document.getElementById("images-list-container");
    box.innerHTML = "";
    if (!list.length) {
      box.innerHTML = `<p class="text-muted">No images match the selected filter.</p>`;
      return;
    }
    list.forEach((img) => {
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML = `
        <img src="${img.src}" alt="" class="media-thumb" />
        <div style="min-width:0;flex:1">
          <div style="font-weight:700">${
            img.alt
              ? img.alt
              : '<span style="color:#fb7185">⚠ Missing Alt Text</span>'
          }</div>
          <a href="${img.src}" target="_blank" rel="noopener noreferrer" class="mono-link">${img.src}</a>
          <div class="text-muted">${img.width} × ${img.height}px</div>
        </div>
      `;
      box.appendChild(row);
    });
  }

  function renderStudioLinks(pageUrl) {
    const enc = encodeURIComponent(pageUrl || "");
    const studios = [
      ["CAR", "LinkedIn Carousel Studio", "blog-to-linkedin-carousel"],
      ["VID", "Blog to Video Script", "blog-to-video-script"],
      ["SOC", "15 Social Posts Studio", "blog-to-social-posts"],
      ["NWS", "Email Newsletter Studio", "blog-to-newsletter"],
      ["MP3", "Neural MP3 Audio Studio", "article-to-mp3"],
      ["POD", "Podcast Script Studio", "article-to-podcast-script"],
      ["GAP", "Semantic Entity Gap", "semantic-entity-gap-analyzer"],
      ["GAIN", "Information Gain Scorer", "information-gain-auditor"],
    ];
    const container = document.getElementById("conversion-studio-links");
    container.innerHTML = studios
      .map(
        ([icon, name, slug]) => `
        <a href="https://doitwithai.tools/tools/${slug}?url=${enc}" target="_blank" rel="noopener noreferrer" class="action-tile">
          <span class="tile-icon">${icon}</span>
          <div>
            <strong>${name} ↗</strong>
            <span>Open with this URL pre-Targeted</span>
          </div>
        </a>
      `,
      )
      .join("");
  }

  function updateSocialPostTextarea() {
    if (!currentPageData) return;
    const text = generateSocialPost(
      currentPageData,
      activeSocialPlatform,
      activeSocialAngle,
    );
    const area = document.getElementById("social-post-output");
    area.value = text;
    document.getElementById("social-char-counter").textContent =
      `${text.length} characters · ${activeSocialPlatform}`;
  }

  function buildArticleMarkdown(data) {
    const lines = [
      "---",
      `title: "${(data.title || "").replace(/"/g, '\\"')}"`,
      `source: "${data.url}"`,
      `date: "${data.publishedDate || new Date().toISOString().slice(0, 10)}"`,
      "---",
      "",
      `# ${data.title}`,
      "",
    ];
    if (data.description) {
      lines.push(`> ${data.description}`, "");
    }
    data.headings.forEach((h, idx) => {
      if (h.level > 1) {
        lines.push(`${"#".repeat(h.level)} ${h.text}`, "");
      }
      if (data.paragraphs[idx]) {
        lines.push(data.paragraphs[idx], "");
      }
    });
    data.paragraphs.slice(data.headings.length).forEach((p) => {
      lines.push(p, "");
    });
    return lines.join("\n");
  }

  function triggerDownload(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function scanActiveTab() {
    if (
      typeof chrome === "undefined" ||
      !chrome.tabs ||
      !chrome.scripting
    ) {
      renderAll(DEMO_PAGE_DATA);
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!tab || !tab.id || !tab.url || !/^https?:/i.test(tab.url)) {
        renderAll(DEMO_PAGE_DATA);
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: extractPageDomSnapshot,
        },
        (results) => {
          if (
            chrome.runtime.lastError ||
            !results ||
            !results[0] ||
            !results[0].result
          ) {
            renderAll(DEMO_PAGE_DATA);
            return;
          }
          const snap = results[0].result;
          renderAll(snap);
        },
      );
    });
  }

  function togglePageOverlay(mode, enabled) {
    if (typeof chrome === "undefined" || !chrome.tabs || !chrome.scripting) {
      showToast("Live page overlay is active when running on a webpage tab.");
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!tab || !tab.id || !/^https?:/i.test(tab.url || "")) return;
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [mode, enabled],
        func: (overlayMode, isOn) => {
          const styleId = `diwat-overlay-${overlayMode}`;
          const existing = document.getElementById(styleId);
          if (existing) existing.remove();
          if (!isOn) return;
          const style = document.createElement("style");
          style.id = styleId;
          if (overlayMode === "links") {
            style.textContent = `
              a[rel*="nofollow"] { outline: 2px dashed #f59e0b !important; background: rgba(245,158,11,0.12) !important; }
              a[href]:not([rel*="nofollow"]) { outline: 2px solid #10b981 !important; }
            `;
          } else if (overlayMode === "headings") {
            style.textContent = `
              h1, h2, h3, h4, h5, h6 { position: relative !important; outline: 1px dashed #5271ff !important; }
              h1::before { content: "H1"; background:#5271ff; color:#fff; font-size:10px; font-weight:800; padding:2px 5px; margin-right:6px; border-radius:4px; }
              h2::before { content: "H2"; background:#0ea5e9; color:#fff; font-size:10px; font-weight:800; padding:2px 5px; margin-right:6px; border-radius:4px; }
              h3::before { content: "H3"; background:#10b981; color:#fff; font-size:10px; font-weight:800; padding:2px 5px; margin-right:6px; border-radius:4px; }
            `;
          }
          document.head.appendChild(style);
        },
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (window.location.search.includes("mode=sidepanel")) {
      document.documentElement.setAttribute("data-view", "sidepanel");
    }
    // Sidebar tab navigation
    document.querySelectorAll("#main-nav .nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("#main-nav .nav-item")
          .forEach((b) => b.classList.remove("active"));
        document
          .querySelectorAll(".tab-pane")
          .forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const tabId = btn.getAttribute("data-tab");
        document.getElementById(`tab-${tabId}`)?.classList.add("active");
      });
    });

    // Theme toggle
    document.getElementById("btn-theme-toggle")?.addEventListener("click", () => {
      const html = document.documentElement;
      const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
    });

    // SidePanel dock
    document.getElementById("btn-sidepanel")?.addEventListener("click", () => {
      if (typeof chrome !== "undefined" && chrome.windows && chrome.runtime) {
        chrome.windows.getCurrent((win) => {
          chrome.runtime.sendMessage(
            { type: "OPEN_SIDE_PANEL", windowId: win.id },
            () => window.close(),
          );
        });
      } else {
        showToast("Side Panel docking is ready inside Google Chrome.");
      }
    });

    // Rescan & Export Report
    document.getElementById("btn-rescan")?.addEventListener("click", () => {
      scanActiveTab();
      showToast("Rescanned active tab DOM.");
    });

    document.getElementById("btn-export-report")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const md = buildArticleMarkdown(currentPageData);
      triggerDownload(md, "seo-content-audit-report.md", "text/markdown;charset=utf-8");
      showToast("Downloaded full Markdown audit report.");
    });

    // Copy Headings & Build TOC
    document.getElementById("btn-copy-headings")?.addEventListener("click", async () => {
      if (!currentPageData) return;
      const text = currentPageData.headings
        .map((h) => `${"  ".repeat(Math.max(0, h.level - 1))}H${h.level}: ${h.text}`)
        .join("\n");
      await navigator.clipboard.writeText(text);
      showToast("Copied hierarchical H1–H6 outline to clipboard.");
    });

    document.getElementById("btn-build-toc")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const box = document.getElementById("toc-generator-box");
      const out = document.getElementById("toc-html-output");
      out.textContent = buildTocHtml(currentPageData.headings);
      box.classList.toggle("hidden");
    });

    document.getElementById("btn-copy-toc-html")?.addEventListener("click", async () => {
      const code = document.getElementById("toc-html-output")?.textContent || "";
      await navigator.clipboard.writeText(code);
      showToast("Copied crawlable <nav> TOC HTML to clipboard.");
    });

    // Link filters & CSV export
    document.querySelectorAll("#link-filter-pills .filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("#link-filter-pills .filter-pill")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeLinkFilter = btn.getAttribute("data-filter") || "all";
        renderLinksList();
      });
    });

    document
      .getElementById("link-search-input")
      ?.addEventListener("input", renderLinksList);

    document.getElementById("btn-export-links")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const rows = [
        '"Anchor Text","Target URL","Rel","Scope","Anchor Type"',
        ...currentPageData.links.map(
          (l) =>
            `"${l.anchor.replace(/"/g, '""')}","${l.href}","${l.rel}","${
              l.isExternal ? "External" : "Internal"
            }","${l.anchorType}"`,
        ),
      ].join("\r\n");
      triggerDownload(rows, "page-links-audit.csv", "text/csv;charset=utf-8");
      showToast("Exported links audit CSV.");
    });

    // Image filters & CSV export
    document.querySelectorAll("#img-filter-pills .filter-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("#img-filter-pills .filter-pill")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeImgFilter = btn.getAttribute("data-filter") || "all";
        renderImagesList();
      });
    });

    document.getElementById("btn-export-images")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const rows = [
        '"Image URL","Alt Text","Width","Height","Status"',
        ...currentPageData.images.map(
          (i) =>
            `"${i.src}","${(i.alt || "").replace(/"/g, '""')}","${i.width}","${
              i.height
            }","${i.alt ? "OK" : "MISSING_ALT"}"`,
        ),
      ].join("\r\n");
      triggerDownload(rows, "page-images-alt-audit.csv", "text/csv;charset=utf-8");
      showToast("Exported images & alt text CSV.");
    });

    // Convert Page actions (Markdown, Word, TXT, PDF, TTS Audio)
    document.getElementById("btn-dl-markdown")?.addEventListener("click", () => {
      if (!currentPageData) return;
      triggerDownload(
        buildArticleMarkdown(currentPageData),
        "article-export.md",
        "text/markdown;charset=utf-8",
      );
      showToast("Downloaded clean Markdown (.md) file.");
    });

    document.getElementById("btn-dl-doc")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const htmlDoc = `<!doctype html><html><head><meta charset="utf-8"><title>${currentPageData.title}</title></head><body style="font-family:Calibri,Arial,sans-serif;line-height:1.6"><h1>${currentPageData.title}</h1><p><strong>Source:</strong> <a href="${currentPageData.url}">${currentPageData.url}</a></p>${currentPageData.paragraphs.map((p) => `<p>${p}</p>`).join("")}</body></html>`;
      triggerDownload(
        htmlDoc,
        "article-reading-copy.doc",
        "application/msword;charset=utf-8",
      );
      showToast("Downloaded editable Word (.doc) document.");
    });

    document.getElementById("btn-dl-txt")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const txt = `${currentPageData.title}\nSource: ${currentPageData.url}\n\n${currentPageData.paragraphs.join("\n\n")}`;
      triggerDownload(txt, "article-transcript.txt", "text/plain;charset=utf-8");
      showToast("Downloaded clean text (.txt) file.");
    });

    document.getElementById("btn-print-pdf")?.addEventListener("click", () => {
      if (!currentPageData) return;
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(
          `<!doctype html><html><head><title>${currentPageData.title}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;line-height:1.7;color:#111}h1{font-family:sans-serif}p{margin:14px 0}</style></head><body><h1>${currentPageData.title}</h1><p><small>Source: ${currentPageData.url}</small></p>${currentPageData.paragraphs.map((p) => `<p>${p}</p>`).join("")}<script>window.onload=()=>{window.print();}</script></body></html>`,
        );
        w.document.close();
      }
    });

    // Built-in TTS Read Aloud
    document.getElementById("btn-tts-play")?.addEventListener("click", () => {
      if (!currentPageData || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const text = `${currentPageData.title}. ${currentPageData.paragraphs.slice(0, 12).join(" ")}`;
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = Number(document.getElementById("tts-rate")?.value || 1);
      window.speechSynthesis.speak(utter);
      showToast("Playing article audio narration…");
    });

    document.getElementById("btn-tts-stop")?.addEventListener("click", () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        showToast("Stopped audio playback.");
      }
    });

    // Social platform & angle selectors
    document
      .querySelectorAll("#social-platform-pills .filter-pill")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          document
            .querySelectorAll("#social-platform-pills .filter-pill")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          activeSocialPlatform = btn.getAttribute("data-platform") || "LinkedIn";
          updateSocialPostTextarea();
        });
      });

    document
      .querySelectorAll("#social-angle-pills .filter-pill")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          document
            .querySelectorAll("#social-angle-pills .filter-pill")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          activeSocialAngle = Number(btn.getAttribute("data-angle") || 0);
          updateSocialPostTextarea();
        });
      });

    document
      .getElementById("btn-copy-social-post")
      ?.addEventListener("click", async () => {
        const val = document.getElementById("social-post-output")?.value || "";
        await navigator.clipboard.writeText(val);
        showToast(`Copied ${activeSocialPlatform} post to clipboard!`);
      });

    // Live page overlays
    document
      .getElementById("toggle-highlight-links")
      ?.addEventListener("change", (e) => {
        togglePageOverlay("links", e.target.checked);
      });

    document
      .getElementById("toggle-highlight-headings")
      ?.addEventListener("change", (e) => {
        togglePageOverlay("headings", e.target.checked);
      });

    // Initial scan
    scanActiveTab();
  });
})();

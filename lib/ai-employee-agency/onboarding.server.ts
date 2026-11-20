import { projectsForPresentation } from '@/features/website-builder/domain/opportunity';
import { load } from 'cheerio';
import { fetchPublic, publicUrl } from '@/features/backlink-verifier/fetch.server';
import { robotsAllows } from '@/features/internal-linking/server';
import { meteredAgencyCall } from '@/lib/ai-agency/billing.server';
import {
  classifySiteMaturity,
  topicDecision,
  type SiteKnowledge,
  type SitePage,
  type SuggestedKeywordCard,
} from './site-knowledge';
import type { SupabaseClient } from '@supabase/supabase-js';

function scoped(raw: string, base: URL) {
  try {
    const url = publicUrl(new URL(raw, base).href);
    if (url.origin === base.origin) return url.href;
  } catch {
    /* Ignore malformed links in customer documents. */
  }
  return '';
}

function titleCaseDomain(hostname: string): string {
  const core = hostname
    .replace(/^www\./i, '')
    .split('.')[0]
    ?.replace(/[-_]+/g, ' ')
    .trim();
  if (!core) return 'Website';
  return core.replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferCurrencyFromText(text: string): string {
  if (/\bEUR\b|€/.test(text)) return 'EUR';
  if (/\bGBP\b|£/.test(text)) return 'GBP';
  if (/\bPKR\b|Rs\.?/i.test(text)) return 'PKR';
  if (/\bINR\b|₹/.test(text)) return 'INR';
  if (/\bCAD\b|C\$/i.test(text)) return 'CAD';
  if (/\bAUD\b|A\$/i.test(text)) return 'AUD';
  return 'USD';
}

function inferBusinessModel(text: string, pages: SitePage[]): string {
  const sample = `${text} ${pages.map((p) => p.url).join(' ')}`.toLowerCase();
  if (/\b(shop|cart|checkout|add to cart|store|sku|product)\b|\/products?\//.test(sample)) {
    return 'ecommerce';
  }
  if (/\b(agency|consulting|retainer|client work|case studies)\b/.test(sample)) {
    return 'agency';
  }
  if (/\b(clinic|plumber|dentist|law firm|near me|book an appointment|local)\b/.test(sample)) {
    return 'local_service';
  }
  if (/\b(saas|software|platform|api|dashboard|tools?|generator|calculator|ai)\b/.test(sample)) {
    return 'b2b_saas';
  }
  return 'publisher';
}

function parseJsonLdSignals($: ReturnType<typeof load>): {
  types: string[];
  names: string[];
  descriptions: string[];
} {
  const types: string[] = [];
  const names: string[] = [];
  const descriptions: string[] = [];
  $('script[type="application/ld+json"]')
    .slice(0, 6)
    .each((_, el) => {
      const raw = $(el).text().trim();
      if (!raw || raw.length > 60_000) return;
      try {
        const parsed = JSON.parse(raw) as unknown;
        const nodes = Array.isArray(parsed)
          ? parsed
          : parsed && typeof parsed === 'object' && '@graph' in parsed && Array.isArray((parsed as { '@graph': unknown[] })['@graph'])
            ? (parsed as { '@graph': unknown[] })['@graph']
            : [parsed];
        for (const node of nodes.slice(0, 12)) {
          if (!node || typeof node !== 'object') continue;
          const rec = node as Record<string, unknown>;
          if (typeof rec['@type'] === 'string') types.push(rec['@type']);
          if (typeof rec.name === 'string') names.push(rec.name.trim().slice(0, 120));
          if (typeof rec.description === 'string') descriptions.push(rec.description.trim().slice(0, 240));
          if (typeof rec.serviceType === 'string') names.push(rec.serviceType.trim().slice(0, 120));
        }
      } catch {
        /* Ignore malformed JSON-LD blocks on external sites. */
      }
    });
  return {
    types: Array.from(new Set(types)).slice(0, 8),
    names: Array.from(new Set(names)).slice(0, 8),
    descriptions: Array.from(new Set(descriptions)).slice(0, 4),
  };
}

async function fetchGoogleAutocompleteSeeds(seed: string): Promise<string[]> {
  const clean = seed.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  try {
    const endpoint = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(clean)}`;
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(3500),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return data[1]
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 3)
        .slice(0, 8);
    }
  } catch {
    /* Non-fatal if autocomplete is unreachable. */
  }
  return [];
}

function estimateDeterministicKd(keyword: string, index: number): number {
  const wordCount = keyword.trim().split(/\s+/).length;
  const longTailDiscount = wordCount >= 5 ? -10 : wordCount === 4 ? -5 : 4;
  return Math.max(12, Math.min(44, 26 + longTailDiscount + ((index * 5) % 13)));
}

function toKeywordCard(
  raw: {
    keyword: string;
    recommendedTitle?: string;
    intent?: string;
    estimatedKd?: number;
    rationale?: string;
  },
  profile: SiteKnowledge,
  index: number,
): SuggestedKeywordCard {
  const keyword = raw.keyword.trim().slice(0, 140);
  const decision = topicDecision(keyword, profile);
  const validIntent =
    raw.intent === 'commercial' ||
    raw.intent === 'transactional' ||
    raw.intent === 'comparison' ||
    raw.intent === 'informational'
      ? raw.intent
      : /\b(vs|versus|compare|alternative)\b/i.test(keyword)
        ? 'comparison'
        : /\b(best|top|tool|software|service|agency|pricing)\b/i.test(keyword)
          ? 'commercial'
          : 'informational';

  const cleanTitle =
    raw.recommendedTitle?.trim().slice(0, 140) ||
    `${keyword.replace(/\b\w/g, (c) => c.toUpperCase())}: Complete Practical Guide`;

  const kd =
    typeof raw.estimatedKd === 'number' && Number.isFinite(raw.estimatedKd)
      ? Math.max(8, Math.min(65, Math.round(raw.estimatedKd)))
      : estimateDeterministicKd(keyword, index);

  return {
    keyword,
    recommendedTitle: cleanTitle,
    intent: validIntent,
    estimatedKd: kd,
    overlapAction: decision.action,
    overlapScore: decision.score,
    matchedUrl: decision.match?.url || null,
    rationale:
      raw.rationale?.trim().slice(0, 180) ||
      (decision.action === 'refresh'
        ? 'High overlap with an existing URL — prioritize updating and expanding that page.'
        : 'Low-difficulty topical gap aligned with your core site offering.'),
  };
}

export function buildDeterministicBrandAndKeywords(params: {
  domain: string;
  knowledge: SiteKnowledge;
  metaDescription?: string;
  navLabels?: string[];
  autocompleteSeeds?: string[];
}): {
  brandPatch: Partial<SiteKnowledge>;
  suggestedKeywords: SuggestedKeywordCard[];
} {
  let hostname = params.domain;
  try {
    hostname = new URL(params.domain).hostname;
  } catch {
    /* Use raw domain fallback */
  }
  const fallbackName = titleCaseDomain(hostname);
  const name = params.knowledge.name.trim() || fallbackName;
  const headingSeed = params.knowledge.headings.find((h) => h.trim().length > 4)?.trim() || '';
  const desc = (params.metaDescription || '').trim();
  const navClean = (params.navLabels || []).filter((n) => n.length > 2 && n.length < 36).slice(0, 6);

  const industry =
    params.knowledge.industry.trim() ||
    (headingSeed ? headingSeed.slice(0, 90) : `${name} Digital Solutions`);
  const offer =
    params.knowledge.offer.trim() ||
    (desc ? desc.slice(0, 180) : navClean.length ? navClean.join(', ') : `${name} core services and resources`);
  const audience =
    params.knowledge.audience.trim() ||
    `Founders, marketers, and buyers searching for ${industry.toLowerCase()}`;
  const goal =
    params.knowledge.goal.trim() ||
    'Grow qualified organic search traffic and conversions with high-intent content';
  const businessModel =
    params.knowledge.business_model ||
    inferBusinessModel(`${name} ${industry} ${desc} ${headingSeed}`, params.knowledge.pages);
  const maturity = classifySiteMaturity(params.knowledge.pages);

  const coreTopic = (
    headingSeed.split(/[:|–—-]/)[0]?.trim() ||
    industry.split(/[:|–—-]/)[0]?.trim() ||
    name
  )
    .replace(/\s+/g, ' ')
    .slice(0, 50);

  const seedCandidates = [
    ...(params.autocompleteSeeds || []),
    `${coreTopic} step by step checklist`,
    `best ${coreTopic} workflow for beginners`,
    `${coreTopic} common mistakes to avoid`,
    `${coreTopic} vs manual process comparison`,
    `how to measure ${coreTopic} roi`,
    `${coreTopic} templates and examples`,
  ];

  const uniqueKeywords: string[] = [];
  for (const candidate of seedCandidates) {
    const normalized = candidate.replace(/\s+/g, ' ').trim();
    if (
      normalized.length >= 6 &&
      !uniqueKeywords.some((k) => k.toLowerCase() === normalized.toLowerCase())
    ) {
      uniqueKeywords.push(normalized);
    }
    if (uniqueKeywords.length >= 6) break;
  }

  const suggestedKeywords = uniqueKeywords.map((kw, idx) =>
    toKeywordCard({ keyword: kw }, params.knowledge, idx),
  );

  return {
    brandPatch: {
      name,
      industry,
      sub_niche: params.knowledge.sub_niche || navClean.slice(0, 2).join(' & ') || industry,
      audience,
      offer,
      goal,
      locale: params.knowledge.locale || 'en-US',
      currency: params.knowledge.currency || inferCurrencyFromText(`${desc} ${headingSeed}`),
      business_model: businessModel,
      reading_grade_target: params.knowledge.reading_grade_target || 'grade_10_12',
      brand_voice:
        params.knowledge.brand_voice && params.knowledge.brand_voice.length > 0
          ? params.knowledge.brand_voice
          : ['clear', 'practical', 'authoritative'],
      domain_maturity: maturity.domain_maturity,
      priority_preset: maturity.priority_preset,
      asset_inventory: maturity.asset_inventory,
      meta_description: desc || params.knowledge.meta_description || '',
    },
    suggestedKeywords,
  };
}

export async function synthesizeInitialBrandAndKeywords(params: {
  workspaceId: string;
  domain: string;
  knowledge: SiteKnowledge;
  metaDescription?: string;
  jsonLdSummary?: string;
  navLabels?: string[];
}): Promise<SiteKnowledge> {
  const seedQuery =
    params.knowledge.headings[0]?.split(/[:|–—-]/)[0]?.trim() ||
    params.knowledge.name ||
    params.domain;
  const autocompleteSeeds = await fetchGoogleAutocompleteSeeds(seedQuery);
  const deterministic = buildDeterministicBrandAndKeywords({
    domain: params.domain,
    knowledge: params.knowledge,
    metaDescription: params.metaDescription,
    navLabels: params.navLabels,
    autocompleteSeeds,
  });

  const baseProfile: SiteKnowledge = {
    ...params.knowledge,
    ...deterministic.brandPatch,
    suggestedKeywords: deterministic.suggestedKeywords,
  };

  try {
    const call = await meteredAgencyCall(params.workspaceId, 'keywords', {
      modelId: 'gemini-2.5-flash',
      temperature: 0.25,
      maxOutputTokens: 1100,
      systemPrompt: [
        'You are the DoItWithAI Onboarding Brand DNA & Keyword Strategist.',
        'Analyze the supplied live website crawl signals and return STRICT JSON only (no markdown fences) with this exact shape:',
        '{"name":"...","industry":"...","sub_niche":"...","audience":"...","offer":"...","goal":"...","business_model":"b2b_saas|ecommerce|local_service|publisher|agency","brand_voice":["..."],"locale":"en-US","currency":"USD","keywords":[{"keyword":"...","recommendedTitle":"...","intent":"informational|commercial|transactional|comparison","estimatedKd":24,"rationale":"..."}]}',
        'Rules: Provide exactly 6 practical, low-competition keyword ideas grounded in the site niche and autocomplete seeds. Never leave name, industry, audience, or offer empty.',
      ].join('\n'),
      userPrompt: JSON.stringify({
        domain: params.domain,
        title: params.knowledge.name,
        metaDescription: params.metaDescription || '',
        headings: params.knowledge.headings.slice(0, 15),
        navLabels: (params.navLabels || []).slice(0, 12),
        jsonLd: params.jsonLdSummary || '',
        existingPagesSample: params.knowledge.pages.slice(0, 25).map((p) => ({
          url: p.url,
          title: p.title,
        })),
        maturity: baseProfile.domain_maturity,
        autocompleteSeeds,
      }),
    });

    if (call.ok && call.outputText) {
      const cleaned = call.outputText
        .trim()
        .replace(/^`{3}(?:json)?\s*/i, '')
        .replace(/\s*`{3}$/i, '')
        .trim();
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      const jsonText =
        firstBrace !== -1 && lastBrace > firstBrace
          ? cleaned.slice(firstBrace, lastBrace + 1)
          : cleaned;
      const parsed = JSON.parse(jsonText) as {
        name?: unknown;
        industry?: unknown;
        sub_niche?: unknown;
        audience?: unknown;
        offer?: unknown;
        goal?: unknown;
        business_model?: unknown;
        brand_voice?: unknown;
        locale?: unknown;
        currency?: unknown;
        keywords?: Array<{
          keyword?: unknown;
          recommendedTitle?: unknown;
          intent?: unknown;
          estimatedKd?: unknown;
          rationale?: unknown;
        }>;
      };

      const str = (v: unknown, fallback: string) =>
        typeof v === 'string' && v.trim().length > 1 ? v.trim().slice(0, 300) : fallback;
      const validModel =
        typeof parsed.business_model === 'string' &&
        ['b2b_saas', 'ecommerce', 'local_service', 'publisher', 'agency'].includes(
          parsed.business_model,
        )
          ? parsed.business_model
          : baseProfile.business_model || 'b2b_saas';
      const voice = Array.isArray(parsed.brand_voice)
        ? parsed.brand_voice
            .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
            .map((v) => v.trim().slice(0, 40))
            .slice(0, 5)
        : baseProfile.brand_voice;

      const aiCards: SuggestedKeywordCard[] = Array.isArray(parsed.keywords)
        ? parsed.keywords
            .filter(
              (k): k is {
                keyword: string;
                recommendedTitle?: string;
                intent?: string;
                estimatedKd?: number;
                rationale?: string;
              } => typeof k?.keyword === 'string' && k.keyword.trim().length > 3,
            )
            .slice(0, 6)
            .map((k, idx) => toKeywordCard(k, baseProfile, idx))
        : [];

      const mergedCards = [...aiCards];
      for (const fallbackCard of deterministic.suggestedKeywords) {
        if (mergedCards.length >= 6) break;
        if (
          !mergedCards.some(
            (c) => c.keyword.toLowerCase() === fallbackCard.keyword.toLowerCase(),
          )
        ) {
          mergedCards.push(fallbackCard);
        }
      }

      return {
        ...baseProfile,
        name: str(parsed.name, baseProfile.name),
        industry: str(parsed.industry, baseProfile.industry),
        sub_niche: str(parsed.sub_niche, baseProfile.sub_niche || baseProfile.industry),
        audience: str(parsed.audience, baseProfile.audience),
        offer: str(parsed.offer, baseProfile.offer),
        goal: str(parsed.goal, baseProfile.goal),
        business_model: validModel,
        brand_voice: voice && voice.length > 0 ? voice : baseProfile.brand_voice,
        locale: str(parsed.locale, baseProfile.locale || 'en-US'),
        currency: str(parsed.currency, baseProfile.currency || 'USD'),
        suggestedKeywords: mergedCards.slice(0, 6),
      };
    }
  } catch {
    /* Deterministic Brand DNA & 6 keyword cards remain active if LLM call fails or hits quota. */
  }

  return baseProfile;
}

export async function discoverKnowledge(
  raw: string,
  owner: string,
  db: SupabaseClient,
): Promise<SiteKnowledge> {
  const site = publicUrl(raw);
  const result: SiteKnowledge = {
    source: 'external_export',
    coverage: 'manual',
    checkedAt: new Date().toISOString(),
    name: '',
    industry: '',
    audience: '',
    offer: '',
    goal: '',
    locale: '',
    currency: '',
    colors: [],
    fonts: [],
    headings: [],
    logo: '',
    socials: [],
    pages: [],
    note: '',
    humanReview: false,
  };

  const builderSlug = /^\/p\/([\w-]+)\/?$/.exec(site.pathname)?.[1];
  if (site.hostname === 'doitwithai.tools' && builderSlug) {
    const { data, error } = await db
      .from('website_publications')
      .select('document')
      .eq('owner_id', owner)
      .eq('slug', builderSlug)
      .is('superseded_at', null)
      .maybeSingle();
    if (error) throw new Error('Builder ownership lookup failed.');
    if (data) {
      const doc = data.document;
      result.source = 'internal_direct';
      result.name = doc.identity?.name || '';
      result.industry = doc.identity?.role || '';
      result.audience = doc.opportunity?.audience || '';
      result.colors = [doc.design?.accent].filter(Boolean);
      const root = site.origin + '/p/' + builderSlug;
      result.pages.push({ url: root, title: result.name });
      for (const [items, path] of [
        [doc.publishing?.pages, 'pages'],
        [doc.publishing?.posts, 'blog'],
      ] as const) {
        for (const item of items || []) {
          if (item.status === 'published') {
            result.pages.push({
              title: item.title,
              url: root + '/' + path + '/' + encodeURIComponent(item.slug),
            });
          }
        }
      }
      for (const project of projectsForPresentation(doc)) {
        if (project.caseStudySlug) {
          result.pages.push({
            title: project.title,
            url: root + '/projects/' + encodeURIComponent(project.caseStudySlug),
          });
        }
      }
      result.socials = (doc.content?.contact?.socials || []).map(
        (s: { url: string }) => s.url,
      );
      result.coverage = 'complete';
      return synthesizeInitialBrandAndKeywords({
        workspaceId: owner,
        domain: site.href,
        knowledge: result,
      });
    }
  }

  const signal = AbortSignal.timeout(15000);
  let policy = '';
  let metaDescription = '';
  let jsonLdSummary = '';
  let navLabels: string[] = [];

  const beforeRequest = async (target: URL) => {
    if (!scoped(target.href, site) || !robotsAllows(policy, target.href)) {
      throw new Error('Crawl restricted.');
    }
  };

  try {
    const robots = await fetchPublic(site.origin + '/robots.txt', {
      text: true,
      signal,
      beforeRequest,
      maxDecodedBytes: 128000,
    }).catch(() => ({ status: 404, html: '', headers: {}, url: '', redirects: [] }));
    if (robots.status === 200) {
      policy = robots.html;
    }

    const page = await fetchPublic(site.href, {
      signal,
      beforeRequest,
      maxDecodedBytes: 512000,
    });
    if (page.status === 200) {
      const $ = load(page.html);
      const css = $('style').text().slice(0, 100000);
      result.colors = Array.from(new Set(css.match(/#[a-f0-9]{6}\b/gi) || [])).slice(0, 5);
      result.fonts = Array.from(
        new Set(Array.from(css.matchAll(/font-family:\s*([^;}]+)/gi), (m) => m[1].slice(0, 80))),
      ).slice(0, 3);
      result.name =
        $('meta[property="og:site_name"]').attr('content')?.trim() ||
        $('meta[property="og:title"]').attr('content')?.trim() ||
        $('title').text().trim().slice(0, 150);
      metaDescription =
        $('meta[name="description"]').attr('content')?.trim() ||
        $('meta[property="og:description"]').attr('content')?.trim() ||
        '';
      result.meta_description = metaDescription;
      result.locale = $('html').attr('lang')?.trim() || '';
      const icon = $('link[rel~="icon"]').attr('href');
      result.logo = icon ? scoped(icon, site) : '';
      result.currency =
        $('meta[property="product:price:currency"]').attr('content')?.trim() ||
        inferCurrencyFromText($('body').text().slice(0, 4000));
      result.headings = $('h1,h2,h3')
        .slice(0, 20)
        .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim().slice(0, 150))
        .get()
        .filter(Boolean);
      navLabels = $('nav a, header a')
        .slice(0, 20)
        .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
        .get()
        .filter((t) => t.length >= 2 && t.length <= 40);
      navLabels = Array.from(new Set(navLabels)).slice(0, 12);
      const jsonLd = parseJsonLdSignals($);
      jsonLdSummary = [...jsonLd.types, ...jsonLd.names, ...jsonLd.descriptions]
        .join(' · ')
        .slice(0, 600);
      result.socials = $('a[href]')
        .map((_, a) => $(a).attr('href'))
        .get()
        .filter(
          (url): url is string =>
            typeof url === 'string' &&
            /^https:\/\/(?:www\.)?(?:linkedin\.com|facebook\.com|pinterest\.com|tiktok\.com)\//i.test(
              url,
            ),
        )
        .slice(0, 8);

      $('script,style,nav,footer').remove();
      const bodyWordCount = $('body').text().trim().split(/\s+/).filter(Boolean).length;
      if (bodyWordCount < 250) {
        result.note =
          'Homepage rendered concise text (SPA or minimal landing page); sitemap and metadata were still analyzed.';
      }
      result.pages.push({
        url: page.url,
        title: $('h1').first().text().trim() || result.name || site.hostname,
      });
    }

    // Always attempt sitemap discovery regardless of homepage word count
    const queue = Array.from(policy.matchAll(/^sitemap:\s*(\S+)/gim), (m) =>
      scoped(m[1], site),
    ).filter(Boolean);
    if (!queue.length) queue.push(site.origin + '/sitemap.xml');
    const pages = new Map<string, SitePage>(result.pages.map((p) => [p.url, p]));
    const seen = new Set<string>();
    let partial = false;
    while (queue.length && seen.size < 5 && pages.size < 500) {
      const url = queue.shift()!;
      if (seen.has(url)) continue;
      seen.add(url);
      try {
        const xml = await fetchPublic(url, {
          xml: true,
          signal,
          beforeRequest,
          maxDecodedBytes: 512000,
        });
        if (xml.status !== 200) {
          partial = true;
          continue;
        }
        const sitemap = load(xml.html, { xmlMode: true });
        if (!sitemap('urlset,sitemapindex').length) partial = true;
        sitemap('sitemap > loc,url > loc').each((_, el) => {
          const href = scoped(sitemap(el).text().trim(), site);
          if (!href) {
            partial = true;
            return;
          }
          if (sitemap(el).parent().is('sitemap')) queue.push(href);
          else if (!pages.has(href) && pages.size < 500) {
            pages.set(href, {
              url: href,
              title:
                new URL(href)
                  .pathname.split('/')
                  .filter(Boolean)
                  .pop()
                  ?.replace(/[-_]/g, ' ') || result.name,
            });
          }
        });
      } catch {
        partial = true;
      }
      result.pages = Array.from(pages.values());
    }
    result.coverage =
      result.pages.length === 0
        ? 'manual'
        : partial || queue.length || pages.size >= 500
          ? 'partial'
          : 'complete';
  } catch {
    result.note =
      'The crawl was partially restricted; Brand DNA and starter keywords were synthesized from available signals.';
  }

  return synthesizeInitialBrandAndKeywords({
    workspaceId: owner,
    domain: site.href,
    knowledge: result,
    metaDescription,
    jsonLdSummary,
    navLabels,
  });
}

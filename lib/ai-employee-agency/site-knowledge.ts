export interface SitePage {
  url: string;
  title: string;
}

export interface SuggestedKeywordCard {
  keyword: string;
  recommendedTitle: string;
  intent: 'informational' | 'commercial' | 'transactional' | 'comparison';
  estimatedKd: number;
  overlapAction: 'create' | 'refresh' | 'review';
  overlapScore: number;
  matchedUrl: string | null;
  rationale: string;
}

export interface SiteAssetInventory {
  total: number;
  blogs: number;
  services: number;
  landingPages: number;
  products: number;
  other: number;
}

export type DomainMaturity = 'new_site' | 'established_site';
export type AgencyPriorityPreset = 'growth_launch' | 'balanced_scale' | 'optimization_sprint';

export interface SiteKnowledge {
  source: 'internal_direct' | 'external_export';
  coverage: 'complete' | 'partial' | 'manual';
  name: string;
  industry: string;
  audience: string;
  offer: string;
  goal: string;
  locale: string;
  currency: string;
  colors: string[];
  fonts: string[];
  headings: string[];
  logo: string;
  socials: string[];
  pages: SitePage[];
  checkedAt: string;
  note: string;
  humanReview: boolean;
  sub_niche?: string;
  business_model?: string | null;
  reading_grade_target?: string | null;
  brand_voice?: string[];
  domain_maturity?: DomainMaturity | null;
  priority_preset?: AgencyPriorityPreset;
  asset_inventory?: SiteAssetInventory;
  suggestedKeywords?: SuggestedKeywordCard[];
  meta_description?: string;
}

function words(text: string) {
  return new Set(
    text
      .normalize('NFKC')
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter((x) => !['a', 'an', 'the', 'for', 'of', 'and', 'to', 'in'].includes(x)) || [],
  );
}

export function classifyPageKind(
  url: string,
): 'blog' | 'service' | 'product' | 'landing' | 'other' {
  let pathname = '';
  try {
    pathname = new URL(url).pathname.toLowerCase();
  } catch {
    pathname = url.toLowerCase();
  }
  if (/\/(?:blog|blogs|articles?|posts?|guides?|news|insights)(?:\/|$)/.test(pathname)) {
    return 'blog';
  }
  if (/\/services?(?:\/|$)/.test(pathname)) {
    return 'service';
  }
  if (/\/(?:products?|tools?|shop|store)(?:\/|$)/.test(pathname)) {
    return 'product';
  }
  if (
    pathname === '/' ||
    pathname === '' ||
    /^\/(?:about|pricing|contact|features|solutions|home|demo|start)\/?$/.test(pathname)
  ) {
    return 'landing';
  }
  return 'other';
}

export function classifySiteMaturity(pages: SitePage[]): {
  domain_maturity: DomainMaturity;
  priority_preset: AgencyPriorityPreset;
  asset_inventory: SiteAssetInventory;
} {
  const inventory: SiteAssetInventory = {
    total: pages.length,
    blogs: 0,
    services: 0,
    landingPages: 0,
    products: 0,
    other: 0,
  };
  for (const page of pages) {
    const kind = classifyPageKind(page.url);
    if (kind === 'blog') inventory.blogs += 1;
    else if (kind === 'service') inventory.services += 1;
    else if (kind === 'product') inventory.products += 1;
    else if (kind === 'landing') inventory.landingPages += 1;
    else inventory.other += 1;
  }
  const domain_maturity: DomainMaturity =
    inventory.total >= 15 || inventory.blogs >= 5 ? 'established_site' : 'new_site';
  const priority_preset: AgencyPriorityPreset =
    domain_maturity === 'established_site' ? 'balanced_scale' : 'growth_launch';
  return { domain_maturity, priority_preset, asset_inventory: inventory };
}

export function topicDecision(topic: string, profile: SiteKnowledge) {
  const query = words(topic);
  let best = 0;
  let match: SitePage | null = null;
  for (const page of profile.pages || []) {
    let slug = '';
    try {
      slug = new URL(page.url).pathname.split('/').filter(Boolean).pop() || '';
    } catch {
      slug = page.url.split('/').filter(Boolean).pop() || '';
    }
    for (const candidate of [page.title, slug]) {
      const terms = words(candidate || '');
      const common = Array.from(query).filter((w) => terms.has(w)).length;
      const score = Math.round((200 * common) / (query.size + terms.size || 1));
      if (score > best) {
        best = score;
        match = page;
      }
    }
  }
  const action: 'refresh' | 'review' | 'create' =
    best >= 80 ? 'refresh' : best >= 50 ? 'review' : 'create';
  return {
    action,
    score: best,
    match,
    inventoryCoverage: profile.coverage,
  };
}

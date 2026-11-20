export interface SitePage {
  url: string;
  title: string;
}

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

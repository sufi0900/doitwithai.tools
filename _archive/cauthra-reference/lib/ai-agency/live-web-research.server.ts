import { createSupabaseServiceClient } from '@/features/website-builder/lib/supabase/server';

export interface RedditDiscussionSignal {
  title: string;
  subreddit: string;
  score: number;
  numComments: number;
  url: string;
  snippet: string;
}

export interface LiveWebResearchReport {
  query: string;
  redditThreads: RedditDiscussionSignal[];
  questionSignals: string[];
  freshSeeds: string[];
  sourcesQueried: string[];
  fetchedAt: string;
}

async function fetchAutocompleteList(query: string, limit = 6): Promise<string[]> {
  const clean = query.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
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
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 4)
        .map((item) => item.trim())
        .slice(0, limit);
    }
  } catch {
    // Non-fatal if suggest endpoint times out
  }
  return [];
}

/**
 * Fetches real Reddit community discussions & buyer pain points (Zero-LLM, edge-safe).
 */
export async function fetchRedditDiscussions(
  query: string,
  limit = 5,
): Promise<RedditDiscussionSignal[]> {
  const clean = query.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  try {
    const endpoint = `https://www.reddit.com/search.json?q=${encodeURIComponent(clean)}&sort=relevance&t=year&limit=${Math.min(limit, 8)}`;
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(4000),
      headers: {
        Accept: 'application/json',
        'User-Agent': 'DoItWithAI-WebResearch/6.0 (+https://doitwithai.tools)',
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: {
        children?: Array<{
          data?: {
            title?: string;
            subreddit?: string;
            score?: number;
            num_comments?: number;
            permalink?: string;
            selftext?: string;
          };
        }>;
      };
    };
    const children = data?.data?.children;
    if (!Array.isArray(children)) return [];

    return children
      .map((child) => child.data)
      .filter((post): post is NonNullable<typeof post> => Boolean(post?.title && post?.permalink))
      .slice(0, limit)
      .map((post) => ({
        title: String(post.title).trim().slice(0, 160),
        subreddit: String(post.subreddit || 'all'),
        score: Number(post.score || 0),
        numComments: Number(post.num_comments || 0),
        url: `https://www.reddit.com${post.permalink}`,
        snippet: String(post.selftext || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 220),
      }));
  } catch {
    return [];
  }
}

/**
 * Queries Google Autocomplete with Quora/Reddit/question/comparison modifiers to capture
 * authentic human buyer questions and commercial intent long-tails.
 */
export async function fetchQuoraAndQuestionSignals(
  query: string,
  limit = 10,
): Promise<string[]> {
  const base = query.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!base) return [];

  const probes = [
    base,
    `how to ${base}`,
    `best ${base}`,
    `${base} vs`,
    `${base} reddit`,
    `${base} quora`,
  ];

  const batches = await Promise.all(probes.map((p) => fetchAutocompleteList(p, 4)));
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const list of batches) {
    for (const item of list) {
      const cleaned = item
        .replace(/\b(?:reddit|quora)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      const key = cleaned.toLowerCase();
      if (cleaned.length >= 6 && !seen.has(key)) {
        seen.add(key);
        merged.push(cleaned);
      }
      if (merged.length >= limit) return merged;
    }
  }
  return merged;
}

/**
 * Executes parallel live web research (Reddit + Quora/Question Autocomplete), filters out
 * previously suggested keywords for guaranteed freshness, and records a dedicated
 * `web_research` telemetry entry in `token_usage_ledger` ($0.00 LLM cost).
 */
export async function runLiveWebResearch(input: {
  workspaceId?: string;
  query: string;
  excludeKeywords?: string[];
}): Promise<LiveWebResearchReport> {
  const normalizedQuery = input.query.trim().slice(0, 90);
  const excludeSet = new Set(
    (input.excludeKeywords || []).map((k) => k.trim().toLowerCase()).filter(Boolean),
  );

  const [redditThreads, questionSignals] = await Promise.all([
    fetchRedditDiscussions(normalizedQuery, 5),
    fetchQuoraAndQuestionSignals(normalizedQuery, 14),
  ]);

  const freshSeeds = questionSignals.filter(
    (q) => !excludeSet.has(q.toLowerCase()),
  );

  if (input.workspaceId) {
    try {
      const db = createSupabaseServiceClient();
      if (db) {
        await db.from('token_usage_ledger').insert({
          workspace_id: input.workspaceId,
          operation: 'web_research',
          model: 'live-web-research',
          provider: 'web',
          prompt_tokens: 0,
          completion_tokens: 0,
          thinking_tokens: 0,
          total_tokens: 0,
          calculated_usd: 0,
          held_tokens: 0,
          held_usd: 0,
        });
      }
    } catch {
      // Telemetry write is non-fatal
    }
  }

  return {
    query: normalizedQuery,
    redditThreads,
    questionSignals,
    freshSeeds,
    sourcesQueried: ['reddit_search', 'google_autocomplete_questions', 'quora_intent_probes'],
    fetchedAt: new Date().toISOString(),
  };
}

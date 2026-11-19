import { agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildCompetitorGapMatrix,
  type RawDomainCrawlPayload,
} from '@/lib/ai-employee-agency/competitor-gap-and-visibility';

interface CompetitorGapRequestBody {
  siteUrl?: string;
  siteName?: string;
  primaryNiche?: string;
  competitorUrls?: string[];
  workspacePages?: Array<{
    urlPath: string;
    pageTitle: string;
    targetKeyword: string;
    kdScore?: number;
  }>;
}

async function crawlDomainQuick(
  rawUrl: string,
  isUserDomain: boolean
): Promise<RawDomainCrawlPayload> {
  const safeUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const origin = safeUrl.replace(/^(https?:\/\/[^/]+).*$/i, '$1');
  const started = Date.now();

  const fetchWithTimeout = async (target: string, ms: number) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(target, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; DoItWithAI-GapAnalyzer/4.0; +https://doitwithai.tools)',
        },
      });
      const text = await res.text();
      return { status: res.status, text: text.slice(0, 260_000) };
    } catch {
      return { status: 0, text: '' };
    } finally {
      clearTimeout(timer);
    }
  };

  const [pageRes, llmsRes] = await Promise.all([
    fetchWithTimeout(safeUrl, 4000),
    fetchWithTimeout(`${origin}/llms.txt`, 2500),
  ]);

  return {
    url: safeUrl,
    isUserDomain,
    httpStatus: pageRes.status,
    responseTimeMs: Date.now() - started,
    html: pageRes.text,
    hasLlmsTxt:
      llmsRes.status >= 200 &&
      llmsRes.status < 300 &&
      llmsRes.text.trim().length > 20,
  };
}

async function fetchAutocompleteSeeds(seed: string): Promise<string[]> {
  const clean = seed.trim();
  if (!clean) return [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(
        clean
      )}`,
      { signal: controller.signal }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as unknown;
    if (Array.isArray(json) && Array.isArray(json[1])) {
      return (json[1] as unknown[])
        .filter((x): x is string => typeof x === 'string' && x.length > 5)
        .slice(0, 8);
    }
    return [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  const workspace = await agencyWorkspace(req);
  if (workspace instanceof NextResponse) return workspace;
  try {
    const body = (await req.json().catch(() => ({}))) as CompetitorGapRequestBody;
    const siteUrl = (body.siteUrl || 'https://doitwithai.tools').trim();
    const siteName = (body.siteName || 'DoItWithAI.tools').trim();
    const primaryNiche = (
      body.primaryNiche || 'AI SEO & Digital Marketing'
    ).trim();

    const cleanCompetitors = (
      Array.isArray(body.competitorUrls) && body.competitorUrls.length > 0
        ? body.competitorUrls
        : ['https://seo.ai', 'https://www.junia.ai']
    )
      .map((u) => u.trim())
      .filter((u) => u.length > 3)
      .slice(0, 3);

    const [userCrawl, autocompleteSeeds, ...competitorCrawls] =
      await Promise.all([
        crawlDomainQuick(siteUrl, true),
        fetchAutocompleteSeeds(`${primaryNiche} tools`),
        ...cleanCompetitors.map((url) => crawlDomainQuick(url, false)),
      ]);

    const suite = buildCompetitorGapMatrix({
      siteName,
      siteUrl,
      primaryNiche,
      userCrawl,
      competitorCrawls,
      autocompleteSeeds,
      workspacePages: body.workspacePages,
    });

    return NextResponse.json({
      ok: true,
      suite,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to analyze On-Page SEO and Competitor Gap.',
      },
      { status: 500 }
    );
  }
}

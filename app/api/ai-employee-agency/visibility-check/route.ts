import { NextRequest, NextResponse } from 'next/server';
import {
  buildThreeModeArticleLaunchBrief,
  evaluateAiBrandVisibility,
  type ArticleLaunchModeId,
} from '@/lib/ai-employee-agency/ai-visibility-and-launcher';

interface VisibilityCheckRequestBody {
  action?: 'visibility-audit' | 'launch-3-mode';
  siteUrl?: string;
  siteName?: string;
  primaryNiche?: string;
  customPrompts?: string[];
  mode?: ArticleLaunchModeId;
  input?: string;
}

async function fetchTextSafe(
  url: string,
  timeoutMs = 4000
): Promise<{ status: number; text: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; DoItWithAI-VisibilityBot/4.0; +https://doitwithai.tools)',
      },
    });
    const text = await res.text();
    return { status: res.status, text: text.slice(0, 260_000) };
  } catch {
    return { status: 0, text: '' };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as VisibilityCheckRequestBody;
    const siteUrl = (body.siteUrl || 'https://doitwithai.tools').trim();
    const siteName = (body.siteName || 'DoItWithAI.tools').trim();
    const primaryNiche = (
      body.primaryNiche || 'AI SEO & Digital Marketing'
    ).trim();

    if (body.action === 'launch-3-mode') {
      const mode: ArticleLaunchModeId = body.mode || 'keyword';
      const rawInput = (body.input || primaryNiche).trim();

      if (mode === 'competitor-url') {
        const targetUrl = rawInput.startsWith('http')
          ? rawInput
          : `https://${rawInput}`;
        const crawled = await fetchTextSafe(targetUrl, 4000);
        const html = crawled.text;
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const h2Matches = Array.from(
          html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)
        )
          .map((m) =>
            (m[1] || '')
              .replace(/<[^>]+>/g, '')
              .replace(/\s+/g, ' ')
              .trim()
          )
          .filter((h) => h.length > 6 && h.length < 90)
          .slice(0, 5);
        const wordCount = html
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .trim()
          .split(/\s+/).length;

        const plan = buildThreeModeArticleLaunchBrief({
          mode: 'competitor-url',
          input: targetUrl,
          siteName,
          primaryNiche,
          crawledTitle: titleMatch?.[1]?.replace(/\s+/g, ' ').trim(),
          crawledHeadings: h2Matches,
          crawledWordCount: wordCount,
        });

        return NextResponse.json({ ok: true, plan });
      }

      if (mode === 'youtube-video') {
        let ytTitle = '';
        let ytAuthor = '';
        try {
          const oembedRes = await fetchTextSafe(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(
              rawInput
            )}&format=json`,
            3500
          );
          if (oembedRes.status === 200 && oembedRes.text) {
            const parsed = JSON.parse(oembedRes.text) as {
              title?: string;
              author_name?: string;
            };
            ytTitle = parsed.title || '';
            ytAuthor = parsed.author_name || '';
          }
        } catch {
          // Use deterministic fallback title
        }

        const plan = buildThreeModeArticleLaunchBrief({
          mode: 'youtube-video',
          input: rawInput,
          siteName,
          primaryNiche,
          youtubeTitle: ytTitle,
          youtubeAuthor: ytAuthor,
        });

        return NextResponse.json({ ok: true, plan });
      }

      const plan = buildThreeModeArticleLaunchBrief({
        mode: 'keyword',
        input: rawInput,
        siteName,
        primaryNiche,
      });
      return NextResponse.json({ ok: true, plan });
    }

    const normalizedUrl = siteUrl.startsWith('http')
      ? siteUrl
      : `https://${siteUrl}`;
    const origin = normalizedUrl.replace(/^(https?:\/\/[^/]+).*$/i, '$1');

    const [pageRes, robotsRes, llmsRes] = await Promise.all([
      fetchTextSafe(normalizedUrl, 4000),
      fetchTextSafe(`${origin}/robots.txt`, 2500),
      fetchTextSafe(`${origin}/llms.txt`, 2500),
    ]);

    const report = evaluateAiBrandVisibility({
      siteName,
      siteUrl: normalizedUrl,
      primaryNiche,
      html: pageRes.text,
      robotsTxt: robotsRes.text,
      hasLlmsTxt:
        llmsRes.status >= 200 &&
        llmsRes.status < 300 &&
        llmsRes.text.trim().length > 20,
      customPrompts: body.customPrompts,
    });

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to run AI visibility or 3-mode article launcher.',
      },
      { status: 500 }
    );
  }
}

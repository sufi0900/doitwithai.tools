import { NextRequest, NextResponse } from 'next/server';
import { runMechanicalSiteAudit } from '@/lib/ai-employee-agency/semrush-ahrefs-audit-engine';

interface SiteAuditRequestBody {
  siteUrl?: string;
  siteName?: string;
  primaryNiche?: string;
}

async function fetchTextWithTimeout(
  url: string,
  timeoutMs = 4500
): Promise<{
  status: number;
  text: string;
  elapsedMs: number;
  redirected: boolean;
  finalUrl: string;
}> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; DoItWithAI-SiteAuditor/4.0; +https://doitwithai.tools)',
      },
    });
    const text = await res.text();
    return {
      status: res.status,
      text: text.slice(0, 350_000),
      elapsedMs: Date.now() - started,
      redirected: res.redirected,
      finalUrl: res.url || url,
    };
  } catch {
    return {
      status: 0,
      text: '',
      elapsedMs: Date.now() - started,
      redirected: false,
      finalUrl: url,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as SiteAuditRequestBody;
    const rawUrl = (body.siteUrl || 'https://doitwithai.tools').trim();
    const normalizedUrl = rawUrl.startsWith('http')
      ? rawUrl
      : `https://${rawUrl}`;
    const origin = normalizedUrl.replace(/^(https?:\/\/[^/]+).*$/i, '$1');

    const [pageRes, robotsRes, llmsRes] = await Promise.all([
      fetchTextWithTimeout(normalizedUrl, 4500),
      fetchTextWithTimeout(`${origin}/robots.txt`, 3000),
      fetchTextWithTimeout(`${origin}/llms.txt`, 3000),
    ]);

    const report = runMechanicalSiteAudit({
      siteUrl: normalizedUrl,
      siteName: body.siteName,
      primaryNiche: body.primaryNiche,
      httpStatus: pageRes.status,
      responseTimeMs: pageRes.elapsedMs,
      html: pageRes.text,
      robotsTxtStatus: robotsRes.status,
      robotsTxtContent: robotsRes.text,
      llmsTxtStatus: llmsRes.status,
      llmsTxtContent: llmsRes.text,
      redirected: pageRes.redirected,
      finalUrl: pageRes.finalUrl,
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
            : 'Failed to execute live mechanical site audit.',
      },
      { status: 500 }
    );
  }
}

import { requireApprovedWebsite, agencyWorkspace } from '@/lib/ai-employee-agency/workspace.server';
import { NextRequest, NextResponse } from 'next/server';
import {
  CMS_PLATFORM_SPECS,
  buildCmsCurlPreview,
  compileCmsReadyHtmlDocument,
  type CmsArticlePayload,
  type CmsConnectionConfig,
  type CmsPublishExecutionResult,
} from '@/lib/ai-employee-agency/cms-connectors';

interface PublishCmsRequestBody {
  config?: CmsConnectionConfig;
  reviewId?: string;
}

export async function POST(req: NextRequest) {
  const workspace = await agencyWorkspace(req);
  if (workspace instanceof NextResponse) return workspace;
  const blocked = await requireApprovedWebsite(workspace);
  if (blocked) return blocked;
  try {
    const body = (await req.json().catch(() => ({}))) as PublishCmsRequestBody;
    const config: CmsConnectionConfig = body.config || {
      platformId: 'wordpress-rest',
      siteUrl: 'https://doitwithai.tools',
      autoPublishMode: 'stage-as-draft',
    };

    if (!body.reviewId) return NextResponse.json({error:'Select a signed-off QA review before CMS delivery.'},{status:409});
    const [review,brand] = await Promise.all([
      workspace.db.from('qa_audit_logs').select('payload').eq('workspace_id',workspace.id).eq('id',body.reviewId).maybeSingle(),
      workspace.db.from('tenant_brand_dna').select('revision,approved_at,profile').eq('workspace_id',workspace.id).maybeSingle(),
    ]);
    const receipt = review.data?.payload;
    if (!brand.data?.approved_at || receipt?.disposition !== 'approved' || receipt.revision !== brand.data.revision || !receipt.article ||
      (brand.data.profile.is_ymyl !== false && receipt.signedBy !== workspace.id))
      return NextResponse.json({error:'A current approved scorecard is required.'},{status:409});
    const article: CmsArticlePayload = receipt.article;

    const spec =
      CMS_PLATFORM_SPECS[config.platformId] ||
      CMS_PLATFORM_SPECS['wordpress-rest'];
    const fullHtml =
      article.compiledHtmlBody || compileCmsReadyHtmlDocument(article);
    const postStatus: 'published' | 'draft' =
      config.autoPublishMode === 'auto-publish-live' ? 'published' : 'draft';
    const cleanSiteUrl =
      config.siteUrl.replace(/\/$/, '') || 'https://doitwithai.tools';
    const curlSnippet = buildCmsCurlPreview(config, article.slug, article.title);

    // 1. Live WordPress Application Passwords REST API (`POST /wp-json/wp/v2/posts`)
    if (
      config.platformId === 'wordpress-rest' &&
      config.wpUsername &&
      config.wpApplicationPassword &&
      config.wpApplicationPassword.trim().length >= 8
    ) {
      try {
        const wpEndpoint = `${cleanSiteUrl}/wp-json/wp/v2/posts`;
        const authToken = Buffer.from(
          `${config.wpUsername.trim()}:${config.wpApplicationPassword.trim()}`
        ).toString('base64');

        const wpRes = await fetch(wpEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${authToken}`,
          },
          body: JSON.stringify({
            title: article.title,
            slug: article.slug,
            status: postStatus === 'published' ? 'publish' : 'draft',
            content: fullHtml,
            excerpt: article.aeoDirectAnswer50Words,
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (wpRes.ok) {
          const wpData = (await wpRes.json()) as {
            id?: number | string;
            link?: string;
          };
          const result: CmsPublishExecutionResult = {
            ok: true,
            platformId: 'wordpress-rest',
            platformDisplayName: spec.displayName,
            executedMode: 'live-cms-api',
            postStatus,
            publishedOrStagedUrl:
              wpData?.link || `${cleanSiteUrl}/${article.slug}`,
            externalPostId: String(wpData?.id || `wp-${Date.now()}`),
            timestampIso: new Date().toISOString(),
            diagnosticMessage: `Successfully delivered to WordPress via Application Passwords REST API (/wp-json/wp/v2/posts) as ${postStatus.toUpperCase()}.`,
            curlEquivalentSnippet: curlSnippet,
          };
          return NextResponse.json(result);
        }
      } catch {
        // Return the delivery failure below.
      }
    }

    // 2. Live Universal Webhook POST (`POST https://your-domain.com/api/webhook`)
    if (
      config.platformId === 'universal-webhook' &&
      config.webhookEndpointUrl &&
      config.webhookEndpointUrl.startsWith('http')
    ) {
      try {
        const whRes = await fetch(config.webhookEndpointUrl.trim(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-DoItWithAI-Signature':
              config.webhookSecretHeader || 'doitwithai-v3-verified',
          },
          body: JSON.stringify({
            event: 'agency.article.ready',
            status: postStatus,
            article: {
              ...article,
              compiledHtmlBody: fullHtml,
            },
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (whRes.ok) {
          const result: CmsPublishExecutionResult = {
            ok: true,
            platformId: 'universal-webhook',
            platformDisplayName: spec.displayName,
            executedMode: 'live-cms-api',
            postStatus,
            publishedOrStagedUrl: `${cleanSiteUrl}/blog/${article.slug}`,
            externalPostId: `wh-${Date.now()}`,
            timestampIso: new Date().toISOString(),
            diagnosticMessage: `Delivered complete JSON article + 5 SVGs + @graph schema payload to webhook (${config.webhookEndpointUrl}).`,
            curlEquivalentSnippet: curlSnippet,
          };
          return NextResponse.json(result);
        }
      } catch {
        // Return the delivery failure below.
      }
    }

    return NextResponse.json({ok:false,error:'CMS delivery was not confirmed. Check the connector and credentials.'},{status:502});
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to execute CMS auto-publish connector.',
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V3 PHASE 10)
 * Module: `lib/ai-employee-agency/cms-connectors.ts`
 *
 * 1-Click No-Code CMS Auto-Publishing Connectors (60-Second Setup):
 * - Reverse-engineers and upgrades SEO.AI's $149/mo "Connects to WordPress,
 *   Webflow, Wix, Squarespace, Shopify in minutes" feature:
 *   1. WordPress REST API via Application Passwords (`POST /wp-json/wp/v2/posts`)
 *      using standard Basic Auth (`username:application_password`) — zero plugin
 *      installation required (`https://seo.ai/blog/how-to-set-up-the-wordpress-integration`).
 *   2. Shopify Admin Blog API (`POST /admin/api/2025-01/blogs/{blogId}/articles.json`)
 *      using `X-Shopify-Access-Token`.
 *   3. Webflow CMS v2 API (`POST https://api.webflow.com/v2/collections/{collectionId}/items/live`)
 *      using Bearer token.
 *   4. Universal Webhook Connector (`POST https://your-domain.com/api/webhook`)
 *      for Custom Next.js, Ghost, Wix, Squarespace, or Headless CMS setups.
 *   5. Internal DoItWithAI.tools Blog Store (`/p/[slug]/blog`) for instant
 *      zero-credential hosting.
 * ============================================================================
 */

export type CmsPlatformId =
  | 'wordpress-rest'
  | 'shopify-blog'
  | 'webflow-cms'
  | 'universal-webhook'
  | 'internal-doitwithai';

export interface CmsConnectionConfig {
  platformId: CmsPlatformId;
  siteUrl: string;
  autoPublishMode: 'auto-publish-live' | 'stage-as-draft';
  // WordPress Application Password fields
  wpUsername?: string;
  wpApplicationPassword?: string;
  // Shopify Admin API fields
  shopifyStoreDomain?: string;
  shopifyAccessToken?: string;
  shopifyBlogId?: string;
  // Webflow CMS v2 fields
  webflowApiToken?: string;
  webflowCollectionId?: string;
  // Universal Webhook fields
  webhookEndpointUrl?: string;
  webhookSecretHeader?: string;
}

export interface CmsArticlePayload {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  aeoDirectAnswer50Words: string;
  compiledHtmlBody: string;
  compiledMarkdownBody: string;
  featuredHeroSvg: string;
  jsonLdGraphScript: string;
  primaryKeyword: string;
}

export interface CmsPublishExecutionResult {
  ok: boolean;
  platformId: CmsPlatformId;
  platformDisplayName: string;
  executedMode: 'live-cms-api' | 'simulated-dry-run';
  postStatus: 'published' | 'draft';
  publishedOrStagedUrl: string;
  externalPostId: string;
  timestampIso: string;
  diagnosticMessage: string;
  curlEquivalentSnippet: string;
}

const CMS_CONFIG_STORAGE_KEY = 'doitwithai_agency_v3_cms_connector_v1';

export const CMS_PLATFORM_SPECS: Record<
  CmsPlatformId,
  {
    platformId: CmsPlatformId;
    displayName: string;
    setupTimeLabel: string;
    endpointTemplate: string;
    authMethodSummary: string;
    guideReferenceUrl: string;
  }
> = {
  'wordpress-rest': {
    platformId: 'wordpress-rest',
    displayName: 'WordPress (Application Passwords REST API)',
    setupTimeLabel: '60-Second No-Plugin Setup',
    endpointTemplate: 'POST https://your-site.com/wp-json/wp/v2/posts',
    authMethodSummary:
      'WP Admin → Users → Profile → Application Passwords (Basic Auth)',
    guideReferenceUrl: 'https://seo.ai/blog/how-to-set-up-the-wordpress-integration',
  },
  'shopify-blog': {
    platformId: 'shopify-blog',
    displayName: 'Shopify Store Blog (Admin REST API)',
    setupTimeLabel: '60-Second Custom App Token',
    endpointTemplate:
      'POST https://{shop}.myshopify.com/admin/api/2025-01/blogs/{blog_id}/articles.json',
    authMethodSummary: 'Header: X-Shopify-Access-Token (shpat_...) + Blog ID',
    guideReferenceUrl: 'https://seo.ai/pricing',
  },
  'webflow-cms': {
    platformId: 'webflow-cms',
    displayName: 'Webflow CMS Collections API v2',
    setupTimeLabel: '60-Second Collection Token',
    endpointTemplate:
      'POST https://api.webflow.com/v2/collections/{collection_id}/items/live',
    authMethodSummary: 'Header: Authorization: Bearer {webflow_token}',
    guideReferenceUrl: 'https://seo.ai/pricing',
  },
  'universal-webhook': {
    platformId: 'universal-webhook',
    displayName: 'Universal JSON Webhook (Next.js / Wix / Ghost / Custom)',
    setupTimeLabel: 'Instant Webhook URL',
    endpointTemplate: 'POST https://your-domain.com/api/ai-agency-webhook',
    authMethodSummary: 'JSON POST with X-DoItWithAI-Signature header',
    guideReferenceUrl: 'https://www.blogseo.io/blogseo-vs-autoseo',
  },
  'internal-doitwithai': {
    platformId: 'internal-doitwithai',
    displayName: 'Internal DoItWithAI.tools Hosted Blog (/p/[slug]/blog)',
    setupTimeLabel: 'Zero-Config Instant Live Publish',
    endpointTemplate: 'Internal Store → /p/[slug]/blog/[article-slug]',
    authMethodSummary: 'Built-in zero-credential instant publishing',
    guideReferenceUrl: 'https://doitwithai.tools/ai-employee-agency',
  },
};

/**
 * Compiles a complete, self-contained HTML article body embedding the
 * 1200×675 Featured Hero SVG, 50-word AEO direct answer lead, markdown prose,
 * and connected @graph JSON-LD schema for WordPress, Shopify, or Webflow.
 */
export function compileCmsReadyHtmlDocument(payload: CmsArticlePayload): string {
  const paragraphs = payload.compiledMarkdownBody
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('# ')) {
        return `<h1>${trimmed.slice(2)}</h1>`;
      }
      if (trimmed.startsWith('## ')) {
        return `<h2>${trimmed.slice(3)}</h2>`;
      }
      if (trimmed.startsWith('### ')) {
        return `<h3>${trimmed.slice(4)}</h3>`;
      }
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return [
    `<!-- DoItWithAI.tools 24/7 Autonomous AI Digital Agency — 0.00 CLS Hero SVG & AEO Lead -->`,
    `<figure class="doitwithai-featured-hero" style="margin:0 0 24px 0;">`,
    payload.featuredHeroSvg,
    `</figure>`,
    `<div class="doitwithai-aeo-direct-answer" style="padding:18px 20px;border-left:4px solid #10B981;background:#0F172A;color:#F8FAFC;margin-bottom:24px;border-radius:12px;">`,
    `<strong>Key Takeaway (${payload.primaryKeyword}):</strong> ${payload.aeoDirectAnswer50Words}`,
    `</div>`,
    paragraphs,
    payload.jsonLdGraphScript,
  ].join('\n');
}

/**
 * Generates a transparent cURL command preview for the selected CMS connector
 */
export function buildCmsCurlPreview(
  config: CmsConnectionConfig,
  articleSlug: string,
  articleTitle: string
): string {
  const cleanSite = config.siteUrl.replace(/\/$/, '') || 'https://your-site.com';
  const wpStatus =
    config.autoPublishMode === 'auto-publish-live' ? 'publish' : 'draft';

  switch (config.platformId) {
    case 'wordpress-rest':
      return `curl -X POST "${cleanSite}/wp-json/wp/v2/posts" \\\n  -u "${
        config.wpUsername || 'editor'
      }:xxxx-xxxx-xxxx-xxxx" \\\n  -H "Content-Type: application/json" \\\n  -d '{"title":"${articleTitle.slice(
        0,
        45
      )}","slug":"${articleSlug}","status":"${wpStatus}","content":"<!-- 1200x675 Hero SVG + 4x 6-Layer SVGs + @graph JSON-LD -->"}'`;
    case 'shopify-blog':
      return `curl -X POST "https://${
        config.shopifyStoreDomain || 'your-store.myshopify.com'
      }/admin/api/2025-01/blogs/${
        config.shopifyBlogId || '8829102'
      }/articles.json" \\\n  -H "X-Shopify-Access-Token: shpat_••••••••••••" \\\n  -H "Content-Type: application/json" \\\n  -d '{"article":{"title":"${articleTitle.slice(
        0,
        45
      )}","handle":"${articleSlug}","published":${
        config.autoPublishMode === 'auto-publish-live'
      }}}'`;
    case 'webflow-cms':
      return `curl -X POST "https://api.webflow.com/v2/collections/${
        config.webflowCollectionId || '65f9a8c12e...'
      }/items/live" \\\n  -H "Authorization: Bearer wf_••••••••••••" \\\n  -H "Content-Type: application/json" \\\n  -d '{"fieldData":{"name":"${articleTitle.slice(
        0,
        45
      )}","slug":"${articleSlug}"}}'`;
    case 'universal-webhook':
      return `curl -X POST "${
        config.webhookEndpointUrl || `${cleanSite}/api/ai-agency-webhook`
      }" \\\n  -H "X-DoItWithAI-Signature: sha256=••••••••" \\\n  -H "Content-Type: application/json" \\\n  -d '{"event":"article.published","slug":"${articleSlug}","status":"${wpStatus}"}'`;
    case 'internal-doitwithai':
      return `# Internal Zero-Config Publisher → Auto-publishes directly to /p/[slug]/blog/${articleSlug}`;
  }
}

export function loadCmsConnectionConfig(
  siteUrl: string,
  isInternalSite: boolean
): CmsConnectionConfig {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(CMS_CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CmsConnectionConfig;
        if (parsed && parsed.platformId) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }
  return {
    platformId: isInternalSite ? 'internal-doitwithai' : 'wordpress-rest',
    siteUrl: siteUrl || 'https://doitwithai.tools',
    autoPublishMode: isInternalSite ? 'auto-publish-live' : 'stage-as-draft',
    wpUsername: 'seo-agency-bot',
    shopifyStoreDomain: '',
    shopifyBlogId: 'news',
    webflowCollectionId: '',
    webhookEndpointUrl: '',
  };
}

export function saveCmsConnectionConfig(
  config: CmsConnectionConfig
): CmsConnectionConfig {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CMS_CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore storage errors
    }
  }
  return config;
}

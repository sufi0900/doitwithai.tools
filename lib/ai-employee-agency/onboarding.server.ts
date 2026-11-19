import { projectsForPresentation } from '@/features/website-builder/domain/opportunity';
import { load } from 'cheerio';
import { fetchPublic, publicUrl } from '@/features/backlink-verifier/fetch.server';
import { robotsAllows } from '@/features/internal-linking/server';
import type { SiteKnowledge, SitePage } from './site-knowledge';
import type { SupabaseClient } from '@supabase/supabase-js';

function scoped(raw: string, base: URL) {
  try {
    const url = publicUrl(new URL(raw, base).href);
    if (url.origin === base.origin) return url.href;
  } catch { /* Ignore malformed links in customer documents. */ }
  return '';
}

export async function discoverKnowledge(raw: string, owner: string, db: SupabaseClient): Promise<SiteKnowledge> {
  const site = publicUrl(raw);
  const result: SiteKnowledge = { source: 'external_export', coverage: 'manual', checkedAt: new Date().toISOString(),
    name: '', industry: '', audience: '', offer: '', goal: '', locale: '', currency: '', colors: [], fonts: [],
    headings: [], logo: '', socials: [], pages: [], note: '', humanReview: false };
  const builderSlug = /^\/p\/([\w-]+)\/?$/.exec(site.pathname)?.[1];
  if (site.hostname === 'doitwithai.tools' && builderSlug) {
    const { data, error } = await db.from('website_publications').select('document').eq('owner_id', owner)
      .eq('slug', builderSlug).is('superseded_at', null).maybeSingle();
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
      for (const [items, path] of [[doc.publishing?.pages, 'pages'], [doc.publishing?.posts, 'blog']] as const) {
        for (const item of items || []) if (item.status === 'published') result.pages.push({ title: item.title, url: root + '/' + path + '/' + encodeURIComponent(item.slug) });
      }
      for (const project of projectsForPresentation(doc)) {
        if (project.caseStudySlug) result.pages.push({ title: project.title, url: root + '/projects/' + encodeURIComponent(project.caseStudySlug) });
      }

      result.socials = (doc.content?.contact?.socials || []).map((s: {url: string}) => s.url);
      result.coverage = 'complete';
      return result;
    }
  }
  const signal = AbortSignal.timeout(15000);
  let policy = '';
  const beforeRequest = async (target: URL) => {
    if (!scoped(target.href, site) || !robotsAllows(policy, target.href)) throw new Error('Crawl restricted.');
  };
  try {
    const robots = await fetchPublic(site.origin + '/robots.txt', { text: true, signal, beforeRequest, maxDecodedBytes: 128000 });
    if (robots.status !== 404 && robots.status !== 410 && robots.status !== 200) throw new Error('Robots policy unavailable.');
    policy = robots.html;
    const page = await fetchPublic(site.href, { signal, beforeRequest, maxDecodedBytes: 512000 });
    if (page.status !== 200) throw new Error('Homepage unavailable.');
    const $ = load(page.html);
    const css = $('style').text().slice(0,100000);
    result.colors = Array.from(new Set(css.match(/#[a-f0-9]{6}\b/gi) || [])).slice(0,5);
    result.fonts = Array.from(new Set(Array.from(css.matchAll(/font-family:\s*([^;}]+)/gi), m => m[1].slice(0,80)))).slice(0,3);
    result.name = $('meta[property="og:site_name"]').attr('content') || $('title').text().slice(0,150);
    result.locale = $('html').attr('lang') || '';
    const icon = $('link[rel~="icon"]').attr('href');
    result.logo = icon ? scoped(icon, site) : '';
    result.currency = $('meta[property="product:price:currency"]').attr('content') || '';
    result.headings = $('h1,h2,h3').slice(0,20).map((_,el) => $(el).text().trim().slice(0,150)).get();
    result.socials = $('a[href]').map((_,a) => $(a).attr('href')).get().filter(url => /^https:\/\/(?:www\.)?(?:linkedin\.com|facebook\.com|pinterest\.com|tiktok\.com)\//i.test(url)).slice(0,8);
    $('script,style,nav,footer').remove();
    result.pages.push({ url: page.url, title: $('h1').first().text() || result.name });
    if ($('body').text().trim().split(/\s+/).length < 250) throw new Error('Limited readable content.');
    result.coverage = 'partial';
    const queue = Array.from(policy.matchAll(/^sitemap:\s*(\S+)/gim), m => scoped(m[1], site)).filter(Boolean);
    if (!queue.length) queue.push(site.origin + '/sitemap.xml');
    const pages = new Map<string,SitePage>(result.pages.map(p => [p.url,p]));
    const seen = new Set<string>();
    let partial = false;
    while (queue.length && seen.size < 5 && pages.size < 500) {
      const url = queue.shift()!;
      if (seen.has(url)) continue;
      seen.add(url);
      const xml = await fetchPublic(url, { xml: true, signal, beforeRequest, maxDecodedBytes: 512000 });
      if (xml.status !== 200) { partial = true; continue; }
      const sitemap = load(xml.html, { xmlMode: true });
      if (!sitemap('urlset,sitemapindex').length) partial = true;
      sitemap('sitemap > loc,url > loc').each((_, el) => {
        const href = scoped(sitemap(el).text().trim(), site);
        if (!href) { partial = true; return; }
        if (sitemap(el).parent().is('sitemap')) queue.push(href);
        else if (!pages.has(href) && pages.size < 500) pages.set(href,{ url: href, title: new URL(href).pathname.split('/').filter(Boolean).pop()?.replace(/[-_]/g,' ') || result.name });
      });
      result.pages = Array.from(pages.values());
    }
    result.coverage = partial || queue.length || pages.size >= 500 ? 'partial' : 'complete';
  } catch {
    result.note = 'The crawl was blocked, incomplete, or returned limited content. Review the site details and complete the brand brief.';
  }
  return result;
}

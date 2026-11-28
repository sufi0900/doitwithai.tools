import { load } from 'cheerio';
import { fetchPublic } from '@/features/backlink-verifier/fetch.server';
export interface Evidence { url: string; excerpt: string }

export async function research(message: string, blocked: string[]): Promise<Evidence[]> {
  const terms = message.replace(/https?:\/\/\S+/g,'').split(/\s+/).filter(w => w.length > 3).slice(0,12);
  const urls: string[] = message.match(/https?:\/\/[^\s<>")]+/g) || [];
  const signal = AbortSignal.timeout(12000);
  if (!urls.length && terms.length) {
    const api = new URL('https://en.wikipedia.org/w/api.php');
    api.search = new URLSearchParams({ action:'opensearch',search:terms.join(' '),limit:'3',format:'json' }).toString();
    try {
      const res = await fetch(api,{signal,redirect:'error'});
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data[3])) urls.push(...data[3].filter((u: unknown) => typeof u === 'string'));
      }
    } catch { /* Evidence can be empty when discovery is unavailable. */ }
  }
  function allowed(url: URL) {
    const host = url.hostname.toLowerCase();
    if (blocked.some(d => host === d || host.endsWith('.' + d))) throw new Error('Excluded source');
  }
  const results = await Promise.all([...new Set(urls)].slice(0,3).map(async url => {
    try {
      const page = await fetchPublic(url,{signal,maxDecodedBytes:350000,beforeRequest:async target => allowed(target)});
      if (page.status !== 200) return null;
      const $ = load(page.html);
      $('script,style,nav,footer,aside').remove();
      const paragraphs = $('p').map((_,p) => $(p).text().replace(/\s+/g,' ').trim()).get().filter(p => p.length >= 50);
      const score = (p: string) => terms.filter(w => p.toLowerCase().includes(w.toLowerCase())).length;
      const excerpt = paragraphs.sort((a,b) => score(b)-score(a)).slice(0,3).join('\n').slice(0,1800);
      return excerpt ? {url:page.url,excerpt} : null;
    } catch { return null; }
  }));
  return results.filter((r): r is Evidence => r !== null);
}

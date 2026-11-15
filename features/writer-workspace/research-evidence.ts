/** Read discovered pages through the existing SSRF-protected extractor, never from snippets. */
export async function collectResearchEvidence(
  links: Array<{ url: string; title?: string }>,
  existing: Array<{ url: string }>,
  fetcher: typeof fetch = fetch,
  signal?: AbortSignal,
) {
  const remaining = Math.max(0, Math.min(2, 4 - existing.length));
  const seen = new Set(existing.map(r => r.url));
  const candidates = links.filter(link => {
    try { const url = new URL(link.url); if (!/^https?:$/.test(url.protocol) || seen.has(url.href)) return false; seen.add(url.href); return true; } catch { return false; }
  }).slice(0, remaining);
  const results = await Promise.all(candidates.map(async link => {
    try {
      const res = await fetcher('/api/ai-tools/universal-extract', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({url:link.url,purpose:'infographic'}), signal:signal ? AbortSignal.any([signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000) });
      if (!res.ok) return null;
      const data = await res.json();
      const text = data.cleanText || data.data?.cleanText || data.text;
      if (typeof text !== 'string' || text.trim().length < 100) return null;
      return { id:crypto.randomUUID(), url:link.url, title:String(data.title || data.data?.title || link.title || new URL(link.url).hostname).slice(0,300), text:text.trim().slice(0,8000), importedAt:new Date().toISOString() };
    } catch { return null; }
  }));
  return results.filter((result): result is NonNullable<typeof result> => result !== null);
}

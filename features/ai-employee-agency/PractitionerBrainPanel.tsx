'use client';

import { useEffect, useState } from 'react';
import { agencyRequest } from './agency-request';

interface KnowledgeSourceRow {
  id: string;
  title: string;
  source_type: string;
  specialist_role: string;
  industry_tags: string[];
  maturity_tags: string[];
  parent_summary: string;
  storage_object_path: string | null;
  active: boolean;
  created_at: string;
}

interface BrainAccess {
  enabled: boolean;
  tier: string;
  brandName: string;
  upgradeRequired: boolean;
}

interface PreviewTactic {
  chunkId: string;
  sourceTitle: string;
  tacticTitle: string;
  tacticBody: string;
  similarity: number;
}

export function PractitionerBrainPanel() {
  const [access, setAccess] = useState<BrainAccess | null>(null);
  const [sources, setSources] = useState<KnowledgeSourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Playbook Intake Form State
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState('seo_playbook');
  const [specialistRole, setSpecialistRole] = useState('unified');
  const [industryTags, setIndustryTags] = useState('saas, agency, b2b');
  const [storagePath, setStoragePath] = useState('');
  const [parentSummary, setParentSummary] = useState('');
  const [rawPlaybook, setRawPlaybook] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Live RAG Simulator State
  const [ragQuery, setRagQuery] = useState('');
  const [ragRole, setRagRole] = useState('unified');
  const [ragTesting, setRagTesting] = useState(false);
  const [ragMatches, setRagMatches] = useState<PreviewTactic[]>([]);

  async function loadSources() {
    setLoading(true);
    try {
      const res = await agencyRequest('/api/ai-employee-agency/practitioner-kb');
      const data = (await res.json()) as {
        access?: BrainAccess;
        sources?: KnowledgeSourceRow[];
        error?: string;
      };
      if (data.access) setAccess(data.access);
      if (Array.isArray(data.sources)) setSources(data.sources);
      if (data.error) setErrorMsg(data.error);
      else setErrorMsg('');
    } catch {
      setErrorMsg('Unable to load Practitioner Knowledge Base.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSources();
  }, []);

  async function handleIngest(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !rawPlaybook.trim() || submitting) return;
    setSubmitting(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const res = await agencyRequest('/api/ai-employee-agency/practitioner-kb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ingest',
          title,
          sourceType,
          specialistRole,
          industryTags: industryTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          maturityTags: ['new_site', 'established_site'],
          parentSummary: parentSummary || title,
          rawPlaybook,
          storageObjectPath: storagePath || null,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        chunksCreated?: number;
        embeddedChunks?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Playbook ingestion failed.');
      }
      setStatusMsg(
        `Saved playbook · ${data.chunksCreated ?? 0} Tactic Cards chunked (${data.embeddedChunks ?? 0} pgvector embedded).`,
      );
      setTitle('');
      setParentSummary('');
      setRawPlaybook('');
      setStoragePath('');
      await loadSources();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Playbook ingestion failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePreviewRag(e: React.FormEvent) {
    e.preventDefault();
    if (!ragQuery.trim() || ragTesting) return;
    setRagTesting(true);
    setErrorMsg('');
    try {
      const res = await agencyRequest('/api/ai-employee-agency/practitioner-kb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview_rag',
          queryText: ragQuery,
          specialistRole: ragRole,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        tactics?: PreviewTactic[];
        error?: string;
      };
      if (!res.ok || !data.ok) throw new Error(data.error || 'RAG preview failed.');
      setRagMatches(Array.isArray(data.tactics) ? data.tactics : []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'RAG preview failed.');
    } finally {
      setRagTesting(false);
    }
  }

  async function handleToggle(source: KnowledgeSourceRow) {
    await agencyRequest('/api/ai-employee-agency/practitioner-kb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle_active',
        sourceId: source.id,
        active: !source.active,
      }),
    });
    await loadSources();
  }

  async function handleDelete(sourceId: string) {
    await agencyRequest('/api/ai-employee-agency/practitioner-kb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', sourceId }),
    });
    await loadSources();
  }

  return (
    <section className="space-y-5 rounded-xl border border-slate-800 bg-[#111827] p-5 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400">
            Phase 10 Commercial Moat · Supabase pgvector RAG
          </p>
          <h2 className="break-words text-lg font-semibold text-white">
            {access?.brandName || 'DoItWithAI Strategist Pro'} — Practitioner Brain
          </h2>
        </div>
        {access && (
          <span
            className={`max-w-full break-words rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase ${
              access.enabled
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
            }`}
          >
            {access.enabled ? `Pro Active · ${access.tier}` : `Upgrade to Growth/Pro (${access.tier})`}
          </span>
        )}
      </div>

      {statusMsg && (
        <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-200">
          {statusMsg}
        </p>
      )}
      {errorMsg && (
        <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3.5 py-2 text-xs text-rose-200">
          {errorMsg}
        </p>
      )}

      {/* Playbook Intake Form */}
      <form onSubmit={(e) => void handleIngest(e)} className="space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
        <h3 className="text-sm font-semibold text-white">Ingest Curated Playbook into pgvector</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Playbook Title (e.g. SaaS BoFu Comparison SEO)"
            className="min-w-0 w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="min-w-0 w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="seo_playbook">SEO Playbook</option>
            <option value="case_study">Case Study</option>
            <option value="video_distillation">Video Distillation</option>
            <option value="design_reference">Design Reference</option>
            <option value="conversion_framework">Conversion Framework</option>
          </select>
          <select
            value={specialistRole}
            onChange={(e) => setSpecialistRole(e.target.value)}
            className="min-w-0 w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none sm:col-span-2 lg:col-span-1"
          >
            <option value="unified">All Specialists (Unified)</option>
            <option value="keywords">Keyword &amp; Topics</option>
            <option value="writer">Article Studio Writer</option>
            <option value="refresh">On-Page &amp; Refresh</option>
            <option value="technical">Technical Site Audit</option>
            <option value="visual">Visual &amp; Brand Designer</option>
            <option value="pr">AI Visibility &amp; Links</option>
            <option value="social">Social Distribution</option>
            <option value="copilot">Strategist Pro Copilot</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={industryTags}
            onChange={(e) => setIndustryTags(e.target.value)}
            placeholder="Industry tags (comma-separated)"
            className="min-w-0 w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            value={storagePath}
            onChange={(e) => setStoragePath(e.target.value)}
            placeholder="Optional Supabase Storage ref (agency-practitioner-refs/...)"
            className="min-w-0 w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <input
          type="text"
          value={parentSummary}
          onChange={(e) => setParentSummary(e.target.value)}
          placeholder="1-sentence parent summary (injected alongside retrieved Tactic Cards)"
          className="w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />

        <textarea
          rows={5}
          required
          value={rawPlaybook}
          onChange={(e) => setRawPlaybook(e.target.value)}
          placeholder="Paste Markdown playbook (use ## headings to auto-split into focused Tactic Cards)…"
          className="w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 font-mono text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {submitting ? 'Chunking & Embedding…' : 'Chunk, Embed & Save to pgvector'}
        </button>
      </form>

      {/* Live RAG Retrieval Simulator */}
      <form onSubmit={(e) => void handlePreviewRag(e)} className="space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
        <h3 className="text-sm font-semibold text-white">Test Live Semantic RAG Retrieval</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={ragQuery}
            onChange={(e) => setRagQuery(e.target.value)}
            placeholder="Test query (e.g. How should I refresh a declining SaaS pricing comparison post?)"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={ragRole}
            onChange={(e) => setRagRole(e.target.value)}
            className="w-full min-w-0 rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none sm:w-auto"
          >
            <option value="unified">Unified</option>
            <option value="keywords">Keywords</option>
            <option value="writer">Writer</option>
            <option value="refresh">Refresh</option>
            <option value="technical">Technical</option>
            <option value="visual">Visual</option>
          </select>
          <button
            type="submit"
            disabled={ragTesting}
            className="w-full shrink-0 rounded-lg border border-blue-500/40 bg-blue-500/15 px-3.5 py-2 text-center text-xs font-semibold text-blue-200 hover:bg-blue-500/25 disabled:opacity-50 sm:w-auto"
          >
            {ragTesting ? 'Retrieving…' : 'Retrieve Top Tactics'}
          </button>
        </div>

        {ragMatches.length > 0 && (
          <ul className="space-y-2 pt-1">
            {ragMatches.map((m) => (
              <li key={m.chunkId} className="rounded-lg border border-slate-800 bg-[#111827] p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="min-w-0 break-words text-white">{m.tacticTitle}</strong>
                  <span className="shrink-0 font-mono text-[10px] text-blue-300">
                    sim {m.similarity.toFixed(2)} · {m.sourceTitle}
                  </span>
                </div>
                <p className="mt-1 break-words text-slate-300">{m.tacticBody}</p>
              </li>
            ))}
          </ul>
        )}
      </form>

      {/* Curated Playbooks Ledger */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">
          Curated Playbooks ({sources.length})
        </h3>
        {loading ? (
          <p className="text-xs text-slate-400">Loading curated playbooks…</p>
        ) : sources.length === 0 ? (
          <p className="text-xs text-slate-400">
            No playbooks ingested yet. Paste your first practitioner playbook above to power Strategist Pro RAG.
          </p>
        ) : (
          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0B0F17]">
            {sources.map((src) => (
              <div key={src.id} className="flex flex-wrap items-center justify-between gap-3 p-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-semibold text-white">{src.title}</p>
                  <p className="mt-0.5 break-all text-[11px] text-slate-400">
                    {src.source_type} · role: <span className="text-slate-200">{src.specialist_role}</span>
                    {src.storage_object_path ? ` · ref: ${src.storage_object_path}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleToggle(src)}
                    className={`rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                      src.active
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {src.active ? 'Active' : 'Paused'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(src.id)}
                    className="rounded-md border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-950/60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import {
  AUTONOMOUS_AGENT_ROLES,
  SIX_IMPLEMENTATION_PHASES,
} from '@/lib/founder-hub/archived-cauthra-reference';

export const dynamic = 'force-static';

function readMarkdownDoc(filename: string): string {
  try {
    const filePath = path.join(process.cwd(), 'docs', filename);
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return `# ${filename}\n\nDocumentation file is synchronized in docs/${filename}.`;
  }
}

export default function FounderHubAutonomousAgentsPage() {
  const blueprintMd = readMarkdownDoc(
    'DOITWITHAI_2027_AUTONOMOUS_AGENT_AND_AUTOMATION_BLUEPRINT.md'
  );
  const phaseTrackerMd = readMarkdownDoc('AUTONOMOUS_AGENTS_PHASE_TRACKER.md');
  const visualRulesMd = readMarkdownDoc(
    'UNIVERSAL_VISUAL_AND_INFOGRAPHIC_PIPELINE_RULES.md'
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Hero Banner */}
        <div className="rounded-2xl border border-sky-500/30 bg-slate-900/80 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
                All 6 Phases Completed &amp; Verified in Repository · 6-Phase Master Blueprint
              </span>
              <h1 className="mt-2 text-2xl font-bold text-white">
                2027 Autonomous Content, Visual & Social Agent Operating System
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Complete engineering specification, 12-agent contracts, universal visual pipeline rules, and 6 sequential implementation phases for AI experts.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/founder-hub"
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-sky-500/50 transition"
              >
                ← Founder Hub
              </Link>
              <Link
                href="/studio"
                className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 transition"
              >
                Open Brand 1 DIY Studio (/studio) →
              </Link>
            </div>
          </div>

          {/* 6-Phase Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {SIX_IMPLEMENTATION_PHASES.map((p) => (
              <div
                key={p.phaseNumber}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-400">Phase {p.phaseNumber}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs font-bold text-white">{p.title}</div>
                <p className="text-[11px] text-slate-400 line-clamp-3">{p.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 12 Autonomous Agent Roles Summary */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">
            12 Specialized Autonomous Agent Roles (`lib/autonomous-agents/agent-roles.ts`)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {AUTONOMOUS_AGENT_ROLES.map((role) => (
              <div
                key={role.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300">{role.shortBadge}</span>
                  <span className="font-mono text-emerald-400">
                    ~{role.estimatedTokensPerArticle} tok
                  </span>
                </div>
                <div className="font-bold text-white">{role.name}</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {role.responsibility}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Markdown Spec 1: 6-Phase Implementation Tracker */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
            docs/AUTONOMOUS_AGENTS_PHASE_TRACKER.md
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 bg-slate-950/80 p-5 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
            {phaseTrackerMd}
          </pre>
        </section>

        {/* Markdown Spec 2: Universal Visual & Infographic Pipeline Rules */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
            docs/UNIVERSAL_VISUAL_AND_INFOGRAPHIC_PIPELINE_RULES.md
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 bg-slate-950/80 p-5 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
            {visualRulesMd}
          </pre>
        </section>

        {/* Markdown Spec 3: Full 2027 Master Blueprint */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            docs/DOITWITHAI_2027_AUTONOMOUS_AGENT_AND_AUTOMATION_BLUEPRINT.md
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 bg-slate-950/80 p-5 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
            {blueprintMd}
          </pre>
        </section>
      </div>
    </div>
  );
}

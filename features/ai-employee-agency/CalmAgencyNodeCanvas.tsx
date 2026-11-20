'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { agentName, panelAgents } from '@/lib/ai-agency/panels';

interface AgencyNodeDef {
  id: string;
  label: string;
  viewName: string;
  cluster: 'command' | 'content' | 'seo' | 'distribution';
  x: number;
  y: number;
  roleTag: string;
}

const AGENCY_NODES: AgencyNodeDef[] = [
  // Center Command Hub
  { id: 'chief', label: 'Chief AI Officer', viewName: 'Overview', cluster: 'command', x: 460, y: 240, roleTag: 'Orchestrator' },
  { id: 'copilot', label: 'Workspace Copilot', viewName: 'Overview', cluster: 'command', x: 460, y: 112, roleTag: 'Founder Desk' },

  // Left Wing: Content & Creative (4 real specialists)
  { id: 'keywords', label: 'Keyword & Topics', viewName: 'Keyword & Topics', cluster: 'content', x: 165, y: 120, roleTag: 'Research' },
  { id: 'writer', label: 'Article Studio', viewName: 'Article Studio', cluster: 'content', x: 125, y: 215, roleTag: 'Long-Form' },
  { id: 'visual', label: 'Visual & Brand Studio', viewName: 'Visual & Brand Studio', cluster: 'content', x: 145, y: 315, roleTag: 'Graphics' },
  { id: 'qa', label: 'QA & Auto-Publish', viewName: 'QA & Auto-Publish', cluster: 'content', x: 255, y: 395, roleTag: 'Release Gate' },

  // Right Wing: SEO & Authority (3 real specialists)
  { id: 'technical', label: 'Technical Site Audit', viewName: 'Technical Site Audit', cluster: 'seo', x: 755, y: 120, roleTag: 'Crawl & CWV' },
  { id: 'refresh', label: 'On-Page & Refresh', viewName: 'On-Page & Refresh', cluster: 'seo', x: 795, y: 225, roleTag: 'Optimization' },
  { id: 'pr', label: 'AI Visibility & Links', viewName: 'AI Visibility & Links', cluster: 'seo', x: 745, y: 330, roleTag: 'Authority' },

  // Bottom Arc: Distribution Channels (4 real specialists)
  { id: 'pinterest', label: 'Pinterest', viewName: 'Pinterest', cluster: 'distribution', x: 375, y: 425, roleTag: 'Visual Pins' },
  { id: 'linkedin', label: 'LinkedIn', viewName: 'LinkedIn', cluster: 'distribution', x: 505, y: 435, roleTag: 'B2B Carousel' },
  { id: 'facebook', label: 'Facebook', viewName: 'Facebook', cluster: 'distribution', x: 635, y: 415, roleTag: 'Community' },
  { id: 'video', label: 'TikTok & Reels', viewName: 'TikTok & Reels', cluster: 'distribution', x: 655, y: 270, roleTag: 'Short Video' },
];

const CLUSTER_LABELS: Record<AgencyNodeDef['cluster'], string> = {
  command: 'Command Hub',
  content: 'Content & Creative',
  seo: 'SEO & Authority',
  distribution: 'Social Distribution',
};

export function CalmAgencyNodeCanvas({
  domain,
  approved,
  indexedPages,
  counts,
  activeProviders,
  onOpenPanel,
  onOpenChat,
}: {
  domain?: string;
  approved: boolean;
  indexedPages: number;
  counts?: { published: number; ready: number; queued: number };
  activeProviders: string[];
  onOpenPanel: (viewName: string) => void;
  onOpenChat: (agentId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>('chief');
  const [zoom, setZoom] = useState<number>(1);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [clusterFilter, setClusterFilter] = useState<'all' | AgencyNodeDef['cluster']>('all');

  const selectedNode = useMemo(
    () => AGENCY_NODES.find((n) => n.id === selectedId) ?? AGENCY_NODES[0],
    [selectedId],
  );

  const visibleNodes = useMemo(
    () =>
      clusterFilter === 'all'
        ? AGENCY_NODES
        : AGENCY_NODES.filter((n) => n.cluster === 'command' || n.cluster === clusterFilter),
    [clusterFilter],
  );

  const chiefNode = AGENCY_NODES[0];

  useEffect(() => {
    if (!fullScreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullScreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullScreen]);

  const shellClass = fullScreen
    ? 'fixed inset-0 z-[10000] !mt-0 flex flex-col overflow-hidden bg-[#0B0F17] p-4 sm:p-5 space-y-4'
    : 'space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-4 sm:p-5';

  return (
    <section aria-label="Interactive AI Agency Node Canvas" className={shellClass}>
      <style>{`
        @keyframes agencyBeamFlow {
          from { stroke-dashoffset: 28; }
          to { stroke-dashoffset: 0; }
        }
        .agency-beam-animated {
          stroke-dasharray: 6 8;
          animation: agencyBeamFlow 1.8s linear infinite;
        }
      `}</style>

      {/* Top Calm Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            Live Agency Architecture · 11 Specialists + Command Hub
          </p>
          <h2 className="text-base font-semibold text-white">
            {domain ? `${domain} · Interactive Specialist Graph` : 'Interactive Specialist Graph'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'content', 'seo', 'distribution'] as const).map((cluster) => (
            <button
              key={cluster}
              type="button"
              onClick={() => setClusterFilter(cluster)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                clusterFilter === cluster
                  ? 'bg-[#2563EB] text-white'
                  : 'border border-slate-800 bg-[#0B0F17] text-slate-400 hover:text-white'
              }`}
            >
              {cluster === 'all' ? 'All (13)' : CLUSTER_LABELS[cluster]}
            </button>
          ))}

          <div className="ml-1 flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0B0F17] p-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.1).toFixed(2))))}
              className="rounded px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.35, Number((z + 0.1).toFixed(2))))}
              className="rounded px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="rounded px-2 py-0.5 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Reset
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFullScreen((v) => !v)}
            className="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-1 text-xs font-semibold text-slate-200 hover:border-blue-500/60 hover:text-white"
          >
            {fullScreen ? 'Exit Full Screen' : 'Expand Full Screen'}
          </button>
        </div>
      </div>

      {/* Main Split: Animated SVG Node Graph + Right Inspector */}
      <div
        className={`grid gap-4 ${
          fullScreen
            ? 'min-h-0 flex-1 overflow-y-auto xl:grid-cols-[minmax(0,1fr)_320px] xl:overflow-hidden'
            : 'xl:grid-cols-[minmax(0,1fr)_300px]'
        }`}
      >
        <div className="relative min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-[#0B0F17]">
          <div
            className={
              fullScreen
                ? 'h-[360px] w-full overflow-auto xl:h-full'
                : 'h-[360px] w-full overflow-auto sm:h-[440px] lg:h-[480px]'
            }
          >
            <svg
              viewBox="0 0 920 500"
              className="h-auto min-h-full select-none transition-[width] duration-200"
              style={{
                width: `${Math.round(zoom * 100)}%`,
                minWidth: `${Math.round(700 * zoom)}px`,
              }}
              role="img"
              aria-label="11-Specialist AI Agency orchestration graph"
            >
              <defs>
                <pattern id="calmDotGrid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#1E293B" />
                </pattern>
              </defs>

              <rect width="920" height="500" fill="url(#calmDotGrid)" />

              {/* Subtle orbital rings around Chief AI Officer */}
              <circle cx={chiefNode.x} cy={chiefNode.y} r="135" fill="none" stroke="#1E293B" strokeDasharray="4 6" />
              <circle cx={chiefNode.x} cy={chiefNode.y} r="255" fill="none" stroke="#1E293B" strokeOpacity="0.65" />

              {/* Animated connection beams from Chief AI Officer to every visible node */}
              {visibleNodes
                .filter((n) => n.id !== 'chief')
                .map((node) => {
                  const isSelected = selectedId === node.id || selectedId === 'chief';
                  return (
                    <g key={`edge-${node.id}`}>
                      <line
                        x1={chiefNode.x}
                        y1={chiefNode.y}
                        x2={node.x}
                        y2={node.y}
                        stroke={isSelected ? '#2563EB' : '#1E293B'}
                        strokeWidth={isSelected ? 1.8 : 1.1}
                        strokeOpacity={isSelected ? 0.55 : 0.8}
                      />
                      <line
                        x1={chiefNode.x}
                        y1={chiefNode.y}
                        x2={node.x}
                        y2={node.y}
                        stroke={isSelected ? '#60A5FA' : '#334155'}
                        strokeWidth={isSelected ? 2 : 1.2}
                        className="agency-beam-animated"
                      />
                    </g>
                  );
                })}

              {/* Interactive Nodes */}
              {visibleNodes.map((node) => {
                const isCenter = node.id === 'chief';
                const isSelected = selectedId === node.id;
                const width = isCenter ? 156 : 144;
                const height = isCenter ? 56 : 48;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x - width / 2}, ${node.y - height / 2})`}
                    onClick={() => setSelectedId(node.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      width={width}
                      height={height}
                      rx={10}
                      fill={isCenter ? '#172554' : isSelected ? '#1E293B' : '#111827'}
                      stroke={isSelected ? '#2563EB' : isCenter ? '#3B82F6' : '#334155'}
                      strokeWidth={isSelected || isCenter ? 1.8 : 1}
                    />
                    <circle
                      cx={14}
                      cy={height / 2}
                      r={4}
                      fill={approved && activeProviders.length > 0 ? '#10B981' : '#64748B'}
                    />
                    <text
                      x={26}
                      y={height / 2 - 4}
                      fill="#F8FAFC"
                      fontSize={isCenter ? 12 : 11}
                      fontWeight={700}
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                    >
                      {node.label.length > 18 ? `${node.label.slice(0, 17)}…` : node.label}
                    </text>
                    <text
                      x={26}
                      y={height / 2 + 12}
                      fill="#94A3B8"
                      fontSize={9.5}
                      fontFamily="ui-monospace, SFMono-Regular, monospace"
                    >
                      {node.roleTag}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Inspector */}
        <aside className="flex min-h-0 min-w-0 flex-col justify-between overflow-y-auto rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md border border-slate-800 bg-[#111827] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-blue-400">
                {CLUSTER_LABELS[selectedNode.cluster]}
              </span>
              <span className="text-[11px] text-slate-400">
                {approved ? 'Workspace Ready' : 'Awaiting Approval'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">{agentName(selectedNode.id)}</h3>
              <p className="mt-1 text-xs text-slate-400">
                Role: <span className="text-slate-200">{selectedNode.roleTag}</span> · Panel:{' '}
                <span className="text-slate-200">{selectedNode.viewName}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-lg border border-slate-800 bg-[#111827] p-2.5">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">Indexed URLs</span>
                <strong className="mt-0.5 block font-mono text-sm text-white">{indexedPages}</strong>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#111827] p-2.5">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">Live Queue</span>
                <strong className="mt-0.5 block font-mono text-sm text-white">
                  {(counts?.queued ?? 0) + (counts?.ready ?? 0)}
                </strong>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              {activeProviders.length > 0
                ? `Connected to ${activeProviders.join(', ')}. All specialist actions run through your metered workspace ledger.`
                : 'Configure at least one LLM provider key to execute live specialist tasks.'}
            </p>
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => onOpenChat(selectedNode.id)}
              className="w-full rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              Open Chat with {agentName(selectedNode.id)}
            </button>
            {selectedNode.id !== 'copilot' && selectedNode.id !== 'chief' && (
              <button
                type="button"
                onClick={() => onOpenPanel(selectedNode.viewName)}
                className="w-full rounded-lg border border-slate-700 bg-[#111827] px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-blue-500/60 hover:text-white"
              >
                Open {selectedNode.viewName} Workbench →
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Compact Quick-Jump Specialist Strip */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {Object.entries(panelAgents)
          .filter(([, id]) => id !== 'chief')
          .map(([name, id]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedId(id)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                selectedId === id
                  ? 'border border-blue-500/60 bg-blue-500/15 text-blue-200'
                  : 'border border-slate-800 bg-[#0B0F17] text-slate-400 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
      </div>
    </section>
  );
}

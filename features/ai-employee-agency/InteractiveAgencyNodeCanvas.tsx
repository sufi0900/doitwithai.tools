'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  AGENCY_DEPARTMENT_REGISTRY,
  type AgencySidebarTabId,
  type InteractiveOfficeNode,
} from '@/lib/ai-employee-agency/agent-registry';
import type { AgencyHandoffPacket } from '@/lib/ai-employee-agency/handoff-orchestrator';

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V2 PHASE 3)
 * Component: `features/ai-employee-agency/InteractiveAgencyNodeCanvas.tsx`
 *
 * Full-Canvas Interactive Pan/Zoom Node Graph (Zero Clutter):
 * - Covers 100% of the right-side workspace when toggled.
 * - Supports 2 topology modes:
 *   1. `core-12`: 12 Core Agency Desks (Executive + Department Managers + Key Squads)
 *   2. `expanded-36`: Full 36-Node Hierarchy (All 9 Leads + All 27 Sub-Agents)
 * - Supports Drag-to-Pan, Zoom In (+), Zoom Out (-), Fit View (⊡), Step Handoff,
 *   Hover Tooltips, and Click-to-Open Floating Agent Inspector Card with
 *   1-click Department Dashboard Redirect & 1-on-1 Agent Chat/Voice Call.
 * ============================================================================
 */

interface InteractiveAgencyNodeCanvasProps {
  coreNodes: InteractiveOfficeNode[];
  activeHandoffStage: number;
  activePacket: AgencyHandoffPacket;
  onStepNextStage: () => void;
  onSelectDepartmentTab: (tabId: AgencySidebarTabId) => void;
  onStartAgentChat: (agentId: string) => void;
}

export default function InteractiveAgencyNodeCanvas({
  coreNodes,
  activeHandoffStage,
  activePacket,
  onStepNextStage,
  onSelectDepartmentTab,
  onStartAgentChat,
}: InteractiveAgencyNodeCanvasProps) {
  const [topologyMode, setTopologyMode] = useState<'core-12' | 'expanded-36'>('core-12');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [clickedNodeId, setClickedNodeId] = useState<string | null>(null);

  // Build the Full 36-Node Expanded Hierarchy from `AGENCY_DEPARTMENT_REGISTRY`
  const expandedNodes: InteractiveOfficeNode[] = useMemo(() => {
    const list: InteractiveOfficeNode[] = [];
    const colWidth = 250;
    const startX = 150;

    AGENCY_DEPARTMENT_REGISTRY.forEach((dept, dIdx) => {
      const colX = startX + dIdx * colWidth;
      const managerY = dIdx === 0 ? 75 : 195;

      list.push({
        id: dept.id,
        name: dept.name,
        roleTitle: dept.roleTitle,
        tier: dept.tier,
        departmentTab: dept.departmentTab,
        departmentBadge: dept.departmentBadge,
        accentHex: dept.accentHex,
        x: colX,
        y: managerY,
        parentNodeId: dIdx === 0 ? undefined : 'agent-chief-orchestrator',
        handoffStageOrder: dept.handoffStageOrder,
        liveActionText: dept.defaultActionStatus,
        equippedSkills: dept.equippedSkills,
        equippedTools: dept.equippedTools,
        sampleOutput: `${dept.name} (${dept.departmentBadge})\nSub-Agents Managed: ${dept.subAgents
          .map((s) => s.name)
          .join(', ')}`,
      });

      dept.subAgents.forEach((sub, sIdx) => {
        list.push({
          id: sub.id,
          name: sub.name,
          roleTitle: sub.roleTitle,
          tier: 'sub-agent',
          departmentTab: sub.departmentTab,
          departmentBadge: sub.departmentBadge,
          accentHex: sub.accentHex,
          x: colX,
          y: managerY + 115 + sIdx * 102,
          parentNodeId: dept.id,
          handoffStageOrder: sub.handoffStageOrder,
          liveActionText: sub.defaultActionStatus,
          equippedSkills: sub.equippedSkills,
          equippedTools: sub.equippedTools,
          sampleOutput: sub.sampleDeliverablePreview,
        });
      });
    });

    return list;
  }, []);

  const activeNodes = topologyMode === 'core-12' ? coreNodes : expandedNodes;
  const svgViewBox =
    topologyMode === 'core-12' ? '0 0 1140 590' : '0 0 2320 760';

  const hoveredNode = useMemo(
    () => activeNodes.find((n) => n.id === hoveredNodeId) || null,
    [activeNodes, hoveredNodeId]
  );

  const clickedNode = useMemo(
    () => activeNodes.find((n) => n.id === clickedNodeId) || null,
    [activeNodes, clickedNodeId]
  );

  return (
    <div className="relative flex-1 min-h-[700px] w-full bg-[#050914] overflow-hidden select-none">
      {/* Top-Left Floating Canvas Toolbar (Topology Switch, Zoom In/Out, Fit, Step Handoff) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur px-3.5 py-2 shadow-xl text-xs">
        <span className="font-extrabold text-sky-300 mr-1">
          🌐 Digital Agency Office Canvas
        </span>

        {/* 12 Core Desks vs All 36 Managers + Sub-Agents Toggle */}
        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900 p-0.5">
          <button
            type="button"
            onClick={() => {
              setTopologyMode('core-12');
              setZoomScale(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
              topologyMode === 'core-12'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            12 Core Desks
          </button>
          <button
            type="button"
            onClick={() => {
              setTopologyMode('expanded-36');
              setZoomScale(0.95);
              setPanOffset({ x: 0, y: 0 });
            }}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
              topologyMode === 'expanded-36'
                ? 'bg-emerald-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All 36 Managers + Sub-Agents
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            setZoomScale((z) => Math.min(1.75, Number((z + 0.15).toFixed(2))))
          }
          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 font-bold text-white"
          title="Zoom In"
        >
          ＋ Zoom In
        </button>
        <button
          type="button"
          onClick={() =>
            setZoomScale((z) => Math.max(0.55, Number((z - 0.15).toFixed(2))))
          }
          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 font-bold text-white"
          title="Zoom Out"
        >
          － Zoom Out
        </button>
        <button
          type="button"
          onClick={() => {
            setZoomScale(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 font-bold text-slate-300"
        >
          ⊡ Fit View ({Math.round(zoomScale * 100)}%)
        </button>
        <button
          type="button"
          onClick={onStepNextStage}
          className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 px-2.5 py-1 font-extrabold text-emerald-300"
        >
          ⏭ Step Next Handoff ({activeHandoffStage}/6)
        </button>
      </div>

      {/* Top-Right Active Handoff Packet Pill */}
      <div className="absolute top-4 right-4 z-20 hidden xl:flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur px-3.5 py-2 text-[11px]">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-bold text-emerald-300">
          {activePacket.fromAgentName} → {activePacket.toAgentName}
        </span>
        <span className="text-slate-400">· Drag to pan · Click any node</span>
      </div>

      {/* Interactive Drag & Zoom SVG Viewport */}
      <div
        onMouseDown={(e) => {
          setIsDraggingCanvas(true);
          dragStartRef.current = {
            x: e.clientX - panOffset.x,
            y: e.clientY - panOffset.y,
          };
        }}
        onMouseMove={(e) => {
          if (!isDraggingCanvas) return;
          setPanOffset({
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y,
          });
        }}
        onMouseUp={() => setIsDraggingCanvas(false)}
        onMouseLeave={() => setIsDraggingCanvas(false)}
        className={`w-full h-full min-h-[700px] flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] ${
          isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg
          viewBox={svgViewBox}
          className="w-full h-full max-w-[1520px] transition-transform duration-150"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <linearGradient id="activeEdgeGradV2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Connected Handoff Edges + Animated Glowing Packets */}
          {activeNodes.map((node) => {
            if (!node.parentNodeId) return null;
            const parent = activeNodes.find((n) => n.id === node.parentNodeId);
            if (!parent) return null;

            const x1 = parent.x;
            const y1 = parent.y + 38;
            const x2 = node.x;
            const y2 = node.y - 38;
            const midY = (y1 + y2) / 2;
            const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
            const isStageActive =
              node.handoffStageOrder === activeHandoffStage ||
              clickedNodeId === node.id ||
              hoveredNodeId === node.id;

            return (
              <g key={`edge-${parent.id}-${node.id}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isStageActive ? 'url(#activeEdgeGradV2)' : '#1E293B'}
                  strokeWidth={isStageActive ? 3.2 : 2}
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke={node.accentHex}
                  strokeWidth={2.2}
                  strokeDasharray="7 10"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="34"
                    to="0"
                    dur={isStageActive ? '0.9s' : '2.4s'}
                    repeatCount="indefinite"
                  />
                </path>
                <circle
                  r={isStageActive ? 5 : 3.2}
                  fill={isStageActive ? '#38BDF8' : node.accentHex}
                >
                  <animateMotion
                    dur={isStageActive ? '1.5s' : '3.2s'}
                    repeatCount="indefinite"
                    path={pathD}
                  />
                </circle>
              </g>
            );
          })}

          {/* Render All Interactive Agency Nodes */}
          {activeNodes.map((node) => {
            const isHovered = hoveredNodeId === node.id;
            const isClicked = clickedNodeId === node.id;
            const isWorkingNow = node.handoffStageOrder === activeHandoffStage;
            const boxW = 232;
            const boxH = 76;
            const rx = node.x - boxW / 2;
            const ry = node.y - boxH / 2;

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setClickedNodeId(node.id);
                }}
                className="cursor-pointer"
              >
                {(isWorkingNow || isHovered || isClicked) && (
                  <rect
                    x={rx - 6}
                    y={ry - 6}
                    width={boxW + 12}
                    height={boxH + 12}
                    rx={18}
                    fill="none"
                    stroke={node.accentHex}
                    strokeWidth={isClicked ? 2.8 : 1.8}
                    strokeOpacity={0.85}
                  >
                    {isWorkingNow && (
                      <animate
                        attributeName="stroke-opacity"
                        values="0.95;0.25;0.95"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    )}
                  </rect>
                )}

                <rect
                  x={rx}
                  y={ry}
                  width={boxW}
                  height={boxH}
                  rx={14}
                  fill={isClicked || isHovered ? '#13203B' : '#0B1325'}
                  stroke={
                    isClicked || isHovered || isWorkingNow
                      ? node.accentHex
                      : '#334155'
                  }
                  strokeWidth={isClicked || isWorkingNow ? 2.4 : 1.4}
                />

                {/* Status Indicator Dot */}
                <circle
                  cx={rx + 16}
                  cy={ry + 19}
                  r={5}
                  fill={isWorkingNow ? '#38BDF8' : '#10B981'}
                />

                {/* Department & Tier Badge */}
                <text
                  x={rx + 28}
                  y={ry + 22}
                  fill={node.accentHex}
                  fontSize="9.5"
                  fontWeight="800"
                  fontFamily="system-ui, sans-serif"
                >
                  {node.departmentBadge.toUpperCase()} ·{' '}
                  {isWorkingNow ? '⚡ WORKING' : '✓ ACTIVE'}
                </text>

                {/* Agent Name */}
                <text
                  x={rx + 14}
                  y={ry + 43}
                  fill="#FFFFFF"
                  fontSize="11.2"
                  fontWeight="800"
                  fontFamily="system-ui, sans-serif"
                >
                  {node.name.slice(0, 30)}
                </text>

                {/* Live Action Sub-Ticker */}
                <text
                  x={rx + 14}
                  y={ry + 60}
                  fill="#94A3B8"
                  fontSize="9.3"
                  fontFamily="system-ui, sans-serif"
                >
                  {node.liveActionText.slice(0, 34)}...
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Tooltip (When hovering a node without clicking) */}
      {hoveredNode && !clickedNode && (
        <div className="pointer-events-none absolute bottom-6 left-6 z-20 max-w-md rounded-2xl border border-sky-400/50 bg-slate-950/95 p-4 shadow-2xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span
              className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${hoveredNode.accentHex}22`,
                color: hoveredNode.accentHex,
              }}
            >
              {hoveredNode.departmentBadge}
            </span>
            <span className="text-[11px] text-emerald-300 font-bold">
              Click node for full card &amp; redirect →
            </span>
          </div>
          <div className="font-extrabold text-white text-sm">{hoveredNode.name}</div>
          <div className="text-slate-300">{hoveredNode.liveActionText}</div>
          <div className="text-[11px] text-sky-300">
            Skills: {hoveredNode.equippedSkills.join(' · ')}
          </div>
        </div>
      )}

      {/* Floating Clicked Node Action Card (Click -> Inspect + Chat + Redirect to Department Dashboard) */}
      {clickedNode && (
        <div className="absolute top-16 right-6 z-30 w-full max-w-sm rounded-3xl border border-sky-400/60 bg-[#0B1325]/95 backdrop-blur-xl p-5 shadow-2xl space-y-4 text-xs">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span
                className="rounded px-2 py-0.5 text-[10px] font-extrabold uppercase"
                style={{
                  backgroundColor: `${clickedNode.accentHex}22`,
                  color: clickedNode.accentHex,
                }}
              >
                {clickedNode.departmentBadge}
              </span>
              <h3 className="text-base font-extrabold text-white mt-1">
                {clickedNode.name}
              </h3>
              <p className="text-[11px] text-slate-400">{clickedNode.roleTitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setClickedNodeId(null)}
              className="rounded-lg bg-slate-800 px-2 py-1 text-slate-300 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-emerald-300">
              Live Status &amp; Handoff Activity:
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-200">
              {clickedNode.liveActionText}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-sky-300">
              Equipped Skills &amp; Backend Tools:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...clickedNode.equippedSkills, ...clickedNode.equippedTools].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-300"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-300">
              Latest Handoff Packet / Output Preview:
            </div>
            <pre className="max-h-[130px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-[10.5px] text-slate-200 font-mono">
              {clickedNode.sampleOutput}
            </pre>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSelectDepartmentTab(clickedNode.departmentTab)}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:brightness-110 py-2.5 px-4 text-xs font-extrabold text-slate-950 shadow-lg transition"
            >
              Open {clickedNode.departmentBadge} Dashboard →
            </button>
            <button
              type="button"
              onClick={() => onStartAgentChat(clickedNode.id)}
              className="w-full rounded-xl border border-purple-400/50 bg-purple-500/15 hover:bg-purple-500/25 py-2 px-4 text-xs font-extrabold text-purple-200 transition"
            >
              💬 Chat / Voice Call 1-on-1 with {clickedNode.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

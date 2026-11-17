'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AGENCY_DEPARTMENT_REGISTRY,
  SIDEBAR_DEPARTMENTS_FROM_REGISTRY,
  type AgencySidebarTabId,
  type InteractiveOfficeNode,
} from '@/lib/ai-employee-agency/agent-registry';
import type { AgencyHandoffPacket } from '@/lib/ai-employee-agency/handoff-orchestrator';
import { AgencyUiIcon } from './AgencySvgIcons';

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V3 PHASE 6 REDESIGN)
 * Component: `features/ai-employee-agency/InteractiveAgencyNodeCanvas.tsx`
 *
 * Full-Canvas & 100% Full-Screen (`fixed inset-0 z-[100]`) Interactive Node Graph:
 * - Eliminates the top header overlap seen in `image_1c1203.png` by using a
 *   clean, single-row non-overlapping top header bar and moving Zoom In (+),
 *   Zoom Out (-), Fit View (100%), and Full-Screen Expand into a dedicated
 *   Figma / n8n-style Bottom-Right Floating Control Dock.
 * - Includes 1-Click `Expand Full Screen` (`100vw × 100vh`) toggle so the
 *   Digital Agency Node Graph occupies the entire monitor (`Esc` or button to exit).
 * ============================================================================
 */

interface InteractiveAgencyNodeCanvasProps {
  coreNodes: InteractiveOfficeNode[];
  activeHandoffStage: number;
  activePacket: AgencyHandoffPacket;
  isFullScreenViewport?: boolean;
  onToggleFullScreenViewport?: () => void;
  onStepNextStage: () => void;
  onSelectDepartmentTab: (tabId: AgencySidebarTabId) => void;
  onStartAgentChat: (agentId: string) => void;
}

export default function InteractiveAgencyNodeCanvas({
  coreNodes,
  activeHandoffStage,
  activePacket,
  isFullScreenViewport = false,
  onToggleFullScreenViewport,
  onStepNextStage,
  onSelectDepartmentTab,
  onStartAgentChat,
}: InteractiveAgencyNodeCanvasProps) {
  const [internalFullScreen, setInternalFullScreen] = useState<boolean>(false);
  const isFullScreen = isFullScreenViewport || internalFullScreen;

  const handleToggleFullScreen = () => {
    if (onToggleFullScreenViewport) {
      onToggleFullScreenViewport();
    } else {
      setInternalFullScreen((prev) => !prev);
    }
  };

  // Allow pressing Escape key to exit 100% Full-Screen mode
  useEffect(() => {
    if (!isFullScreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onToggleFullScreenViewport && isFullScreenViewport) {
          onToggleFullScreenViewport();
        }
        setInternalFullScreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullScreen, isFullScreenViewport, onToggleFullScreenViewport]);

  const [topologyMode, setTopologyMode] = useState<'core-12' | 'expanded-36'>('core-12');
  const [departmentFilter, setDepartmentFilter] = useState<AgencySidebarTabId | 'all'>(
    'all'
  );
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
    topologyMode === 'core-12' ? '0 0 1140 590' : '0 0 2340 840';

  const hoveredNode = useMemo(
    () => activeNodes.find((n) => n.id === hoveredNodeId) || null,
    [activeNodes, hoveredNodeId]
  );

  const clickedNode = useMemo(
    () => activeNodes.find((n) => n.id === clickedNodeId) || null,
    [activeNodes, clickedNodeId]
  );

  return (
    <div
      className={
        isFullScreen
          ? 'fixed inset-0 z-[100] w-screen h-screen bg-[#050914] flex flex-col overflow-hidden select-none'
          : 'relative flex-1 min-h-[680px] w-full bg-[#050914] flex flex-col overflow-hidden select-none'
      }
    >
      {/* =====================================================================
          NON-OVERLAPPING TOP GRAPH CONTROL BAR (Single Flex Row — Zero Collision)
         ===================================================================== */}
      <div className="z-20 border-b border-slate-800/90 bg-[#080F1E]/95 backdrop-blur px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Canvas Title, 12 vs 36 Toggle & Department Spotlight Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 font-extrabold text-sky-300">
            <AgencyUiIcon name="node-graph" className="w-4 h-4 text-sky-400" />
            <span>Digital Agency Office Canvas</span>
          </div>

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
              All 36 Agents
            </button>
          </div>

          <select
            value={departmentFilter}
            onChange={(e) =>
              setDepartmentFilter(e.target.value as AgencySidebarTabId | 'all')
            }
            className="rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200 focus:border-sky-400 focus:outline-none"
            aria-label="Filter node graph by department"
          >
            <option value="all">All 9 Departments</option>
            {SIDEBAR_DEPARTMENTS_FROM_REGISTRY.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Active Handoff Pill + Step Handoff + 100% Full-Screen Expand Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden xl:inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1 text-[11px]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-emerald-300">
              {activePacket.fromAgentName} → {activePacket.toAgentName}
            </span>
          </div>

          <button
            type="button"
            onClick={onStepNextStage}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 px-3 py-1.5 text-[11px] font-extrabold text-emerald-300 transition"
          >
            <AgencyUiIcon name="step-forward" className="w-3.5 h-3.5" />
            <span>Step Handoff ({activeHandoffStage}/6)</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFullScreen}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[11px] font-extrabold transition shadow ${
              isFullScreen
                ? 'bg-rose-500 text-white hover:bg-rose-400'
                : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
            }`}
            title={
              isFullScreen
                ? 'Exit Full Screen (Esc)'
                : 'Expand Node Graph to 100% Full Screen'
            }
          >
            <AgencyUiIcon
              name={isFullScreen ? 'exit-fullscreen' : 'expand-fullscreen'}
              className="w-3.5 h-3.5"
            />
            <span>
              {isFullScreen ? 'Exit Full Screen (Esc)' : 'Expand Full Screen'}
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          INTERACTIVE DRAG-TO-PAN & WHEEL-ZOOM SVG VIEWPORT
         ===================================================================== */}
      <div
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > 0) {
            const delta = e.deltaY < 0 ? 0.08 : -0.08;
            setZoomScale((z) =>
              Math.min(1.85, Math.max(0.5, Number((z + delta).toFixed(2))))
            );
          }
        }}
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
        className={`relative flex-1 w-full h-full flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] ${
          isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg
          viewBox={svgViewBox}
          className="w-full h-full max-w-[1600px] transition-transform duration-150"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <linearGradient id="activeEdgeGradV3" x1="0%" y1="0%" x2="100%" y2="0%">
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

            const isFilteredOut =
              departmentFilter !== 'all' &&
              node.departmentTab !== departmentFilter &&
              parent.departmentTab !== departmentFilter;

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
              <g
                key={`edge-${parent.id}-${node.id}`}
                opacity={isFilteredOut ? 0.18 : 1}
              >
                <path
                  d={pathD}
                  fill="none"
                  stroke={isStageActive ? 'url(#activeEdgeGradV3)' : '#1E293B'}
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

          {/* Render All Interactive Agency Nodes (Clean Vector Status Pills — Zero Emojis) */}
          {activeNodes.map((node) => {
            const isHovered = hoveredNodeId === node.id;
            const isClicked = clickedNodeId === node.id;
            const isWorkingNow = node.handoffStageOrder === activeHandoffStage;
            const isDimmed =
              departmentFilter !== 'all' &&
              node.departmentTab !== departmentFilter &&
              node.id !== 'agent-chief-orchestrator';

            const boxW = 232;
            const boxH = 76;
            const rx = node.x - boxW / 2;
            const ry = node.y - boxH / 2;

            return (
              <g
                key={node.id}
                opacity={isDimmed ? 0.25 : 1}
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
                  r={4.5}
                  fill={isWorkingNow ? '#38BDF8' : '#10B981'}
                />

                {/* Department & Tier Badge */}
                <text
                  x={rx + 27}
                  y={ry + 22}
                  fill={node.accentHex}
                  fontSize="9.2"
                  fontWeight="800"
                  fontFamily="system-ui, sans-serif"
                >
                  {node.departmentBadge.toUpperCase()} ·{' '}
                  {isWorkingNow ? 'WORKING' : 'ONLINE'}
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

        {/* ===================================================================
            BOTTOM-RIGHT FLOATING ZOOM & FULL-SCREEN DOCK (Figma / n8n Style)
           =================================================================== */}
        <div className="absolute bottom-5 right-5 z-30 flex items-center gap-1.5 rounded-2xl border border-slate-700/90 bg-[#0A1224]/95 backdrop-blur px-3 py-2 shadow-2xl text-xs">
          <button
            type="button"
            onClick={() =>
              setZoomScale((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))
            }
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 font-bold text-slate-200 transition"
            title="Zoom Out"
          >
            <AgencyUiIcon name="zoom-out" className="w-3.5 h-3.5 text-sky-400" />
            <span>Zoom Out</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setZoomScale(1);
              setPanOffset({ x: 0, y: 0 });
              setDepartmentFilter('all');
            }}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 font-mono font-bold text-slate-200 transition"
            title="Reset Zoom & Pan"
          >
            <AgencyUiIcon name="fit-view" className="w-3.5 h-3.5 text-emerald-400" />
            <span>{Math.round(zoomScale * 100)}%</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setZoomScale((z) => Math.min(1.85, Number((z + 0.15).toFixed(2))))
            }
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 font-bold text-slate-200 transition"
            title="Zoom In"
          >
            <AgencyUiIcon name="zoom-in" className="w-3.5 h-3.5 text-sky-400" />
            <span>Zoom In</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFullScreen}
            className="inline-flex items-center gap-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 px-2.5 py-1.5 font-extrabold text-sky-200 transition"
            title={isFullScreen ? 'Exit Full Screen' : 'Expand Full Screen'}
          >
            <AgencyUiIcon
              name={isFullScreen ? 'exit-fullscreen' : 'expand-fullscreen'}
              className="w-3.5 h-3.5"
            />
            <span>{isFullScreen ? 'Exit' : 'Full Screen'}</span>
          </button>
        </div>

        {/* Floating Hover Tooltip (Bottom-Left) */}
        {hoveredNode && !clickedNode && (
          <div className="pointer-events-none absolute bottom-5 left-5 z-20 max-w-md rounded-2xl border border-sky-400/50 bg-slate-950/95 p-4 shadow-2xl space-y-1.5 text-xs">
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
                Click node to inspect or open department →
              </span>
            </div>
            <div className="font-extrabold text-white text-sm">
              {hoveredNode.name}
            </div>
            <div className="text-slate-300">{hoveredNode.liveActionText}</div>
            <div className="text-[11px] text-sky-300">
              Skills: {hoveredNode.equippedSkills.join(' · ')}
            </div>
          </div>
        )}

        {/* Floating Clicked Node Inspector Card */}
        {clickedNode && (
          <div className="absolute top-5 right-5 z-30 w-full max-w-sm rounded-3xl border border-sky-400/60 bg-[#0B1325]/95 backdrop-blur-xl p-5 shadow-2xl space-y-4 text-xs">
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
                onClick={() => {
                  if (isFullScreen && onToggleFullScreenViewport) {
                    onToggleFullScreenViewport();
                  }
                  setInternalFullScreen(false);
                  onSelectDepartmentTab(clickedNode.departmentTab);
                }}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:brightness-110 py-2.5 px-4 text-xs font-extrabold text-slate-950 shadow-lg transition"
              >
                Open {clickedNode.departmentBadge} Workspace →
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isFullScreen && onToggleFullScreenViewport) {
                    onToggleFullScreenViewport();
                  }
                  setInternalFullScreen(false);
                  onStartAgentChat(clickedNode.id);
                }}
                className="w-full rounded-xl border border-purple-400/50 bg-purple-500/15 hover:bg-purple-500/25 py-2 px-4 text-xs font-extrabold text-purple-200 transition"
              >
                Chat / Voice Call 1-on-1 with {clickedNode.name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

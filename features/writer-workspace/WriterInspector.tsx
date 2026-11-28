"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlignLeft, Gauge, Link2, ListTree, PanelRightClose, Sparkles } from "lucide-react";
import { projectDocument, textOf } from "./model";
import type { Project, RichNode } from "./types";
import styles from "./workspace.module.css";

const tabs = [
  { id: "score", label: "Score", icon: Gauge },
  { id: "readability", label: "Readability", icon: AlignLeft },
  { id: "seo", label: "SEO & Links", icon: Link2 },
  { id: "outline", label: "Outline", icon: ListTree },
  { id: "ai", label: "Article AI", icon: Sparkles },
] as const;

export type InspectorTab = typeof tabs[number]["id"];

export function documentHeadings(project: Project) {
  const headings: { text: string; level: number }[] = [];
  const visit = (node: RichNode) => {
    if (node.type === "heading") headings.push({ text: textOf(node), level: Number(node.attrs?.level) || 2 });
    node.content?.forEach(visit);
  };
  visit(projectDocument(project));
  return headings;
}

export function WriterOutline({ project, onJump, children }: {
  project: Project;
  onJump: (index: number) => void;
  children: ReactNode;
}) {
  const [active, setActive] = useState(-1);
  const outline = useRef<HTMLElement>(null);
  const headings = documentHeadings(project);
  useEffect(() => {
    const scroll = outline.current?.closest("[data-studio-scroll]");
    if (!scroll) return;
    let frame = 0;
    const track = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nodes = Array.from(scroll.querySelectorAll("[data-writer-canvas] .tiptap :is(h1,h2,h3,h4,h5,h6)"));
        const threshold = scroll.getBoundingClientRect().top + 120;
        const index = nodes.findLastIndex((node) => node.getBoundingClientRect().top <= threshold);
        setActive(nodes.length ? Math.max(0, index) : -1);
      });
    };
    track();
    scroll.addEventListener("scroll", track, { passive: true });
    return () => {
      scroll.removeEventListener("scroll", track);
      cancelAnimationFrame(frame);
    };
  }, [project]);

  return (
    <>
      <nav ref={outline} className={styles.outlineList} aria-label="Document headings">
        {headings.map(({ text, level }, index) => text.trim() && (
          <button key={index} type="button" aria-current={active === index ? "location" : undefined}
            style={{ paddingInlineStart: 8 + (level - 1) * 10 }} onClick={() => onJump(index)}>
            <small>H{level}</small><span>{text}</span>
          </button>
        ))}
        {!headings.some((heading) => heading.text.trim()) && <p>Add a heading in the editor to start your outline.</p>}
      </nav>
      {children}
    </>
  );
}

export default function WriterInspector({ tab, open, expanded, onTab, onClose, children, assistant }: {
  tab: InspectorTab;
  open: boolean;
  expanded: boolean;
  onTab: (tab: InspectorTab) => void;
  onClose: () => void;
  children: ReactNode;
  assistant: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef(0);
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    const media = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      node.close();
      if (!open) return;
      if (media.matches) node.showModal();
      else node.show();
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [open]);

  return (
    <dialog id="writer-inspector" ref={dialog} aria-label="Editorial inspector" className={styles.writerInspector}
      data-expanded={expanded || undefined}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target === event.currentTarget && event.currentTarget.matches(":modal")) onClose();
      }}>
      <header className={styles.inspectorHeader} onTouchStart={(event) => { touchStart.current = event.touches[0].clientY; }}
        onTouchEnd={(event) => {
          if (matchMedia("(max-width: 767px)").matches && event.changedTouches[0].clientY - touchStart.current > 55) onClose();
        }}>
        <div className={styles.sheetHandle} aria-hidden="true" />
        <div className={styles.inspectorTabs} role="tablist" aria-label="Inspector tabs" onKeyDown={(event) => {
          const index = tabs.findIndex((item) => item.id === tab);
          const next = event.key === "ArrowRight" ? (index + 1) % tabs.length
            : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length
            : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
          if (next < 0) return;
          event.preventDefault();
          onTab(tabs[next].id);
          document.getElementById(`writer-inspector-${tabs[next].id}`)?.focus();
        }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" role="tab" id={`writer-inspector-${id}`} aria-selected={id === tab}
              aria-controls={`writer-inspector-content-${id}`} tabIndex={id === tab ? 0 : -1} onClick={() => onTab(id)}>
              <Icon size={15} aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </div>
        <button className={styles.inspectorClose} type="button" aria-label="Close inspector" title="Close inspector" onClick={onClose}>
          <PanelRightClose size={17} />
        </button>
      </header>
      {tab !== "ai" && (
        <div className={styles.inspectorBody} role="tabpanel" id={`writer-inspector-content-${tab}`}
          aria-labelledby={`writer-inspector-${tab}`} tabIndex={0}>{children}</div>
      )}
      <div className={styles.inspectorChat} hidden={tab !== "ai"} role="tabpanel" id="writer-inspector-content-ai" aria-labelledby="writer-inspector-ai">
        {assistant}
      </div>
    </dialog>
  );
}

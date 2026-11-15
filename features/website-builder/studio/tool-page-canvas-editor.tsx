"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { SiteDocument } from "../domain/site-document";
import type { SiteCommand } from "../domain/commands";

// All edits use the same project.update command as ManualControls.
export function ToolPageCanvasEditor({ tool, execute, children }: {
  tool: SiteDocument["content"]["projects"][number];
  execute: (command: SiteCommand) => void;
  children: ReactNode;
}) {
  const [selecting, setSelecting] = useState(false);
  const [field, setField] = useState<"title" | "summary">("title");
  const [draft, setDraft] = useState(tool.title);
  useEffect(() => { setDraft(tool[field]); }, [tool.id, tool.title, tool.summary, field]);
  return <div className="tool-canvas-editor">
    <div className="tool-canvas-controls">
      <button type="button" aria-pressed={selecting} onClick={() => setSelecting(!selecting)}>{selecting ? "Finish selecting" : "Select page text"}</button>
      {selecting && <form onSubmit={event => { event.preventDefault(); execute({ type: "project.update", itemId: tool.id, field, value: draft }); }}>
        <label>Page field<select value={field} onChange={event => setField(event.target.value as "title" | "summary")}><option value="title">Heading</option><option value="summary">Introduction</option></select></label>
        <label>{field === "title" ? "Heading" : "Introduction"}<textarea value={draft} maxLength={field === "title" ? 100 : 500} onChange={event => setDraft(event.target.value)} /></label>
        <button type="submit" disabled={draft === tool[field] || (field === "title" && !draft.trim())}>Apply text</button>
        <button type="button" onClick={() => setDraft(tool[field])}>Discard draft</button>
        <small>Select the page heading or its introductory paragraph. Other properties are available in the content panel. Applied edits support the studio’s save, undo and publication controls.</small>
      </form>}
    </div>
    <div onClickCapture={event => {
      if (!selecting || !(event.target instanceof Element)) return;
      const root = event.currentTarget;
      const heading = root.querySelector("h1");
      const clicked = event.target.closest("h1, p");
      if (!clicked || (clicked !== heading && clicked.parentElement !== heading?.parentElement)) return;
      if (clicked.tagName === "P" && !(heading?.compareDocumentPosition(clicked) & Node.DOCUMENT_POSITION_FOLLOWING)) return;
      event.preventDefault(); event.stopPropagation();
      setField(clicked.tagName === "H1" ? "title" : "summary");
    }}>{children}</div>
  </div>;
}

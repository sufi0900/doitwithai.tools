"use client";
import { useState, type ReactNode } from "react";
import { isToolPageField, type ToolPageField } from "../domain/tool-page-properties";
export function ToolPageCanvasEditor({ onSelect, children }: { onSelect: (field: ToolPageField) => void; children: ReactNode }) {
 const [selecting, setSelecting] = useState(false);
 return <div className="tool-canvas-editor" data-selecting={selecting}>
  <div className="tool-canvas-controls"><button type="button" aria-pressed={selecting} onClick={() => setSelecting(!selecting)}>{selecting ? "Preview interactions" : "Select page element"}</button>{selecting && <small> Select an outlined element to edit it in the content panel. All properties are also available in the panel’s Page property selector.</small>}</div>
  <div onClickCapture={event => {
   if (!selecting || !(event.target instanceof Element)) return;
   const node = event.target.closest<HTMLElement>("[data-wb-property]");
   const field = node?.dataset.wbProperty;
   event.preventDefault(); event.stopPropagation();
   if (field && isToolPageField(field)) onSelect(field);
  }}>{children}</div>
 </div>;
}

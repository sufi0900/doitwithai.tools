"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  isToolPageField,
  toolPageFieldCategories,
  toolPageLabels,
  type ToolPageField,
} from "../domain/tool-page-properties";

export function ToolPageCanvasEditor({
  selectedField,
  onSelect,
  onSelectProperty,
  children,
}: {
  tool?: unknown;
  selectedField?: ToolPageField;
  onSelect?: (field: ToolPageField) => void;
  onSelectProperty?: (field: ToolPageField) => void;
  children: ReactNode;
}) {
  const [selecting, setSelecting] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleSelect = (field: ToolPageField) => {
    onSelect?.(field);
    onSelectProperty?.(field);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const nodes = container.querySelectorAll<HTMLElement>("[data-wb-property]");
    nodes.forEach((node) => {
      if (selectedField && node.dataset.wbProperty === selectedField) {
        node.setAttribute("data-wb-active", "true");
      } else {
        node.removeAttribute("data-wb-active");
      }
    });
  }, [selectedField, selecting, children]);

  return (
    <div
      ref={containerRef}
      className="tool-canvas-editor"
      data-selecting={selecting}
      data-active-property={selectedField || ""}
    >
      <div className="tool-canvas-controls">
        <div className="tool-canvas-controls__primary">
          <button
            type="button"
            className="tool-canvas-controls__toggle"
            aria-pressed={selecting}
            onClick={() => setSelecting(!selecting)}
          >
            {selecting ? "Preview interactions" : "Select page element"}
          </button>
          <div className="tool-canvas-QuickJumps" role="group" aria-label="Quick jump to tool page section">
            {toolPageFieldCategories.map((category) => {
              const firstField = category.fields[0];
              const isActive = Boolean(
                selectedField && category.fields.includes(selectedField)
              );
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`tool-canvas-pill${isActive ? " is-active" : ""}`}
                  onClick={() => {
                    if (firstField) handleSelect(firstField);
                  }}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
        {selecting ? (
          <small>
            Click any highlighted element on the tool canvas (Heading, Eyebrow, Summary, Badges, Highlights, Inputs, CTA button, Methodology Cards, or FAQs) to edit it directly in the left Studio panel.
          </small>
        ) : selectedField ? (
          <small>
            Editing <strong>{toolPageLabels[selectedField]}</strong> in the left Studio panel · Enable <em>Select page element</em> to click any element on the canvas.
          </small>
        ) : null}
      </div>
      <div
        onClickCapture={(event) => {
          if (!selecting || !(event.target instanceof Element)) return;
          const node = event.target.closest<HTMLElement>("[data-wb-property]");
          const field = node?.dataset.wbProperty;
          if (!field || !isToolPageField(field)) return;
          event.preventDefault();
          event.stopPropagation();
          handleSelect(field);
        }}
      >
        {children}
      </div>
    </div>
  );
}

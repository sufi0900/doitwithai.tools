"use client";

import { useEffect, useState } from "react";
import type { SiteDocument } from "../domain/site-document";
import type { SiteCommand } from "../domain/commands";
import {
  toolGradientPresets,
  toolPageFieldCategories,
  toolPageLabels,
  type ToolPageField,
} from "../domain/tool-page-properties";

export function ToolPagePropertyControl({
  tool,
  field,
  onSelect,
  execute,
}: {
  tool: SiteDocument["content"]["projects"][number];
  field: ToolPageField;
  onSelect: (field: ToolPageField) => void;
  execute: (command: SiteCommand) => void;
}) {
  const value = tool[field];
  const serialize = (v: typeof value) =>
    Array.isArray(v)
      ? field === "customFaqs"
        ? JSON.stringify(v, null, 2)
        : v.join("\n")
      : String(v ?? "");
  const [draft, setDraft] = useState(serialize(value));
  const [error, setError] = useState("");

  const activeCategory =
    toolPageFieldCategories.find((cat) => cat.fields.includes(field)) ??
    toolPageFieldCategories[0];

  useEffect(() => {
    setDraft(serialize(value));
    setError("");
  }, [tool.id, field, JSON.stringify(value)]);

  let faqs: Array<{ question: string; answer: string }> = [];
  try {
    const parsed = JSON.parse(draft || "[]");
    if (field === "customFaqs" && Array.isArray(parsed)) faqs = parsed;
  } catch {}

  const isBooleanField =
    field === "hideEducationSection" || field === "hideFaqSection";
  const isColorField =
    field === "toolAccentHex" ||
    field === "toolSecondaryAccentHex" ||
    field === "toolBackgroundHex" ||
    field === "toolSurfaceHex";
  const isSingleLineField =
    field === "title" ||
    field === "role" ||
    field === "period" ||
    field === "customCtaLabel" ||
    field === "inputLabel" ||
    field === "secondaryInputLabel" ||
    field === "metaTitle";

  const hasBaseline = Object.prototype.hasOwnProperty.call(
    tool.toolPageEdits?.baseline || {},
    field
  );

  return (
    <section
      className="tool-property-control"
      aria-label="Selected tool property"
    >
      <div className="tool-property-control__header" style={{ display: "grid", gap: "10px" }}>
        <div
          className="tool-inspector-category-tabs"
          role="tablist"
          aria-label="Inspector property categories"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "4px",
            background: "rgba(9, 14, 28, 0.78)",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid rgba(148, 163, 184, 0.2)",
          }}
        >
          {toolPageFieldCategories.map((category) => {
            const isCatActive = category.id === activeCategory.id;
            const shortLabel =
              category.id === "hero"
                ? "Hero"
                : category.id === "inputs"
                  ? "Inputs"
                  : category.id === "theme"
                    ? "Theme"
                    : category.id === "story"
                      ? "Story"
                      : "SEO";
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isCatActive}
                onClick={() => {
                  if (category.fields[0]) onSelect(category.fields[0]);
                }}
                style={{
                  padding: "6px 4px",
                  borderRadius: "7px",
                  border: isCatActive
                    ? "1px solid rgba(56, 189, 248, 0.45)"
                    : "1px solid transparent",
                  background: isCatActive
                    ? "rgba(37, 99, 235, 0.28)"
                    : "transparent",
                  color: isCatActive ? "#f8fafc" : "#94a3b8",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>

        <label style={{ display: "grid", gap: "5px", width: "100%", fontSize: "11.5px", fontWeight: 700, color: "#cbd5e1" }}>
          <span>Inspector Property ({activeCategory.label})</span>
          <select
            aria-label="Page property"
            value={field}
            onChange={(e) => onSelect(e.target.value as ToolPageField)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "rgba(9, 14, 28, 0.9)",
              color: "#f8fafc",
              fontSize: "12.5px",
              fontWeight: 600,
            }}
          >
            {toolPageFieldCategories.map((category) => (
              <optgroup key={category.id} label={category.label}>
                {category.fields.map((key) => (
                  <option key={key} value={key}>
                    {toolPageLabels[key]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="tool-property-control__pills" style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {activeCategory.fields.map((quickKey) => (
            <button
              key={quickKey}
              type="button"
              className={`tool-property-pill${field === quickKey ? " is-active" : ""}`}
              onClick={() => onSelect(quickKey)}
            >
              {toolPageLabels[quickKey]}
            </button>
          ))}
        </div>
      </div>
      <small style={{ color: "#94a3b8", fontSize: "11px", lineHeight: 1.45 }}>
        Applying page settings refreshes the live tool preview immediately. Reset restores the baseline value captured before your first edit.
      </small>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const next = isBooleanField
              ? draft === "true"
              : field === "customFaqs"
                ? JSON.parse(draft || "[]")
                : field === "technologies" || field === "heroHighlights"
                  ? draft
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                  : draft;
            if (
              field === "customFaqs" &&
              (!Array.isArray(next) ||
                next.some(
                  (item) =>
                    !item ||
                    typeof item.question !== "string" ||
                    typeof item.answer !== "string" ||
                    !item.question.trim() ||
                    !item.answer.trim()
                ))
            ) {
              throw new Error(
                "Fill in the question and answer for each FAQ."
              );
            }
            execute({
              type: "project.update",
              itemId: tool.id,
              field,
              value: next,
            });
            setError("");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Check the value.");
          }
        }}
      >
        <div className="property-value">
          <label htmlFor="selected-tool-property">
            {toolPageLabels[field]}
          </label>
          {isBooleanField || field === "toolThemeMode" ? (
            <select
              id="selected-tool-property"
              value={isBooleanField ? String(draft === "true") : draft || "auto"}
              onChange={(e) => setDraft(e.target.value)}
            >
              {(isBooleanField
                ? ["false", "true"]
                : ["auto", "dark", "light"]
              ).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field === "toolGradientPreset" ? (
            <select
              id="selected-tool-property"
              value={draft || "auto"}
              onChange={(e) => setDraft(e.target.value)}
            >
              {toolGradientPresets.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          ) : isColorField ? (
            <div className="tool-property-color-row">
              <input
                type="color"
                aria-label={`${toolPageLabels[field]} color picker`}
                value={
                  /^#[0-9a-fA-F]{6}$/.test(draft.trim())
                    ? draft.trim()
                    : field === "toolAccentHex"
                      ? "#2563eb"
                      : field === "toolSecondaryAccentHex"
                        ? "#0ea5e9"
                        : field === "toolSurfaceHex"
                          ? "#111827"
                          : "#090d16"
                }
                onChange={(e) => setDraft(e.target.value)}
              />
              <input
                id="selected-tool-property"
                value={draft}
                placeholder="Auto (inherit site theme) or #hex"
                onChange={(e) => setDraft(e.target.value)}
              />
              {draft && (
                <button
                  type="button"
                  onClick={() => setDraft("")}
                  title="Clear override to inherit site theme"
                >
                  Auto
                </button>
              )}
            </div>
          ) : field === "customFaqs" ? (
            <div>
              {faqs.map((faq, index) => (
                <fieldset key={index}>
                  <legend>FAQ {index + 1}</legend>
                  <label>
                    Question
                    <input
                      value={faq.question}
                      maxLength={220}
                      onChange={(e) =>
                        setDraft(
                          JSON.stringify(
                            faqs.map((item, i) =>
                              i === index
                                ? { ...item, question: e.target.value }
                                : item
                            )
                          )
                        )
                      }
                    />
                  </label>
                  <label>
                    Answer
                    <textarea
                      value={faq.answer}
                      maxLength={1200}
                      onChange={(e) =>
                        setDraft(
                          JSON.stringify(
                            faqs.map((item, i) =>
                              i === index
                                ? { ...item, answer: e.target.value }
                                : item
                            )
                          )
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft(
                        JSON.stringify(faqs.filter((_, i) => i !== index))
                      )
                    }
                  >
                    Remove FAQ
                  </button>
                </fieldset>
              ))}
              <button
                type="button"
                disabled={faqs.length >= 8}
                onClick={() =>
                  setDraft(
                    JSON.stringify([...faqs, { question: "", answer: "" }])
                  )
                }
              >
                Add FAQ
              </button>
            </div>
          ) : isSingleLineField ? (
            <input
              id="selected-tool-property"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          ) : (
            <textarea
              id="selected-tool-property"
              value={draft}
              rows={4}
              onChange={(e) => setDraft(e.target.value)}
            />
          )}
        </div>
        {(field === "technologies" || field === "heroHighlights") && (
          <small>One item per line.</small>
        )}
        {error && <p role="alert">{error}</p>}
        <div className="tool-property-actions">
          <button type="submit" disabled={draft === serialize(value)}>
            Apply
          </button>
          <button type="button" onClick={() => setDraft(serialize(value))}>
            Discard draft
          </button>
          <button
            type="button"
            disabled={!hasBaseline}
            onClick={() =>
              execute({
                type: "project.resetPageProperty",
                itemId: tool.id,
                field,
              })
            }
          >
            Reset property
          </button>
        </div>
      </form>
    </section>
  );
}

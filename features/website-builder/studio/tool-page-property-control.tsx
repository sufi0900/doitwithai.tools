"use client";

import { useEffect, useState } from "react";
import type { SiteDocument } from "../domain/site-document";
import type { SiteCommand } from "../domain/commands";
import {
  toolGradientPresets,
  toolPageFieldCategories,
  toolPageFields,
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
      <div className="tool-property-control__header">
        <label>
          Page property
          <select
            value={field}
            onChange={(e) => onSelect(e.target.value as ToolPageField)}
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
        <div className="tool-property-QuickPills">
          {toolPageFields.slice(0, 8).map((quickKey) => (
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
      <small>
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
                      ? "#4f46e5"
                      : field === "toolSecondaryAccentHex"
                        ? "#06b6d4"
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
            <div className="tool-faq-editor">
              {faqs.map((faq, index) => (
                <fieldset key={index} className="tool-faq-item">
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

"use client";

import { Braces, BrainCircuit, Download, Layers3 } from "lucide-react";
import { useMemo, useState } from "react";
import { analyzeSchemaPage } from "../api";
import {
  createSchemaState,
  getSchemaDefinition,
  makeRepeaterItem,
  SCHEMA_DEFINITIONS,
} from "../config";
import { evaluateSchema } from "../validation";
import type {
  SchemaAnalysisResponse,
  SchemaFormState,
  SchemaTypeId,
} from "../types";
import SchemaCodePanel from "./SchemaCodePanel";
import SchemaDynamicForm from "./SchemaDynamicForm";

export default function SchemaGeneratorClient() {
  const [state, setState] = useState<SchemaFormState>(() =>
    createSchemaState("article"),
  );
  const [analysis, setAnalysis] = useState<SchemaAnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const evaluation = useMemo(() => evaluateSchema(state), [state]);

  function changeType(type: SchemaTypeId) {
    const next = createSchemaState(type);
    setState({
      ...next,
      pageUrl: state.pageUrl,
      pageContext: state.pageContext,
    });
    setAnalysis(null);
    setAnalysisError("");
  }

  async function analyze() {
    setAnalyzing(true);
    setAnalysisError("");
    setAnalysis(null);
    try {
      const response = await analyzeSchemaPage({
        pageUrl: state.pageUrl.trim(),
        pageContext: state.pageContext.trim(),
        schemaType: state.schemaType,
      });
      const definition = getSchemaDefinition(state.schemaType);
      const fieldKinds = new Map(
        definition.sections.flatMap((section) =>
          section.fields.map((field) => [field.id, field.kind] as const),
        ),
      );
      const nextValues = { ...state.values };
      const nextRepeaters = Object.fromEntries(
        Object.entries(state.repeaters).map(([key, items]) => [
          key,
          items.map((item) => ({ ...item })),
        ]),
      );
      const repeaterFields = new Map(
        (definition.repeaters || []).map((repeater) => [
          repeater.id,
          new Set(repeater.fields.map((field) => field.id)),
        ]),
      );
      let nextPageUrl = state.pageUrl;
      for (const suggestion of response.analysis.suggestions) {
        if (suggestion.fieldId === "pageUrl") {
          if (!nextPageUrl) nextPageUrl = suggestion.value;
          continue;
        }
        if (!fieldKinds.has(suggestion.fieldId)) continue;
        nextValues[suggestion.fieldId] =
          fieldKinds.get(suggestion.fieldId) === "checkbox"
            ? suggestion.value.toLowerCase() === "true"
            : suggestion.value;
      }
      for (const suggestion of response.analysis.suggestions) {
        const match = suggestion.fieldId.match(
          /^([a-zA-Z0-9]+)\.(\d+)\.([a-zA-Z0-9]+)$/,
        );
        if (!match) continue;
        const [, repeaterId, rawIndex, fieldId] = match;
        const index = Number(rawIndex);
        if (index > 24 || !repeaterFields.get(repeaterId)?.has(fieldId)) {
          continue;
        }
        nextRepeaters[repeaterId] ||= [];
        while (nextRepeaters[repeaterId].length <= index) {
          nextRepeaters[repeaterId].push(makeRepeaterItem());
        }
        nextRepeaters[repeaterId][index][fieldId] = suggestion.value;
      }
      if (!nextPageUrl && response.analysis.extracted.canonicalUrl) {
        nextPageUrl = response.analysis.extracted.canonicalUrl;
      }
      setState((current) => ({
        ...current,
        pageUrl: nextPageUrl,
        values: nextValues,
        repeaters: nextRepeaters,
        visibleContentConfirmed: false,
      }));
      setAnalysis(response);
    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "The optional page analysis could not be completed.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <section id="schema-markup-generator" className="scroll-mt-24">
      <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            String(SCHEMA_DEFINITIONS.length),
            "Focused schema workflows",
            Layers3,
          ],
          ["Live", "Deterministic JSON-LD", Braces],
          ["Optional", "URL and context analysis", BrainCircuit],
          ["2", "Download formats", Download],
        ].map(([value, label, Icon]) => {
          const MetricIcon = Icon as typeof Layers3;
          return (
            <div
              key={label as string}
              className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-2xl font-black">{value as string}</p>
                <MetricIcon className="h-4 w-4 text-cyan-300" />
              </div>
              <p className="mt-1 text-xs font-semibold text-blue-100/80">
                {label as string}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(410px,0.96fr)] lg:items-start">
        <SchemaDynamicForm
          state={state}
          analysis={analysis}
          analyzing={analyzing}
          analysisError={analysisError}
          onChange={setState}
          onTypeChange={changeType}
          onAnalyze={() => void analyze()}
          onReset={() => {
            setState(createSchemaState(state.schemaType));
            setAnalysis(null);
            setAnalysisError("");
          }}
          onSample={() => {
            setState(createSchemaState(state.schemaType, true));
            setAnalysis(null);
            setAnalysisError("");
          }}
        />
        <SchemaCodePanel state={state} evaluation={evaluation} />
      </div>
    </section>
  );
}

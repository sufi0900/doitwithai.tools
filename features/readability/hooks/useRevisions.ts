"use client";
import { useCallback, useState } from "react";
import { readToolResponse } from "@/lib/ai-tools/client-response";
import {
  readabilityInputSchema,
  validateReadability,
  type ReadabilityOutput,
} from "../schema";

export type Tone = "clear" | "professional" | "friendly";
export type Range = { start: number; end: number };

/** State for the optional AI revision workflow. The API contract is unchanged. */
export function useRevisions() {
  const [audience, setAudience] = useState("");
  const [terms, setTerms] = useState("");
  const [tone, setTone] = useState<Tone>("clear");
  const [splitParagraphs, setSplitParagraphs] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<ReadabilityOutput | null>(null);
  const [edits, setEdits] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [source, setSource] = useState("");
  const [sourceTerms, setSourceTerms] = useState("");
  const [range, setRange] = useState<Range | null>(null);
  const [generation, setGeneration] = useState(0);

  const generate = useCallback(
    async (passage: string, passageRange: Range, reader?: string, blockTypes?: Array<"paragraph" | "heading" | "listItem" | "quote" | "codeBlock">) => {
      if (busy) return false;
      setError("");
      setStatus("");
      const input = readabilityInputSchema.safeParse({
        text: passage,
        blockTypes,
        audience: [reader, audience].filter(Boolean).join(". ").slice(0, 250),
        terms,
        tone,
        splitParagraphs,
      });
      if (!input.success) {
        setError(
          "Select 40 to 4,500 characters of text before requesting revisions.",
        );
        return false;
      }
      setBusy(true);
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 75000);
        let response: Response;
        try {
          response = await fetch("/api/ai-tools/readability", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(input.data),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timer);
        }
        const body: any = await readToolResponse(response);
        if (!response.ok)
          throw Error(
            body.error?.message ||
              "Revisions are unavailable. Try again later.",
          );
        const parsed = validateReadability(body.result);
        setSource(input.data.text);
        setSourceTerms(input.data.terms);
        setRange(passageRange);
        setResult(parsed);
        setEdits(parsed.candidates.map((c) => c.text));
        setSelected(0);
        setGeneration((n) => n + 1);
        setStatus(
          "Three revisions are ready. Compare their meaning before replacing anything.",
        );
        return true;
      } catch (e) {
        setError(
          e instanceof Error && e.name !== "AbortError"
            ? e.message
            : "Revision request timed out. Please try again.",
        );
        return false;
      } finally {
        setBusy(false);
      }
    },
    [audience, terms, tone, splitParagraphs, busy],
  );

  return {
    audience,
    setAudience,
    terms,
    setTerms,
    tone,
    setTone,
    splitParagraphs,
    setSplitParagraphs,
    busy,
    error,
    status,
    setStatus,
    result,
    edits,
    setEdits,
    selected,
    setSelected,
    source,
    sourceTerms,
    range,
    setRange,
    generation,
    generate,
  };
}

export type Revisions = ReturnType<typeof useRevisions>;

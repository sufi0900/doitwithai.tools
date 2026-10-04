"use client";
import { useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ImagePlus,
  ScanEye,
  Sparkles,
  X,
} from "lucide-react";
import {
  altInputSchema,
  purposeLabels,
  validateAltOutput,
  type AltInput,
  type AltOutput,
} from "./schema";
import { altAttribute, reviewAlt } from "./review";
import { prepareImage } from "./prepare-image";
const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none focus:border-[#5271ff] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900";
const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50";
const card =
  "rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7";
const examples = {
  informative: {
    description:
      "A writer sits at a wooden desk, reviewing a printed article beside an open laptop and a notebook.",
    context:
      "An article about reviewing AI-assisted drafts before publication.",
    destination: "",
    visibleText: "",
    currentAlt:
      "Image of content writing SEO AI content writing best ever tools",
  },
  functional: {
    description: "A printer-shaped icon appears alone inside a button.",
    context: "The button is below an article and has no visible text label.",
    destination: "Print the current article",
    visibleText: "",
    currentAlt: "Printer icon",
  },
  complex: {
    description:
      "A bar chart compares the number of articles reviewed by a team in three weeks. Week 1: 4. Week 2: 6. Week 3: 5.",
    context:
      "A report about the team's weekly editing workload. These numbers are supplied for this example, not research findings.",
    destination: "",
    visibleText: "Articles reviewed. Week 1: 4. Week 2: 6. Week 3: 5.",
    currentAlt: "Graph",
  },
  decorative: {
    description:
      "A soft blue wave separates two sections without adding information.",
    context: "The wave has no link, button action, or meaningful text.",
    destination: "",
    visibleText: "",
    currentAlt: "Blue wave",
  },
};
export default function AltTextClient() {
  const [purpose, setPurpose] = useState<AltInput["purpose"]>("informative");
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [destination, setDestination] = useState("");
  const [visibleText, setVisibleText] = useState("");
  const [currentAlt, setCurrentAlt] = useState("");
  const [image, setImage] = useState<Awaited<
    ReturnType<typeof prepareImage>
  > | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<AltOutput | null>(null);
  const [source, setSource] = useState<AltInput | null>(null);
  const [edits, setEdits] = useState<string[]>([]);
  const [extended, setExtended] = useState("");
  const [selected, setSelected] = useState(0);
  const [reviewed, setReviewed] = useState<boolean[]>([false, false, false]);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const uploadVersion = useRef(0);
  const edited = edits[selected] || "";
  const checks = reviewAlt(
    edited,
    source?.currentAlt || "",
    source?.context || "",
    source?.purpose || "informative",
  );
  const currentChecks = reviewAlt(currentAlt, "", context, purpose);
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus(
        "Clipboard unavailable. Select the text or download your draft.",
      );
    }
  }
  function clearImage() {
    uploadVersion.current++;
    setImage(null);
    setPreparing(false);
    if (fileRef.current) fileRef.current.value = "";
  }
  function useExample() {
    const e = examples[purpose];
    clearImage();
    setDescription(e.description);
    setContext(e.context);
    setDestination(e.destination);
    setVisibleText(e.visibleText);
    setCurrentAlt(e.currentAlt);
    setError("");
    setStatus("Written example loaded. No image has been uploaded.");
  }
  async function upload(file?: File) {
    if (!file) return;
    const version = ++uploadVersion.current;
    setPreparing(true);
    setError("");
    try {
      const prepared = await prepareImage(file);
      if (version !== uploadVersion.current) return;
      setImage(prepared);
      setStatus(
        "Image prepared locally. It is sent only when you generate alternatives.",
      );
    } catch (e) {
      if (version === uploadVersion.current)
        setError(
          e instanceof Error
            ? e.message
            : "Cannot prepare this image. Use a written description.",
        );
    } finally {
      if (version === uploadVersion.current) setPreparing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    const input = altInputSchema.safeParse({
      purpose,
      description,
      context,
      destination,
      visibleText,
      currentAlt,
      image: image?.data || "",
    });
    if (!input.success) {
      setError(input.error.issues[0]?.message || "Review the image brief.");
      return;
    }
    if (purpose === "decorative" || preparing) return;
    setBusy(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 65000);
    try {
      const response = await fetch("/api/ai-tools/alt-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.data),
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok)
        throw Error(
          body.error?.message ||
            "Alternatives are unavailable. Try again later.",
        );
      const parsed = validateAltOutput(body.result, input.data.purpose);
      setResult(parsed);
      setSource(input.data);
      setEdits(parsed.candidates.map((c) => c.text));
      setExtended(parsed.extendedDescription);
      setSelected(0);
      setReviewed([false, false, false]);
      setStatus(
        "Three alternatives are ready. Review them against the image and its page purpose.",
      );
      requestAnimationFrame(() => {
        resultRef.current?.focus();
        resultRef.current?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        });
      });
    } catch (e) {
      setError(
        e instanceof Error && e.name !== "AbortError"
          ? e.message
          : "Generation timed out. Please try again.",
      );
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }
  function download() {
    const text = `Image purpose: ${source ? purposeLabels[source.purpose] : ""}\nSource: ${source?.image ? "Uploaded image and notes" : "Written description"}\n\nAlt text:\n${edited}\n\nHTML attribute:\n${altAttribute(edited)}${extended ? `\n\nExtended description for nearby page text:\n${extended}` : ""}\n\nReview this draft against the image and its page context before publishing.\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "image-alt-text.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Draft downloaded.");
  }
  return (
    <div className="space-y-7">
      <form
        onSubmit={generate}
        className={card}
        aria-label="Image alt text brief"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
              01 · Image and purpose
            </p>
            <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
              Give the image its page context
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Upload an image or describe it. Tell us what the reader needs from
              it.
            </p>
          </div>
          <button
            type="button"
            className={button}
            onClick={useExample}
            disabled={busy || preparing}
          >
            Try an example
          </button>
        </div>
        <fieldset className="mt-6" disabled={busy || preparing}>
          <legend className="text-sm font-bold text-slate-900 dark:text-white">
            How is the image used?
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Object.entries(purposeLabels).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={purpose === value}
                onClick={() => {
                  setPurpose(value as AltInput["purpose"]);
                  setError("");
                }}
                className={`min-h-14 rounded-xl border px-3 py-3 text-left text-xs font-bold transition focus-visible:ring-4 focus-visible:ring-blue-200 ${purpose === value ? "border-[#5271ff] bg-blue-50 text-[#4662df] dark:bg-blue-950 dark:text-blue-200" : "border-slate-200 text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:text-slate-300"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        {purpose === "decorative" ? (
          <div
            data-alt-decorative
            className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40"
          >
            <h3 className="font-bold text-slate-950 dark:text-white">
              A decorative image usually needs an empty alt attribute
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Use this only when the image adds no meaning and provides no link
              or button label. No AI request is needed.
            </p>
            <pre className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-900 dark:bg-slate-950 dark:text-white">
              {altAttribute("")}
            </pre>
            <button
              type="button"
              className={`${button} mt-4`}
              onClick={() => copy(altAttribute(""))}
            >
              <Copy aria-hidden className="h-4 w-4" />
              Copy empty alt attribute
            </button>
            <p className="mt-4 text-xs leading-6 text-slate-600 dark:text-slate-400">
              An image inside a link may still need an accessible name for that
              link. Review the complete surrounding element.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-7 grid gap-7 lg:grid-cols-[1.1fr_1fr]">
              <div className="min-w-0 space-y-5">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/50">
                  <label
                    htmlFor="alt-image"
                    className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"
                  >
                    <ImagePlus aria-hidden className="h-5 w-5 text-[#5271ff]" />
                    Upload one image{" "}
                    <span className="font-normal text-slate-500">
                      (optional)
                    </span>
                  </label>
                  <input
                    ref={fileRef}
                    id="alt-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={busy || preparing}
                    onChange={(e) => void upload(e.target.files?.[0])}
                    aria-describedby="alt-upload-help"
                    className="mt-4 w-full min-w-0 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#4662df] file:px-4 file:py-3 file:font-bold file:text-white dark:text-slate-300"
                  />
                  <p
                    id="alt-upload-help"
                    className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400"
                  >
                    PNG, JPEG, or WebP. Original up to 10 MB and 24 megapixels.
                    Prepared locally at up to 1600 pixels on its longest side.
                  </p>
                  {preparing && (
                    <p
                      role="status"
                      className="mt-3 text-sm text-[#4662df] dark:text-blue-200"
                    >
                      Preparing your image…
                    </p>
                  )}
                  {image && (
                    <div className="mt-4">
                      <div className="relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                        {/* Local raster preview, not a remote image. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.data}
                          alt={
                            description ||
                            "Uploaded source image awaiting an alt text draft"
                          }
                          width={image.width}
                          height={image.height}
                          className="max-h-64 w-full object-contain"
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="min-w-0 break-all text-xs leading-6 text-slate-500 dark:text-slate-400">
                          {image.name} · {image.width} × {image.height} ·{" "}
                          {Math.ceil(image.bytes / 1000)} KB prepared
                        </p>
                        <button
                          type="button"
                          onClick={clearImage}
                          className={button}
                          disabled={busy}
                        >
                          <X aria-hidden className="h-4 w-4" />
                          <span className="sr-only">Remove image</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="alt-description"
                    className="text-sm font-bold text-slate-900 dark:text-white"
                  >
                    What does the image show?
                  </label>
                  <textarea
                    id="alt-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={3000}
                    disabled={busy}
                    className={field}
                    placeholder="Describe the subject, action, important details, and anything the AI might miss."
                    aria-describedby="alt-description-help"
                  />
                  <p
                    id="alt-description-help"
                    className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400"
                  >
                    Required when no image is uploaded. Description-only drafts
                    cannot verify what an image contains.
                  </p>
                </div>
              </div>
              <div className="min-w-0 space-y-5">
                <div>
                  <label
                    htmlFor="alt-context"
                    className="text-sm font-bold text-slate-900 dark:text-white"
                  >
                    Surrounding page text or image purpose
                  </label>
                  <textarea
                    id="alt-context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={4}
                    maxLength={1800}
                    disabled={busy}
                    className={field}
                    placeholder="What does this image help readers understand? Include nearby caption text, if useful."
                  />
                </div>
                {purpose === "functional" && (
                  <div>
                    <label
                      htmlFor="alt-destination"
                      className="text-sm font-bold text-slate-900 dark:text-white"
                    >
                      Link destination or button action{" "}
                      <span className="text-[#4662df] dark:text-blue-200">
                        (required)
                      </span>
                    </label>
                    <input
                      id="alt-destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      maxLength={350}
                      disabled={busy}
                      className={field}
                      placeholder="For example: Print this article"
                    />
                  </div>
                )}
                {purpose === "complex" && (
                  <p className="rounded-xl bg-blue-50 p-4 text-xs leading-6 text-[#4662df] dark:bg-blue-950/40 dark:text-blue-200">
                    Supply exact values and labels in your notes. The result
                    includes a separate extended description for nearby page
                    text.
                  </p>
                )}
                <div>
                  <label
                    htmlFor="alt-visible-text"
                    className="text-sm font-bold text-slate-900 dark:text-white"
                  >
                    Important text, labels, or verified values
                  </label>
                  <textarea
                    id="alt-visible-text"
                    value={visibleText}
                    onChange={(e) => setVisibleText(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    disabled={busy}
                    className={field}
                    placeholder="Transcribe small text or chart values that matter. Say if they already appear nearby."
                  />
                </div>
                <div>
                  <label
                    htmlFor="alt-current"
                    className="text-sm font-bold text-slate-900 dark:text-white"
                  >
                    Existing alt text{" "}
                    <span className="font-normal text-slate-500">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="alt-current"
                    value={currentAlt}
                    onChange={(e) => setCurrentAlt(e.target.value)}
                    rows={2}
                    maxLength={600}
                    disabled={busy}
                    className={field}
                  />
                  {currentAlt && (
                    <div
                      data-alt-current-checks
                      className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400"
                    >
                      <p>
                        {currentChecks.count} characters · {currentChecks.words}{" "}
                        words. Local editing cues only.
                      </p>
                      {currentChecks.cues.map((c) => (
                        <p key={c} className="mt-1">
                          {c}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-5 border-t border-slate-100 pt-6 dark:border-slate-800">
              <p className="max-w-2xl text-xs leading-6 text-slate-500 dark:text-slate-400">
                Generate sends the prepared image and brief to our AI provider.
                Drafts stay in this tab and are lost on refresh. Save edits
                before regenerating.
              </p>
              <button
                data-alt-generate
                type="submit"
                disabled={busy || preparing}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#4662df] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#3852bd] focus-visible:ring-4 focus-visible:ring-blue-300 disabled:opacity-50"
              >
                <Sparkles aria-hidden className="h-4 w-4" />
                {busy ? "Drafting alternatives…" : "Generate alt text"}
              </button>
            </div>
          </>
        )}
      </form>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}
      <p role="status" aria-live="polite" className="text-sm text-blue-100">
        {status}
      </p>
      {result && source && purpose !== "decorative" && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Alt text alternatives"
          className={`${card} scroll-mt-28 outline-none focus-visible:ring-4 focus-visible:ring-blue-300`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            02 · Compare and refine
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
            Choose the meaning, then refine the words
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Results reflect your submitted brief:{" "}
            {purposeLabels[source.purpose]}.{" "}
            {source.image
              ? "An image was included."
              : "Based on a written description only."}
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {result.candidates.map((c, i) => (
              <button
                data-alt-option
                key={i}
                type="button"
                aria-pressed={selected === i}
                onClick={() => {
                  setSelected(i);
                  setReviewed([false, false, false]);
                }}
                className={`min-w-0 rounded-2xl border p-5 text-left focus-visible:ring-4 focus-visible:ring-blue-200 ${selected === i ? "border-[#5271ff] bg-blue-50 dark:bg-blue-950/40" : "border-slate-200 hover:border-blue-300 dark:border-slate-700"}`}
              >
                <span className="flex items-center justify-between gap-3 text-xs font-bold text-[#4662df] dark:text-blue-200">
                  Alternative {i + 1}
                  {selected === i && <Check aria-hidden className="h-4 w-4" />}
                </span>
                <span className="mt-3 block break-words text-sm font-semibold leading-7 text-slate-900 dark:text-white">
                  {edits[i]}
                </span>
                <span className="mt-3 block text-xs leading-6 text-slate-500 dark:text-slate-400">
                  Original approach: {c.explanation}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-7 grid gap-7 lg:grid-cols-[1.25fr_1fr]">
            <div className="min-w-0">
              <label
                htmlFor="alt-edit"
                className="text-sm font-bold text-slate-900 dark:text-white"
              >
                Edit selected alt text
              </label>
              <textarea
                id="alt-edit"
                aria-label="Editable alt text"
                className={field}
                rows={4}
                maxLength={500}
                value={edited}
                onChange={(e) => {
                  setEdits((old) =>
                    old.map((v, i) => (i === selected ? e.target.value : v)),
                  );
                  setReviewed([false, false, false]);
                }}
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {checks.count} characters · {checks.words} words. No fixed
                character limit or quality score.
              </p>
              {source.currentAlt && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Submitted original
                  </p>
                  <p
                    data-alt-original
                    className="mt-2 break-words text-sm leading-7 text-slate-600 dark:text-slate-300"
                  >
                    {source.currentAlt}
                  </p>
                </div>
              )}
              <div className="mt-5 rounded-xl bg-slate-950 p-4 text-white">
                <p className="mb-2 text-xs font-bold text-slate-400">
                  HTML attribute
                </p>
                <pre
                  data-alt-attribute
                  className="whitespace-pre-wrap break-all text-sm leading-7"
                >
                  {altAttribute(edited)}
                </pre>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className={button}
                  disabled={!edited.trim()}
                  onClick={() => copy(edited)}
                >
                  <Copy aria-hidden className="h-4 w-4" />
                  Copy alt text
                </button>
                <button
                  type="button"
                  className={button}
                  disabled={!edited.trim()}
                  onClick={() => copy(altAttribute(edited))}
                >
                  <Copy aria-hidden className="h-4 w-4" />
                  Copy alt attribute
                </button>
                <button
                  type="button"
                  className={button}
                  disabled={!edited.trim()}
                  onClick={download}
                >
                  <Download aria-hidden className="h-4 w-4" />
                  Download draft
                </button>
              </div>
              {source.purpose === "complex" && (
                <div className="mt-6">
                  <label
                    htmlFor="alt-extended"
                    className="text-sm font-bold text-slate-900 dark:text-white"
                  >
                    Extended description for nearby page text
                  </label>
                  <textarea
                    id="alt-extended"
                    rows={6}
                    maxLength={1800}
                    value={extended}
                    onChange={(e) => {
                      setExtended(e.target.value);
                      setReviewed([false, false, false]);
                    }}
                    className={field}
                  />
                  <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
                    Keep this outside the alt attribute. Verify every value and
                    connect this description to the image in your page.
                  </p>
                  <button
                    type="button"
                    className={`${button} mt-3`}
                    disabled={!extended.trim()}
                    onClick={() => copy(extended)}
                  >
                    Copy extended description
                  </button>
                </div>
              )}
            </div>
            <aside className="min-w-0 space-y-5">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <ScanEye aria-hidden className="h-5 w-5 text-[#5271ff]" />
                  Review in context
                </h3>
                {source.image && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={source.image}
                      alt={edited || "Submitted source image for review"}
                      className="mt-4 max-h-52 w-full rounded-xl object-contain"
                    />
                  </>
                )}
                <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-slate-600 dark:text-slate-300">
                  {source.description ||
                    "Use the submitted image above to check visible details."}
                </p>
                {source.context && (
                  <p className="mt-3 break-words text-xs leading-6 text-slate-500 dark:text-slate-400">
                    Page context: {source.context}
                  </p>
                )}
                {source.destination && (
                  <p className="mt-3 break-words text-xs leading-6 text-slate-500 dark:text-slate-400">
                    Intended action: {source.destination}
                  </p>
                )}
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Local editing cues
                </h3>
                <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                  {(checks.cues.length
                    ? checks.cues
                    : [
                        "No listed wording cues found. This does not verify accuracy or accessibility.",
                      ]
                  ).map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <details className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <summary className="cursor-pointer text-sm font-bold text-slate-900 dark:text-white">
                  AI review notes for the generated drafts
                </summary>
                <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                  {result.review.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </details>
              <fieldset className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <legend className="px-2 text-sm font-bold text-slate-900 dark:text-white">
                  Human review before publishing
                </legend>
                {[
                  "The wording matches the image or supplied description.",
                  "The alternative fits the image's function on this page.",
                  "Names, labels, and values have been checked.",
                ].map((label, i) => (
                  <label
                    key={label}
                    className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-xs leading-6 text-slate-600 dark:text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={reviewed[i]}
                      onChange={(e) =>
                        setReviewed((old) =>
                          old.map((v, n) => (n === i ? e.target.checked : v)),
                        )
                      }
                      className="mt-1 h-4 w-4 accent-[#5271ff]"
                    />
                    {label}
                  </label>
                ))}
                <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  {reviewed.every(Boolean)
                    ? "Your review checklist is complete. This is your confirmation, not an automated certification."
                    : "These checks record your own review. They do not certify compliance."}
                </p>
              </fieldset>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}

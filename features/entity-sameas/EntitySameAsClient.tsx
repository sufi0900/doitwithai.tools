"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Download, ExternalLink, Info, Loader2, Search } from "lucide-react";
import {
  LANGUAGES,
  SCHEMA_TYPES,
  buildEntityUrl,
  buildJsonLd,
  buildSearchUrl,
  parseEntityResponse,
  parseManualUrls,
  parseSearchResponse,
  serializeJsonLd,
  type Candidate,
  type EntityProfile,
  type SchemaType,
} from "./entityLib";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#7f9aff] focus:outline-none focus:ring-2 focus:ring-[#5271ff]/40";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";
const smallButton =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton =
  "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";

async function getJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function friendlyError(error: unknown): string {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Wikidata took too long to respond. Please try again.";
  }
  return "Couldn't reach Wikidata. Check your connection and try again.";
}

export default function EntitySameAsClient() {
  const [term, setTerm] = useState("");
  const [language, setLanguage] = useState("en");
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [searchError, setSearchError] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [loadingEntity, setLoadingEntity] = useState(false);
  const [entityError, setEntityError] = useState("");
  const [profile, setProfile] = useState<EntityProfile | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const [manualText, setManualText] = useState("");
  const [type, setType] = useState<SchemaType>("Organization");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [wrap, setWrap] = useState(true);
  const [copied, setCopied] = useState(false);

  const manual = useMemo(() => parseManualUrls(manualText), [manualText]);

  const sameAs = useMemo(() => {
    const fromProfile = profile ? profile.links.filter((link) => checked.has(link.key)).map((link) => link.url) : [];
    return [...fromProfile, ...manual.valid];
  }, [profile, checked, manual.valid]);

  const output = useMemo(
    () => serializeJsonLd(buildJsonLd({ type, name, url, description, sameAs }), wrap),
    [type, name, url, description, sameAs, wrap]
  );

  const runSearch = async () => {
    if (!term.trim() || searching || loadingEntity) return;
    setSearching(true);
    setSearchError("");
    setCandidates(null);
    setProfile(null);
    setSelectedId("");
    setEntityError("");
    try {
      setCandidates(parseSearchResponse(await getJson(buildSearchUrl(term, language))));
    } catch (error) {
      setSearchError(friendlyError(error));
    } finally {
      setSearching(false);
    }
  };

  const selectCandidate = async (candidate: Candidate) => {
    if (loadingEntity || searching) return;
    setSelectedId(candidate.id);
    setLoadingEntity(true);
    setEntityError("");
    setProfile(null);
    try {
      const parsed = parseEntityResponse(await getJson(buildEntityUrl(candidate.id, language)), candidate.id, language);
      if (!parsed) {
        setEntityError("Wikidata didn't return details for that entry. Try another result.");
        return;
      }
      setProfile(parsed);
      setChecked(new Set(parsed.links.filter((link) => link.defaultChecked).map((link) => link.key)));
      setName(parsed.label);
      setUrl(parsed.website);
      setDescription("");
    } catch (error) {
      setEntityError(friendlyError(error));
    } finally {
      setLoadingEntity(false);
    }
  };

  const toggle = (key: string) =>
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([output], { type: "application/ld+json;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "entity-schema.jsonld";
    link.click();
    URL.revokeObjectURL(href);
  };

  const showBuilder = profile !== null || (candidates !== null && candidates.length === 0);

  return (
    <div
      id="entity-sameas-finder"
      className="mx-auto max-w-6xl scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur sm:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Search column */}
        <div>
          <p className={labelClass}>1. Find your entity</p>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="es-term">
                Brand, organization, person, product, or place
              </label>
              <input
                id="es-term"
                type="text"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void runSearch();
                }}
                placeholder="e.g. Mozilla Foundation"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="es-language">
                Language
              </label>
              <select id="es-language" value={language} onChange={(event) => setLanguage(event.target.value)} className={inputClass}>
                {LANGUAGES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" onClick={() => void runSearch()} disabled={searching || loadingEntity || !term.trim()} className={`${primaryButton} mt-3`}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
            Search Wikidata
          </button>
          <p className="mt-2 flex items-start gap-2 text-xs leading-6 text-slate-400">
            <Info className="mt-1 h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden="true" />
            Search Wikidata for matching entities. Verify each profile before including it in your markup.
          </p>

          {searchError && (
            <p role="alert" className="mt-3 text-xs font-semibold text-amber-300">
              {searchError}
            </p>
          )}

          {candidates && candidates.length > 0 && (
            <div className="mt-5" aria-live="polite">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pick the correct match</p>
              <ul className="mt-2 space-y-2">
                {candidates.map((candidate) => (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      disabled={loadingEntity || searching}
                      onClick={() => void selectCandidate(candidate)}
                      aria-pressed={selectedId === candidate.id}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        selectedId === candidate.id ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-slate-900/50 hover:bg-white/10"
                      }`}
                    >
                      <span className="block text-sm font-extrabold text-white">{candidate.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {candidate.description || "No description"} · {candidate.id}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs leading-6 text-slate-400">
                Names are often shared. Check the description so you pick your own entity, not a similarly named one.
              </p>
            </div>
          )}

          {candidates && candidates.length === 0 && (
            <p className="mt-5 rounded-xl border border-white/10 bg-slate-900/60 p-4 text-xs leading-6 text-slate-300" aria-live="polite">
              No Wikidata entry matched that search. That&apos;s common for newer or smaller brands. Don&apos;t create an entry just for SEO — Wikidata has its own
              notability rules. You can still build a <span className="font-mono">sameAs</span> list below using your own official profiles.
            </p>
          )}

          {loadingEntity && (
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-300" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading details…
            </p>
          )}
          {entityError && (
            <p role="alert" className="mt-3 text-xs font-semibold text-amber-300">
              {entityError}
            </p>
          )}
        </div>

        {/* Builder column */}
        <div aria-live="polite">
          <p className={labelClass}>2. Choose links and copy your schema</p>
          {!showBuilder ? (
            <p className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-400">
              Search for your entity on the left. The profile links Wikidata knows about will appear here for you to check.
            </p>
          ) : (
            <div className="space-y-5">
              {profile && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-sm font-extrabold text-white">
                    {profile.label} <span className="ml-1 text-xs font-normal text-slate-400">{profile.id}</span>
                  </p>
                  {profile.description && <p className="mt-0.5 text-xs text-slate-400">Wikidata says: {profile.description}</p>}
                  <p className="mt-3 text-xs leading-6 text-slate-400">
                    Open each link to confirm it&apos;s really yours before keeping it ticked. Wikidata can be out of date or wrong.
                  </p>
                  <ul className="mt-2 space-y-2">
                    {profile.links.map((link) => (
                      <li key={link.key} className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3">
                        <input
                          id={`es-${link.key}`}
                          type="checkbox"
                          checked={checked.has(link.key)}
                          onChange={() => toggle(link.key)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900"
                        />
                        <label htmlFor={`es-${link.key}`} className="min-w-0 flex-1 text-xs">
                          <span className="block font-bold text-slate-100">{link.label}</span>
                          <span className="block break-all font-mono text-[11px] text-slate-400">{link.url}</span>
                          {link.note && <span className="mt-0.5 block text-[11px] text-amber-300">{link.note}</span>}
                        </label>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${link.label} in a new tab`}
                          className="mt-0.5 shrink-0 text-slate-400 transition hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="es-manual">
                  Add your own profile URLs (one per line)
                </label>
                <textarea
                  id="es-manual"
                  value={manualText}
                  onChange={(event) => setManualText(event.target.value)}
                  rows={3}
                  spellCheck={false}
                  placeholder={"https://www.linkedin.com/company/your-brand/\nhttps://www.youtube.com/@your-brand"}
                  className={`${inputClass} font-mono text-xs`}
                />
                {manual.invalid.length > 0 && (
                  <p className="mt-1 flex items-start gap-2 text-xs text-amber-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {manual.invalid.length} entr{manual.invalid.length === 1 ? "y isn't" : "ies aren't"} a valid http(s) URL and will be ignored.
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="es-type">
                    Schema type
                  </label>
                  <select id="es-type" value={type} onChange={(event) => setType(event.target.value as SchemaType)} className={inputClass}>
                    {SCHEMA_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="es-name">
                    Name
                  </label>
                  <input id="es-name" type="text" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="es-url">
                    Official website URL (the page where this markup will live)
                  </label>
                  <input id="es-url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com/" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="es-desc">
                    Description (optional — use your own words)
                  </label>
                  <input id="es-desc" type="text" value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} />
                  {profile?.description && (
                    <button type="button" onClick={() => setDescription(profile.description)} className="mt-1 text-[11px] font-bold text-blue-300 hover:underline">
                      Use Wikidata&apos;s short description
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    JSON-LD · {sameAs.length} sameAs link{sameAs.length === 1 ? "" : "s"}
                  </p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <input type="checkbox" checked={wrap} onChange={(event) => setWrap(event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-900" />
                    Include &lt;script&gt; tag
                  </label>
                </div>
                <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-slate-950/80 p-3 text-[11px] leading-5 text-slate-300">{output}</pre>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => void copy()} className={primaryButton}>
                    {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    Copy JSON-LD
                  </button>
                  <button type="button" onClick={downloadJson} className={smallButton}>
                    <Download className="h-4 w-4" aria-hidden="true" /> Download
                  </button>
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  Review the output, add it to the page it describes, then test it with the Schema Markup Validator or Google&apos;s Rich Results Test.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

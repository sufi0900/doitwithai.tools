"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Code2,
  Copy,
  Download,
  MapPin,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  buildLocalBusinessSchema,
  DEFAULT_LOCAL_SCHEMA_INPUT,
  LOCAL_BUSINESS_SUBTYPES,
  type HoursPresetId,
  type LocalBusinessSchemaInput,
} from "./model";

export default function LocalBusinessSchemaGeneratorClient() {
  const [input, setInput] = useState<LocalBusinessSchemaInput>(
    DEFAULT_LOCAL_SCHEMA_INPUT,
  );
  const [outputMode, setOutputMode] = useState<"script" | "json">("script");
  const [toast, setToast] = useState("");

  const result = useMemo(() => buildLocalBusinessSchema(input), [input]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof LocalBusinessSchemaInput>(
    key: K,
    val: LocalBusinessSchemaInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  function downloadJsonFile() {
    const blob = new Blob([result.jsonString], {
      type: "application/ld+json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "local-business-schema.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded local-business-schema.json!");
  }

  return (
    <section
      aria-label="LocalBusiness JSON-LD Schema Generator Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      {toast && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        {/* LEFT COLUMN: STRUCTURED INPUT BUILDER */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <MapPin size={19} className="text-[#5271ff]" />
              1. Business Category, Name &amp; NAP Details
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Schema.org Business Subtype (35+ Local Categories)
                </label>
                <select
                  value={input.businessType}
                  onChange={(e) => updateField("businessType", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
                >
                  {LOCAL_BUSINESS_SUBTYPES.map((grp) => (
                    <optgroup key={grp.group} label={grp.group}>
                      {grp.types.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Exact Legal / GBP Business Name
                </label>
                <input
                  type="text"
                  value={input.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Primary Website / Location Page URL
                </label>
                <input
                  type="url"
                  value={input.url}
                  onChange={(e) => updateField("url", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Local Business Description (Include Primary Services &amp; City)
                </label>
                <textarea
                  rows={2}
                  value={input.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs leading-5 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Phone Number (Match GBP Exactly)
                </label>
                <input
                  type="text"
                  value={input.telephone}
                  onChange={(e) => updateField("telephone", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Price Range Tier
                </label>
                <select
                  value={input.priceRange}
                  onChange={(e) =>
                    updateField(
                      "priceRange",
                      e.target.value as LocalBusinessSchemaInput["priceRange"],
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="$">$ (Budget / Value)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (Premium)</option>
                  <option value="$$$$">$$$$ (Luxury / Enterprise)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address, GeoCoordinates & Service Areas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              2. Postal Address, GeoCoordinates &amp; Service Areas
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Street Address
                </label>
                <input
                  type="text"
                  value={input.streetAddress}
                  onChange={(e) => updateField("streetAddress", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  City (addressLocality)
                </label>
                <input
                  type="text"
                  value={input.addressLocality}
                  onChange={(e) =>
                    updateField("addressLocality", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    State
                  </label>
                  <input
                    type="text"
                    value={input.addressRegion}
                    onChange={(e) =>
                      updateField("addressRegion", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Postal
                  </label>
                  <input
                    type="text"
                    value={input.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Country
                  </label>
                  <input
                    type="text"
                    value={input.addressCountry}
                    onChange={(e) =>
                      updateField("addressCountry", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Latitude (GeoCoordinates)
                </label>
                <input
                  type="text"
                  value={input.latitude}
                  onChange={(e) => updateField("latitude", e.target.value)}
                  placeholder="30.2701"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Longitude (GeoCoordinates)
                </label>
                <input
                  type="text"
                  value={input.longitude}
                  onChange={(e) => updateField("longitude", e.target.value)}
                  placeholder="-97.7458"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Service-Area Cities / Neighborhoods (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={input.serviceAreasCsv}
                  onChange={(e) =>
                    updateField("serviceAreasCsv", e.target.value)
                  }
                  placeholder="Austin, Round Rock, Cedar Park, Westlake Hills"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Hours, Social sameAs & AggregateRating */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              3. Opening Hours, sameAs Profiles &amp; Rating
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Opening Hours Schedule
                </label>
                <select
                  value={input.hoursPreset}
                  onChange={(e) =>
                    updateField("hoursPreset", e.target.value as HoursPresetId)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="mon-fri-9-5">Monday – Friday</option>
                  <option value="mon-sat-9-6">Monday – Saturday</option>
                  <option value="24-7">24/7 Emergency Service</option>
                  <option value="custom">Custom Days List</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Opens At (24h)
                </label>
                <input
                  type="text"
                  value={input.opensTime}
                  onChange={(e) => updateField("opensTime", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Closes At (24h)
                </label>
                <input
                  type="text"
                  value={input.closesTime}
                  onChange={(e) => updateField("closesTime", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Entity Disambiguation Links (sameAs — 1 URL per line: GBP,
                  Yelp, Facebook, BBB, Apple Maps)
                </label>
                <textarea
                  rows={3}
                  value={input.sameAsLines}
                  onChange={(e) => updateField("sameAsLines", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE JSON-LD CODE & ENTITY COMPLETENESS AUDIT */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
                  Local Entity Readiness
                </span>
                <h3 className="text-lg font-black">
                  Schema Completeness: {result.completenessScore}/100
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                Schema.org Validated
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {result.checks.map((chk) => (
                <div
                  key={chk.label}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  {chk.passed ? (
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                  ) : (
                    <AlertTriangle
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />
                  )}
                  <div>
                    <strong className="block font-bold text-slate-900 dark:text-white">
                      {chk.label}
                    </strong>
                    <span className="text-slate-600 dark:text-slate-300">
                      {chk.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#0D1322] p-5 text-white shadow-xl sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3.5">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setOutputMode("script")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    outputMode === "script"
                      ? "bg-[#3b63fb] text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  &lt;script&gt; HTML Tag
                </button>
                <button
                  type="button"
                  onClick={() => setOutputMode("json")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    outputMode === "json"
                      ? "bg-[#3b63fb] text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  Raw JSON-LD
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const text =
                      outputMode === "script"
                        ? result.scriptTagHtml
                        : result.jsonString;
                    await navigator.clipboard.writeText(text);
                    notify("Copied LocalBusiness JSON-LD markup!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#3b63fb] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#294fe0]"
                >
                  <Copy size={13} />
                  Copy Schema
                </button>
                <button
                  type="button"
                  onClick={downloadJsonFile}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-[#5271ff]"
                >
                  <Download size={13} />
                  .JSON
                </button>
              </div>
            </div>

            <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-emerald-300">
              {outputMode === "script"
                ? result.scriptTagHtml
                : result.jsonString}
            </pre>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Code2 size={14} className="text-sky-400" />
                Paste inside your page <code>&lt;head&gt;</code> or footer
              </span>
              <span className="flex items-center gap-1 text-sky-300">
                <Sparkles size={13} /> AI Search &amp; Maps Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

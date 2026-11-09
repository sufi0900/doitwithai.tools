"use client";

import { useState } from "react";
import type { VideoPlaybook } from "@/lib/founder-hub/video-playbook";

const sourceUrl =
  "https://github.com/sufi0900/doitwithai.tools/blob/main/docs/FOUNDER_VIDEO_PRODUCTION.md";

export default function FounderVideoPlaybook({ playbook }: { playbook: VideoPlaybook | null }) {
  const [feedback, setFeedback] = useState("");

  async function copyPrompt(title: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(title + " copied.");
    } catch {
      setFeedback("Clipboard unavailable. Select and copy the prompt text below.");
    }
  }

  return (
    <section className="space-y-6" aria-labelledby="video-production-title">
      <header className="rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-950 p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Founder Studio</p>
        <h2 id="video-production-title" className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
          Video Production Playbook
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
          How Do It With AI plans, directs, and reviews its reels, from the first visual hook
          through the final edit. Start with the master brief, then pick a prompt for the stage you need.
        </p>
        <a href={sourceUrl} className="mt-4 inline-block text-sm font-semibold text-blue-300 underline underline-offset-4 hover:text-blue-200">
          Read the source handbook on GitHub
        </a>
      </header>

      {playbook ? (
        <>
          {playbook.prompts.length > 0 && (
            <section className="space-y-3" aria-labelledby="video-production-prompts">
              <h3 id="video-production-prompts" className="text-lg font-bold text-white">Copyable production prompts</h3>
              <p className="text-sm text-slate-300">
                Replace the bracketed inputs and give the producer the handbook alongside the prompt.
              </p>
              <p role="status" className="text-sm text-blue-200">{feedback}</p>
              {playbook.prompts.map((prompt) => (
                <details key={prompt.id} open={prompt.id === "master"} className="rounded-2xl border border-slate-700 bg-slate-900">
                  <summary className="cursor-pointer rounded-2xl px-4 py-3 text-sm font-bold text-slate-100">
                    {prompt.title}
                  </summary>
                  <div className="space-y-3 px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => copyPrompt(prompt.title, prompt.text)}
                      aria-label={"Copy " + prompt.title}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                    >
                      Copy prompt
                    </button>
                    <pre className="whitespace-pre-wrap break-words rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 sm:text-sm">
                      {prompt.text}
                    </pre>
                  </div>
                </details>
              ))}
            </section>
          )}
          <article
            aria-label="Founder video production handbook"
            className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-sm leading-relaxed text-slate-200 [overflow-wrap:anywhere] sm:p-8
              [&_a]:text-blue-300 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-blue-400 [&_blockquote]:pl-3
              [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white
              [&_li+li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5
              [&_.founder-video-table]:overflow-x-auto [&_table]:w-full [&_table]:border-collapse
              [&_td]:border [&_td]:border-slate-700 [&_td]:p-3 [&_td]:align-top
              [&_th]:border [&_th]:border-slate-700 [&_th]:bg-slate-800 [&_th]:p-3 [&_th]:text-left"
            dangerouslySetInnerHTML={{ __html: playbook.html }}
          />
        </>
      ) : (
        <p className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-sm text-slate-200">
          The handbook could not be loaded here. Open the source handbook on GitHub to read it.
        </p>
      )}
    </section>
  );
}

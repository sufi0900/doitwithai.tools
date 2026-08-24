"use client";

import {
  Bot,
  ChevronDown,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { askSiteAssistant } from "../api";
import { SITE_ASSISTANT_STARTERS, SITE_ASSISTANT_WELCOME } from "../config";
import type { SiteAssistantMessage } from "../types";
import AssistantMessage from "./AssistantMessage";

const STORAGE_KEY = "doitwithai-site-assistant-v1";

function messageId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function welcomeMessage(): SiteAssistantMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: SITE_ASSISTANT_WELCOME,
    createdAt: new Date().toISOString(),
  };
}

function track(event: string) {
  const gtag = (
    window as typeof window & { gtag?: (...args: unknown[]) => void }
  ).gtag;
  gtag?.("event", event, { feature: "site_assistant" });
}

export default function SiteAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SiteAssistantMessage[]>([
    welcomeMessage(),
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SiteAssistantMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.slice(-20));
        }
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
  }, [hydrated, messages]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  async function sendMessage(rawValue = input) {
    const value = rawValue.trim();
    if (!value || loading) return;
    const userMessage: SiteAssistantMessage = {
      id: messageId(),
      role: "user",
      content: value.slice(0, 3_000),
      createdAt: new Date().toISOString(),
    };
    const conversation = [...messages, userMessage].slice(-14);
    setMessages(conversation);
    setInput("");
    setLoading(true);
    track("site_assistant_question");
    abortRef.current = new AbortController();

    try {
      const result = await askSiteAssistant(
        {
          messages: conversation.map(({ role, content }) => ({
            role,
            content,
          })),
          currentPage: {
            title: document.title,
            url: window.location.href,
          },
          website: "",
        },
        abortRef.current.signal,
      );
      setMessages((current) => [
        ...current,
        {
          id: result.requestId || messageId(),
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "I could not complete that answer. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  }

  function resetChat() {
    abortRef.current?.abort();
    setMessages([welcomeMessage()]);
    setInput("");
    setLoading(false);
    sessionStorage.removeItem(STORAGE_KEY);
    track("site_assistant_reset");
  }

  const showStarters = messages.length === 1 && !loading;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1400]"
      data-pathname={pathname}
    >
      {!open && (
        <div className="pointer-events-auto absolute bottom-[max(18px,env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              track("site_assistant_open");
            }}
            className="group relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#5271ff] via-[#5b68f4] to-[#7956ef] text-white shadow-[0_18px_55px_rgba(64,89,220,0.42)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_65px_rgba(64,89,220,0.52)] focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
            aria-label="Open Do It With AI Tools assistant"
          >
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 px-1 text-[8px] font-black tracking-wide dark:border-slate-950">
              AI
            </span>
            <MessageCircle className="h-7 w-7 transition group-hover:scale-110" />
            <span className="pointer-events-none absolute right-[76px] hidden whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-xl transition group-hover:opacity-100 sm:block">
              Ask Do It With AI Tools
            </span>
          </button>
        </div>
      )}

      {open && (
        <section
          className="pointer-events-auto absolute bottom-[max(12px,env(safe-area-inset-bottom))] right-3 flex h-[min(700px,calc(100dvh-24px))] w-[calc(100vw-24px)] max-w-[424px] flex-col overflow-hidden rounded-[28px] border border-white/60 bg-slate-50 shadow-[0_28px_90px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 sm:bottom-6 sm:right-6 sm:h-[min(700px,calc(100dvh-48px))]"
          role="dialog"
          aria-modal="false"
          aria-label="Do It With AI Tools assistant"
        >
          <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#4563ed] via-[#5271ff] to-[#7857ee] px-4 pb-4 pt-4 text-white">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-inner backdrop-blur-sm">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#5271ff] bg-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black tracking-tight">
                    Ask Do It With AI Tools
                  </p>
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-100">
                    <ShieldCheck className="h-3 w-3" /> Grounded in our website
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  className="rounded-xl p-2 text-white/75 transition hover:bg-white/15 hover:text-white"
                  aria-label="Start a new chat"
                  title="Start a new chat"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-white/75 transition hover:bg-white/15 hover:text-white"
                  aria-label="Minimize assistant"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-white/75 transition hover:bg-white/15 hover:text-white"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 py-4 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]"
            aria-live="polite"
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <AssistantMessage
                  key={message.id}
                  message={message}
                  onSourceClick={() => track("site_assistant_source_click")}
                />
              ))}
              {showStarters && (
                <div className="ml-9 grid gap-2">
                  {SITE_ASSISTANT_STARTERS.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => void sendMessage(starter)}
                      className="rounded-xl border border-[#5271ff]/20 bg-white px-3 py-2.5 text-left text-[11.5px] font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#5271ff]/50 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#5271ff] dark:hover:bg-slate-800"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              )}
              {loading && (
                <div
                  className="flex items-start gap-2.5"
                  aria-label="Assistant is thinking"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5271ff] to-[#7657ff] text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="animate-pulse h-1.5 w-1.5 rounded-full bg-[#5271ff]"
                        style={{ animationDelay: `${dot * 160}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <footer className="shrink-0 border-t border-slate-200 bg-white px-3.5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-inner transition focus-within:border-[#5271ff]/60 focus-within:ring-4 focus-within:ring-[#5271ff]/10 dark:border-slate-700 dark:bg-slate-900">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) =>
                  setInput(event.target.value.slice(0, 3_000))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={1}
                disabled={loading}
                placeholder="Ask about AI SEO, tools, or resources…"
                className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[13px] leading-5 text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:text-slate-100"
                aria-label="Message Do It With AI Tools assistant"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5271ff] to-[#6d57ee] text-white shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Send message"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[9.5px] font-medium text-slate-400">
              Answers from published site content · Verify important details
            </p>
          </footer>
        </section>
      )}
    </div>
  );
}

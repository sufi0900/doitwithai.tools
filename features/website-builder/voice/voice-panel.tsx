"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, PanelRightClose, Send, Square, Volume2, VolumeX } from "lucide-react";
import type { TranscriptItem, VoiceStatus } from "./use-assemblyai-agent";

type Props = { status: VoiceStatus; transcript: TranscriptItem[]; error: string | null; active: boolean; start: () => void; stop: () => void; sendText: (message: string) => Promise<void>; textBusy: boolean; soundsEnabled: boolean; setSoundsEnabled: (enabled: boolean) => void; onHide?: () => void; contextHint?: string; suggestedRequest?: string; onUseConversationNotes?: () => void };

export function VoicePanel({ status, transcript, error, active, start, stop, sendText, textBusy, soundsEnabled, setSoundsEnabled, onHide, contextHint, suggestedRequest, onUseConversationNotes }: Props) {
  const [message, setMessage] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = transcriptRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [status, transcript]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = message.trim();
    if (!value || textBusy) return;
    setMessage("");
    await sendText(value);
  }

  return (
    <section className="voice-panel" aria-label="Do It AI Agent studio assistant">
      <div className="voice-heading">
        <div><p className="eyebrow">DO IT AI AGENT</p><h2>Voice & Studio Director</h2></div>
        <div className="voice-heading-actions"><span className={`status-dot ${status}`}><i />{status}</span><button type="button" onClick={() => setSoundsEnabled(!soundsEnabled)} title={soundsEnabled ? "Mute assistant sounds" : "Enable assistant sounds"} aria-label={soundsEnabled ? "Mute assistant sounds" : "Enable assistant sounds"}>{soundsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}</button>{onHide && <button type="button" onClick={onHide} title="Hide Do It AI Agent" aria-label="Hide Do It AI Agent"><PanelRightClose size={15} /></button>}</div>
      </div>
      {contextHint && <div className="voice-context-hint"><p>{contextHint}</p>{suggestedRequest && <button type="button" disabled={textBusy} onClick={() => void sendText(suggestedRequest)}>Ask Do It AI Agent for help</button>}{onUseConversationNotes && <button type="button" disabled={!transcript.some(item => item.speaker === "user" && item.final)} onClick={onUseConversationNotes}>Use our conversation as article notes</button>}</div>}
      <div ref={transcriptRef} className="transcript" aria-live="polite" aria-busy={textBusy || status === "processing"}>
        {transcript.map((item) => (
          <div key={item.id} className={`message ${item.speaker} ${item.final ? "" : "streaming"}`}><span>{item.speaker === "agent" ? "Do It AI Agent" : item.speaker === "user" ? "You" : "System"}</span>{item.text ? <p>{item.text}{!item.final && <i className="stream-caret" aria-hidden="true" />}</p> : <TypingIndicator label={item.speaker === "user" ? "Listening" : "Do It AI Agent is responding"} />}</div>
        ))}
      </div>
      {error && <p className="voice-error">{error}</p>}
      <form className="assistant-input" onSubmit={submit}>
        <label htmlFor="assistant-message">Message Do It AI Agent</label>
        <div><textarea id="assistant-message" rows={2} value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Paste a URL or ask for a change…" disabled={textBusy} /><button type="submit" disabled={textBusy || !message.trim()} aria-label="Send message"><Send size={16} /></button></div>
        <small>Voice and text use the same safe editing tools.</small>
      </form>
      <div className="voice-actions">
        <button className={active ? "voice-button stop" : "voice-button"} onClick={active ? stop : start} type="button" aria-label={active ? "End voice session" : "Start voice session"}>
          {active ? <Square size={18} fill="currentColor" /> : <Mic size={21} />}
        </button>
        <div><strong>{active ? "End session" : "Start voice"}</strong><small>{textBusy ? "Do It AI Agent is planning and validating changes…" : "Speak or type. Images still require manual upload."}</small></div>
      </div>
    </section>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return <div className="typing-indicator" role="status" aria-label={label}><i /><i /><i /><b>{label}</b></div>;
}

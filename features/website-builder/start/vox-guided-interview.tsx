"use client";

import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import { useEffect, useRef, useState } from "react";
import { exactFieldSchema, exactLabels, proposeExact, confirmExact, beginExactCorrection, submitExactCorrection, isVoiceDraftReady, nextVoiceInterviewStep, type ExactField, type VoiceOnboarding } from "@/features/website-builder/domain/voice-onboarding";
import { completeGuidedDirection, guidedInterviewSchema, GUIDED_INTERVIEW_STEPS } from "@/features/website-builder/domain/guided-interview";
import { PORTFOLIO_TEMPLATES } from "@/features/website-builder/domain/templates";
import { templateOptions } from "@/features/website-builder/domain/template-contracts";
import { appendSpokenWord, isAffirmative, isDraftCreationIntent, isTemplateConfirmationIntent } from "@/features/website-builder/domain/voice-conversation";

const exactFields = Object.keys(exactLabels) as ExactField[];
const creationTools = [
  { type: "function", name: "propose_exact", description: "Propose an exact value without saving it. Read back the result; ask the user if its spelling and wording are exact before confirming on a later turn.", parameters: { type: "object", properties: { field: { type: "string", enum: exactFields }, value: { type: "string" } }, required: ["field", "value"] } },
  { type: "function", name: "confirm_exact", description: "Only after the user explicitly says yes to the previous read-back, confirm the pending proposal ID. Never call in the proposal turn.", parameters: { type: "object", properties: { proposal_id: { type: "string" } }, required: ["proposal_id"] } },
  { type: "function", name: "set_direction", description: "Set the ONE required portfolio purpose after asking what this portfolio should achieve. Use key goal and value win-clients, showcase-work, or find-role. This single choice fills presentation defaults; do not ask separate audience, tone, motion or emphasis questions.", parameters: { type: "object", properties: { key: { type: "string", enum: ["goal"] }, value: { type: "string", enum: GUIDED_INTERVIEW_STEPS[0].options.map(option => option.value) } }, required: ["key", "value"] } },
  { type: "function", name: "choose_template", description: "PREVIEW a template when the owner asks to see it. This never confirms the choice or advances to optional fields; the owner can preview as many as they want.", parameters: { type: "object", properties: { template_id: { type: "string", enum: templateOptions } }, required: ["template_id"] } },
  { type: "function", name: "confirm_template", description: "Confirm the template currently shown in the preview ONLY when the owner explicitly asks to confirm this template. Clicking a preview alone is not confirmation.", parameters: { type: "object", properties: {} } },
  { type: "function", name: "skip_project", description: "Only when the user says they want to skip the optional first project. Continue the interview without asking for project facts.", parameters: { type: "object", properties: {} } },
  { type: "function", name: "skip_optional", description: "When the user explicitly wants to leave optional education or website link blank, remove its saved content. Never remove required identity details.", parameters: { type: "object", properties: { field: { type: "string", enum: ["education", "website"] } }, required: ["field"] } },
  { type: "function", name: "create_private_draft", description: "Immediately request the real server save only when the user asks to create their private draft and all required confirmed details, design answers and template are ready. This does not publish a public site. Report the actual tool result; never claim a save before success.", parameters: { type: "object", properties: {} } },
] as const;

/** Exploratory conversation. Speech is never copied into identity, credentials or publishing fields. */
export function VoxGuidedInterview({ authenticated, value, onChange, manualSelection, previewTemplateId, onPreviewTemplate, onCreateDraft, onSkipOptional, saving, creationError }: { authenticated: boolean; value: VoiceOnboarding; onChange: (value: VoiceOnboarding) => void; manualSelection?: { id: number; description: string }; previewTemplateId: VoiceOnboarding["selectedTemplate"]; onPreviewTemplate: (id: NonNullable<VoiceOnboarding["selectedTemplate"]>) => void; onCreateDraft: () => Promise<{ok:boolean;error?:string;projectId?:string}>; onSkipOptional: (field: "skills" | "education" | "website") => void; saving: boolean; creationError: string }) {
  const [lines, setLines] = useState<Array<{ who: "you" | "vox"; text: string }>>([]);
  const [live, setLive] = useState("");
  const [spoken, setSpoken] = useState("");
  const [exactField, setExactField] = useState<ExactField>("name");
  const [exactText, setExactText] = useState("");
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const socket = useRef<WebSocket | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const context = useRef<AudioContext | null>(null);
  const playbackAt = useRef(0);
  const playbackNodes = useRef<AudioBufferSourceNode[]>([]);
  const sessionReady = useRef(false);
  const lastManualSelection = useRef(0);
  const manualPurposeTurn = useRef(-1);
  const manualTemplateTurn = useRef(-1);
  const pendingNotice = useRef("");
  const lastConfirmation = useRef("");
  const current = useRef(value);
  current.current = value;
  const latestSave = useRef(onCreateDraft);
  latestSave.current = onCreateDraft;
  const latestPreview = useRef(onPreviewTemplate);
  latestPreview.current = onPreviewTemplate;
  const latestSkipOptional = useRef(onSkipOptional);
  latestSkipOptional.current = onSkipOptional;
  const previewedTemplate = useRef(previewTemplateId);
  previewedTemplate.current = previewTemplateId;
  const toolResults = useRef<Array<{ call_id: string; result: string; is_error?: boolean }>>([]);
  const replyDone = useRef(false);
  const previousTurn = useRef("");
  const userTurn = useRef(0);
  const proposedOnTurn = useRef(-1);
  const savingDraft = useRef<Promise<{ok:boolean;error?:string;projectId?:string}> | null>(null);
  const interrupted = useRef(false);
  const captionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const correctionInput = useRef<HTMLInputElement>(null);
  useEffect(() => { bottom.current?.scrollIntoView({ block: "nearest" }); }, [lines, live, spoken]);
  function change(next: VoiceOnboarding) { current.current = next; onChange(next); }
  function prompt(state: VoiceOnboarding) {
    return `You are Vox, a voice-directed portfolio creator. The next unfinished question for the owner is: ${nextVoiceInterviewStep(state)}. If correcting is set, tell the owner to type the corrected spelling and press Save corrected spelling; WAIT and DO NOT ask the next question or call tools until that happens. If a pending proposal exists, ask for confirmation of THAT proposal only; NEVER ask about a subsequent field before the pending proposal is confirmed. This is internal guidance: NEVER recite instructions or progress text verbatim, especially after restarting. If the purpose or template is already saved, acknowledge it briefly and move on. Speak in one or two short sentences and ask one question at a time. Ask for name, professional role, introduction, then at least two core skills. After hearing each exact field, call propose_exact for that field; read it back and only confirm on a later owner turn. When the owner types or confirms a field in the right panel, trust the updated saved state and skip that question. Manually typed core skills save when the owner leaves the field; do not proceed before the saved skills appear. Ask ONE design question about the portfolio's purpose (win clients, showcase work, find a role), then call set_direction with key goal. Audience, tone, motion and emphasis are derived internally; NEVER ask separate questions about them. Then offer template previews on the right. choose_template ONLY previews a design; owners may inspect every option. NEVER treat preview as confirmation. Wait until they press Confirm this template or explicitly ask to confirm this template before moving to optional details. After confirmation, the right panel displays optional education, website and first project; point to it and invite creation of a private draft. An optional first project can be skipped using skip_project. If the owner clearly requests creation, call create_private_draft. Report only the actual save result. Never invent proper noun spelling, achievements or credentials. Current confirmed facts: ${JSON.stringify(state.confirmed)}. Purpose and presentation defaults: ${JSON.stringify(state.direction)}. Confirmed template: ${state.selectedTemplate ?? "none"}. Current visual preview: ${previewedTemplate.current ?? "none"}. First project skipped: ${!!state.projectSkipped}. Pending proposal: ${state.pending ? JSON.stringify(state.pending) : "none"}. Correcting field: ${state.correcting ?? "none"}. Available templates: ${JSON.stringify(PORTFOLIO_TEMPLATES.map(t=>({id:t.id,name:t.name})))}. Respond in English.`;
  }
  function notifyManual(description: string) {
    const ws = socket.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    setError("");
    // A manual click takes precedence over any queued narration from the previous step.
    interrupted.current = true;
    if (captionTimer.current) clearTimeout(captionTimer.current);
    captionTimer.current = null; setSpoken("");
    playbackNodes.current.forEach(node => { try { node.stop(); } catch {} });
    playbackNodes.current = []; playbackAt.current = context.current?.currentTime ?? 0;
    ws.send(JSON.stringify({ type: "session.update", session: { system_prompt: prompt(current.current) } }));
    ws.send(JSON.stringify({ type: "conversation.message", role: "system", content: description }));
    pendingNotice.current = description;
    if (replyDone.current) announceManual();
  }
  function announceManual() {
    const ws = socket.current;
    if (!pendingNotice.current || !ws || ws.readyState !== WebSocket.OPEN) return;
    const description = pendingNotice.current; pendingNotice.current = "";
    ws.send(JSON.stringify({ type: "reply.create", instructions: `Acknowledge this user action. Follow the current state strictly: ${nextVoiceInterviewStep(current.current)}. If the owner is correcting spelling, wait silently after asking them to submit the text; do not ask the next question. Do not repeat earlier questions. ${description}` }));
    replyDone.current = false;
  }
  useEffect(() => {
    if (manualSelection && manualSelection.id !== lastManualSelection.current) {
      lastManualSelection.current = manualSelection.id;
      if (manualSelection.description.includes("as the portfolio purpose")) manualPurposeTurn.current = userTurn.current;
      if (manualSelection.description.includes("template in the right-hand preview")) manualTemplateTurn.current = userTurn.current;
      notifyManual(manualSelection.description);
    }
  // Manual selection comes from the adjacent preview and is already reflected in value.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualSelection]);
  function flushTools() {
    if (!replyDone.current || socket.current?.readyState !== WebSocket.OPEN) return;
    for (const result of toolResults.current.splice(0)) socket.current.send(JSON.stringify({ type: "tool.result", ...result }));
  }
  async function saveOnce() {
    if (savingDraft.current) return savingDraft.current;
    const task = latestSave.current(); savingDraft.current = task;
    try { return await task; } finally { savingDraft.current = null; }
  }
  async function handleTool(item: { name?: string; call_id?: string; arguments?: unknown }) {
    let result: Record<string, unknown>;
    try {
      const args = (typeof item.arguments === "string" ? JSON.parse(item.arguments) : item.arguments ?? {}) as Record<string, unknown>;
      if (!args || typeof args !== "object") throw new Error("Invalid answer.");
      if (current.current.correcting) throw new Error(`Wait for the owner to submit the corrected spelling for ${exactLabels[current.current.correcting]}. Do not advance.`);
      if (current.current.pending && item.name !== "confirm_exact" && item.name !== "propose_exact") throw new Error(`First confirm or correct the pending ${exactLabels[current.current.pending.field]}. Do not advance.`);
      if (item.name === "propose_exact") {
        const field = exactFieldSchema.parse(args.field);
        if (current.current.pending && current.current.pending.field !== field) throw new Error(`First resolve the pending ${exactLabels[current.current.pending.field]}.`);
        const incoming = String(args.value ?? "").trim().replace(/\s+/g, " ");
        if (field === "role" && !current.current.confirmed.name) throw new Error("Confirm the name first.");
        if (field === "intro" && !current.current.confirmed.role) throw new Error("Confirm the professional role first.");
        if (field === "skills" && !current.current.confirmed.intro) throw new Error("Confirm the introduction first.");
        if (current.current.pending?.field === field && current.current.pending.value === incoming) result = { proposal_id: current.current.pending.id, read_back: `${exactLabels[field]}: ${incoming}. Is that exactly right?`, pending: true, already_proposed: true };
        else if (incoming && current.current.confirmed[field] === incoming) result = { confirmed: true, already_confirmed: true, next_step: "This exact value was already confirmed. Continue to the next missing field." };
        else {
          const next = proposeExact(current.current, field, incoming);
          change(next);
          proposedOnTurn.current = userTurn.current;
          result = { proposal_id: next.pending?.id, read_back: `${exactLabels[field]}: ${next.pending?.value}. Is that exactly right?`, pending: true };
        }
      } else if (item.name === "confirm_exact") {
        if (typeof args.proposal_id !== "string") throw new Error("Proposal ID required.");
        const pending = current.current.pending;
        if (!pending && args.proposal_id === lastConfirmation.current) { result = { confirmed: true, already_confirmed: true, next_step: nextVoiceInterviewStep(current.current) }; }
        else if (!pending || args.proposal_id !== pending.id) { result = { confirmed: false, superseded: true, next_step: "The user corrected or replaced that proposal. Read the current pending proposal before confirming." }; }
        else {
        if (userTurn.current <= proposedOnTurn.current || !isAffirmative(previousTurn.current)) throw new Error("Wait for the user's explicit confirmation after the read-back.");
        change(confirmExact(current.current, args.proposal_id));
        lastConfirmation.current = args.proposal_id;
        previousTurn.current = "";
        result = { confirmed: true, field: pending?.field, value: pending?.value };
        }
      } else if (item.name === "set_direction") {
        const key = String(args.key) as keyof VoiceOnboarding["direction"];
        const parsed = guidedInterviewSchema.partial().safeParse({ [key]: args.value });
        if (key !== "goal" || !parsed.success || !parsed.data.goal) throw new Error("Choose a portfolio purpose: win clients, showcase work, or find a role.");
        if (!current.current.confirmed.skills) throw new Error("First confirm at least two short core skills.");
        if (current.current.direction.goal === parsed.data.goal) result = { selected: key, already_selected: true, next_step: "The purpose is already saved; show template previews." };
        else if (current.current.direction.goal && userTurn.current <= manualPurposeTurn.current) result = { selected: current.current.direction.goal, superseded: true, next_step: "The owner selected a purpose in the right panel. Respect that latest choice." };
        else {
          change({ ...current.current, direction: completeGuidedDirection({ goal: parsed.data.goal })! });
          result = { selected: key, value: args.value, next_step: "The portfolio purpose is saved. Offer the template previews now. Do not ask more design questions." };
        }
      } else if (item.name === "choose_template") {
        const templateId = templateOptions.find(id => id === args.template_id);
        if (!templateId) throw new Error("Choose a listed portfolio template.");
        if (!completeGuidedDirection(current.current.direction)) throw new Error("Choose the portfolio purpose before selecting a template.");
        const template = PORTFOLIO_TEMPLATES.find(item => item.id === templateId)!;
        if (current.current.selectedTemplate && userTurn.current <= manualTemplateTurn.current) {
          result = { confirmed: true, selected: current.current.selectedTemplate, next_step: "The owner already confirmed a template using the button. Do not overwrite that choice." };
        } else {
        previewedTemplate.current = templateId;
        latestPreview.current(templateId);
        if (current.current.selectedTemplate && current.current.selectedTemplate !== templateId) change({ ...current.current, selectedTemplate: undefined });
        result = { preview: template.name, description: template.description, preview_updated: true, confirmed: false, next_step: "This is a visual preview only. Invite the owner to compare other templates or press Confirm this template. Do not advance yet." };
        }
      } else if (item.name === "confirm_template") {
        if (!completeGuidedDirection(current.current.direction) || !previewedTemplate.current) throw new Error("Preview a template after the purpose question before confirming it.");
        if (!isTemplateConfirmationIntent(previousTurn.current)) throw new Error("Wait for the owner's explicit request to confirm this template.");
        change({ ...current.current, selectedTemplate: previewedTemplate.current });
        result = { confirmed: true, selected: previewedTemplate.current, next_step: "The template is confirmed. Tell the owner education, website link and first project are optional. Ask whether to create the private draft now." };
      } else if (item.name === "skip_project") {
        const confirmed = { ...current.current.confirmed }; delete confirmed.projectTitle; delete confirmed.projectSummary;
        change({ ...current.current, confirmed, pending: current.current.pending?.field === "projectTitle" || current.current.pending?.field === "projectSummary" ? null : current.current.pending, projectSkipped: true });
        result = { skipped: true, next_step: "Do not ask for a first project. Continue to template selection or private draft review." };
      } else if (item.name === "skip_optional") {
        const field = args.field;
        if (field !== "education" && field !== "website") throw new Error("Only education and website are optional here. Core skills are required.");
        latestSkipOptional.current(field);
        result = { skipped: field, next_step: "Proceed with the other confirmed details." };
      } else if (item.name === "create_private_draft") {
        if (!isVoiceDraftReady(current.current)) throw new Error("Confirm name, role, introduction and two core skills, then select one purpose and a template before creating the private draft.");
        if (!userTurn.current || (!isAffirmative(previousTurn.current) && !/\b(create|save|make|build|prepare|finish|complete|publish|proceed|continue|go ahead|do it)\b/i.test(previousTurn.current)) || /\b(don't|do not|not yet|wait|hold|cancel)\b/i.test(previousTurn.current)) throw new Error("Wait for the user's spoken request to create the private draft.");
        setError("");
        result = await saveOnce();
        if (result.ok) result = { saved: true, private: true, project_id: result.projectId, next_step: "Opening Studio to review the draft. This portfolio has not been published publicly." };
        else result = { error: result.error ?? "Saving failed. Please review the highlighted field on the right." };
      } else throw new Error("Unsupported action.");
    } catch (cause) { result = { error: cause instanceof Error ? cause.message : "The answer needs review." }; }
    if ("error" in result) setError(String(result.error)); else setError("");
    if (item.call_id) toolResults.current.push({ call_id: item.call_id, result: JSON.stringify(result), is_error: "error" in result });
    flushTools();
  }
  useEffect(() => () => {
    if (captionTimer.current) clearTimeout(captionTimer.current);
    socket.current?.close();
    stream.current?.getTracks().forEach((track) => track.stop());
    playbackNodes.current.forEach(node => { try { node.stop(); } catch {} });
    if (context.current && context.current.state !== "closed") void context.current.close();
  }, []);
  function stop() {
    if (captionTimer.current) clearTimeout(captionTimer.current); captionTimer.current = null;
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "session.end" }));
    socket.current?.close(); socket.current = null;
    stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null;
    playbackNodes.current.forEach(node => { try { node.stop(); } catch {} }); playbackNodes.current = [];
    if (context.current && context.current.state !== "closed") void context.current.close(); context.current = null;
    playbackAt.current = 0; sessionReady.current = false; pendingNotice.current = ""; previousTurn.current = ""; userTurn.current = 0; proposedOnTurn.current = -1;
    toolResults.current = []; setActive(false); setBusy(false); setLive(""); setSpoken("");
  }
  async function start() {
    if (!authenticated) { setError("Sign in to start a voice interview."); return; }
    setBusy(true); setError("");
    try {
      const response = await authorizedWebsiteFetch("/api/assemblyai/onboarding-token", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Voice is unavailable.");
      const audio = new AudioContext(); context.current = audio; playbackAt.current = 0; sessionReady.current = false;
      await audio.resume(); await audio.audioWorklet.addModule("/pcm-processor.js");
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } }); stream.current = microphone;
      const source = audio.createMediaStreamSource(microphone);
      const worklet = new AudioWorkletNode(audio, "portfolio-pcm-processor", { processorOptions: { inputSampleRate: audio.sampleRate, targetSampleRate: 24000 } });
      source.connect(worklet);
      const url = new URL("wss://agents.assemblyai.com/v1/ws"); url.searchParams.set("token", result.token);
      const ws = new WebSocket(url); socket.current = ws;
      ws.addEventListener("open", () => {
        ws.send(JSON.stringify({ type: "session.update", session: {
          system_prompt: prompt(current.current),
          greeting: current.current.confirmed.name ? `Welcome back, ${current.current.confirmed.name}. ${nextVoiceInterviewStep(current.current)}` : "Welcome to DoItWithAI Website Studio. I'll repeat exact details so you can check every spelling. What name should your website show?",
          tools: creationTools, input: { format: { encoding: "audio/pcm" }, language_codes: ["en"], keyterms: current.current.confirmed.name ? [current.current.confirmed.name] : [] }, output: { voice: "michael", format: { encoding: "audio/pcm" }, volume: 100 },
        } })); setBusy(false); setActive(true);
      });
      worklet.port.onmessage = (event) => {
        if (ws.readyState !== WebSocket.OPEN || !sessionReady.current) return;
        let binary = ""; for (const byte of new Uint8Array(event.data as ArrayBuffer)) binary += String.fromCharCode(byte);
        ws.send(JSON.stringify({ type: "input.audio", audio: btoa(binary) }));
      };
      ws.addEventListener("message", (message) => {
        const item = JSON.parse(String(message.data)) as { type?: string; text?: string; delta?: string; data?: string; message?: string; name?: string; call_id?: string; arguments?: unknown; status?: string; interrupted?: boolean };
        if (item.type === "session.ready") sessionReady.current = true;
        if (item.type === "input.speech.started") { interrupted.current = true; if (captionTimer.current) clearTimeout(captionTimer.current); captionTimer.current = null; setSpoken(""); playbackNodes.current.forEach(node => { try { node.stop(); } catch {} }); playbackNodes.current = []; playbackAt.current = context.current?.currentTime ?? 0; }
        if (item.type === "transcript.user.delta" && item.text) setLive(item.text);
        if (item.type === "transcript.user" && item.text) { userTurn.current += 1; previousTurn.current = item.text; setLive(""); setLines((old) => [...old.slice(-30), { who: "you", text: item.text! }]); if (isDraftCreationIntent(item.text) && isVoiceDraftReady(current.current)) void saveOnce().then(result => { if (!result.ok) setError(result.error ?? "Could not save the draft."); }); }
        if (item.type === "transcript.agent.delta" && item.delta && !interrupted.current) setSpoken(text=>appendSpokenWord(text,item.delta!));
        if (item.type === "transcript.agent" && item.text && !interrupted.current && !item.interrupted) {
          // The final transcript can arrive before the last PCM chunk has played.
          const delay = Math.max(0, (playbackAt.current - (context.current?.currentTime ?? 0)) * 1000);
          if (captionTimer.current) clearTimeout(captionTimer.current);
          const spokenText = item.text;
          captionTimer.current = setTimeout(() => { captionTimer.current = null; if (!interrupted.current) { setSpoken(""); setLines(old => [...old.slice(-30), { who: "vox", text: spokenText }]); } }, delay);
        }
        if (item.type === "tool.call") void handleTool(item);
        if (item.type === "reply.started") { replyDone.current = false; interrupted.current = false; }
        if (item.type === "reply.done") { replyDone.current = true; const hasTools = toolResults.current.length > 0; if (item.status === "interrupted") { interrupted.current = true; if (captionTimer.current) clearTimeout(captionTimer.current); captionTimer.current = null; playbackNodes.current.forEach(node => { try { node.stop(); } catch {} }); playbackNodes.current = []; playbackAt.current = context.current?.currentTime ?? 0; setSpoken(""); toolResults.current = []; } else flushTools(); if (pendingNotice.current && !hasTools) announceManual(); }
        if (item.type === "session.error") { stop(); setError(item.message || "Voice stopped. Confirmed answers remain available in this tab."); }
        if (item.type === "reply.audio" && item.data && context.current && !interrupted.current) {
          if (context.current.state === "suspended") void context.current.resume().catch(() => setError("Audio playback was blocked. Check the browser audio permission or output device, then restart Vox."));
          const raw = atob(item.data); const view = new DataView(Uint8Array.from(raw, (ch) => ch.charCodeAt(0)).buffer);
          const buffer = context.current.createBuffer(1, Math.floor(view.byteLength / 2), 24000); const channel = buffer.getChannelData(0);
          for (let i = 0; i < channel.length; i++) channel[i] = view.getInt16(i * 2, true) / 32768;
          const player = context.current.createBufferSource(); player.buffer = buffer; player.connect(context.current.destination);
          const at = Math.max(playbackAt.current, context.current.currentTime); player.start(at); playbackAt.current = at + buffer.duration;
          playbackNodes.current.push(player); player.onended = () => { playbackNodes.current = playbackNodes.current.filter(node => node !== player); };
        }
      });
      ws.addEventListener("close", () => { stream.current?.getTracks().forEach((track) => track.stop()); setActive(false); setBusy(false); });
      ws.addEventListener("error", () => { stop(); setError("Voice connection stopped. Your confirmed answers remain available."); });
    } catch (cause) { stop(); setError(cause instanceof Error ? cause.message : "Voice unavailable. Use the accessible manual route."); }
  }
  return <section className="vox-interview" aria-label="Vox portfolio creation interview">
    <header><p className="eyebrow">BUILD WITH VOX</p><h2>Tell Vox what to build</h2><p>Vox repeats exact information before it enters your portfolio. Confirm the spelling or correct it below.</p></header>
    <div className="vox-interview-log" role="log" aria-live="polite"><p className="vox"><strong>Vox · progress</strong>{nextVoiceInterviewStep(value)}</p>{lines.map((item, index) => <p key={index} className={item.who === "you" ? "user" : "vox"}><strong>{item.who === "you" ? "You" : "Vox"}</strong>{item.text}</p>)}{live && <p className="user"><strong>You · listening</strong>{live}</p>}{spoken && <p className="vox"><strong>Vox · speaking</strong>{spoken}</p>}<div ref={bottom} /></div>
    {value.pending && !value.correcting && <div className="voice-fact-review" role="group" aria-label="Confirm spoken information"><strong>Confirm {exactLabels[value.pending.field]}</strong><p>{value.pending.value}</p><button type="button" onClick={() => { const pending = current.current.pending; if (!pending) return; change(confirmExact(current.current, pending.id)); lastConfirmation.current = pending.id; notifyManual(`The user confirmed ${exactLabels[pending.field]} as ${pending.value} by pressing the confirmation button. This proposal is complete. Continue with the next missing question.`); }}>Yes, this is exact</button><button type="button" onClick={() => { const pending = current.current.pending; if (!pending) return; setExactField(pending.field); setExactText(pending.value); change(beginExactCorrection(current.current)); notifyManual(`The user chose to correct ${exactLabels[pending.field]}. Ask them to type the exact spelling and press Save corrected spelling. Do not ask about another field yet.`); requestAnimationFrame(() => correctionInput.current?.focus()); }}>Correct wording or spelling</button></div>}
    <form className="voice-exact-input" onSubmit={(event) => { event.preventDefault(); try { const field = current.current.correcting ?? exactField; if (current.current.pending && !current.current.correcting && current.current.pending.field !== field) throw new Error(`Confirm or correct ${exactLabels[current.current.pending.field]} first.`); const next = current.current.correcting ? submitExactCorrection(current.current, exactText) : proposeExact(current.current, field, exactText); change(next); if (next.pending) { proposedOnTurn.current = userTurn.current; notifyManual(`The user typed a proposed ${exactLabels[field]}: ${next.pending.value}. Read it back and request confirmation before advancing.`); } else notifyManual(`The user submitted and saved the exact corrected spelling for ${exactLabels[field]}: ${next.confirmed[field]}. Continue with ${nextVoiceInterviewStep(next)}.`); setExactText(""); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Review the value."); } }}><label>{value.correcting ? `Correct ${exactLabels[value.correcting]} before continuing` : "Correct an exact detail"}<select value={value.correcting ?? exactField} disabled={!!value.correcting} onChange={event=>setExactField(exactFieldSchema.parse(event.target.value))}>{exactFields.map(item=><option key={item} value={item}>{exactLabels[item]}</option>)}</select></label><input ref={correctionInput} aria-label={`Propose ${value.correcting ? exactLabels[value.correcting] : exactLabels[exactField]}`} value={exactText} onChange={event=>setExactText(event.target.value)} placeholder="Type or paste exact spelling" /><button type="submit" disabled={!exactText.trim()}>{value.correcting ? "Save corrected spelling" : "Review value"}</button></form>
    {saving && <div className="vox-save-progress" role="status"><span className="inline-spinner" /> Saving your private portfolio draft… Vox will report the result after the server responds.</div>}
    {creationError && <p role="alert">Draft creation: {creationError}</p>}
    <div className="vox-interview-actions"><button type="button" disabled={busy} onClick={active ? stop : () => void start()}>{busy ? "Connecting…" : active ? "End voice conversation" : "Talk to Vox"}</button></div>
    {error && <p role="alert">{error}</p>}
  </section>;
}

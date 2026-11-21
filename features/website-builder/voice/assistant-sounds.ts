export type AssistantCue = "activate" | "speech" | "processing" | "success";

let context: AudioContext | null = null;

export function playAssistantCue(cue: AssistantCue, enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  const presets: Record<AssistantCue, Array<[number, number, number]>> = {
    activate: [[440, 0, 0.07], [660, 0.06, 0.11]],
    speech: [[520, 0, 0.055]],
    processing: [[280, 0, 0.09], [360, 0.08, 0.11]],
    success: [[540, 0, 0.07], [760, 0.07, 0.13]],
  };
  for (const [frequency, delay, duration] of presets[cue]) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(cue === "processing" ? 0.018 : 0.032, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }
}

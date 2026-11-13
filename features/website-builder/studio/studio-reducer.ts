import { applyUpsertFromWriterStudioCommand, describeWriterPublishingCommand, type UpsertFromWriterStudioCommand } from "../domain/writer-publishing-commands";
import { DEFAULT_SITE_DOCUMENT, validateSiteDocument, type SiteDocument } from "../domain/site-document";

export type CommandSource = "manual" | "voice" | "writer-studio";
export type StudioCommand = UpsertFromWriterStudioCommand | { type: string; [key: string]: unknown };

export type CommandReceipt = {
  command: StudioCommand;
  source: CommandSource;
  summary: string;
  at: string;
};

export type StudioState = {
  past: SiteDocument[];
  present: SiteDocument;
  future: SiteDocument[];
  receipts: CommandReceipt[];
  selectedPanel: "content" | "design" | "scene" | "opportunity";
  hydrated: boolean;
  lastCommandError: string | null;
};

export type StudioAction =
  | { type: "hydrate"; document?: unknown }
  | { type: "execute"; command: StudioCommand; source: CommandSource; next?: SiteDocument }
  | { type: "undo"; source: CommandSource }
  | { type: "redo" }
  | { type: "selectPanel"; panel: StudioState["selectedPanel"] }
  | { type: "reset" };

export const initialStudioState: StudioState = {
  past: [], present: DEFAULT_SITE_DOCUMENT, future: [], receipts: [], selectedPanel: "content", hydrated: false, lastCommandError: null,
};

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case "hydrate": {
      let document = DEFAULT_SITE_DOCUMENT;
      if (action.document) {
        try { document = validateSiteDocument(action.document); } catch { document = DEFAULT_SITE_DOCUMENT; }
      }
      return { ...state, present: document, hydrated: true, lastCommandError: null };
    }
    case "execute": {
      try {
        const next = action.next
          ? validateSiteDocument(action.next)
          : action.command.type === "publishing.upsertFromWriterStudio"
            ? applyUpsertFromWriterStudioCommand(state.present, action.command)
            : state.present;
        if (next === state.present) return { ...state, lastCommandError: null };
        const summary = action.command.type === "publishing.upsertFromWriterStudio"
          ? describeWriterPublishingCommand(action.command as UpsertFromWriterStudioCommand)
          : `Executed ${action.command.type}.`;
        return {
          ...state,
          past: [...state.past.slice(-29), state.present],
          present: next,
          future: [],
          lastCommandError: null,
          receipts: [...state.receipts.slice(-19), { command: action.command, source: action.source, summary, at: next.updatedAt }],
        };
      } catch (error) {
        return { ...state, lastCommandError: error instanceof Error ? error.message : "Command failed validation." };
      }
    }
    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        ...state,
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        receipts: [...state.receipts.slice(-19), { command: { type: "scene.focusSkill", skillId: previous.scene.focusedSkill }, source: action.source, summary: "Undid the previous change.", at: new Date().toISOString() }],
        lastCommandError: null,
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return { ...state, past: [...state.past, state.present], present: next, future: state.future.slice(1), lastCommandError: null };
    }
    case "selectPanel": return { ...state, selectedPanel: action.panel };
    case "reset": return { ...initialStudioState, hydrated: true };
  }
}

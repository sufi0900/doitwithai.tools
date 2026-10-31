export type TiktokVideoStyle =
  | "greenscreen-breakdown"
  | "fast-listicle"
  | "storytime-mythbust"
  | "screen-tutorial";

export interface TiktokScriptInput {
  topicOrContent: string;
  niche: string;
  videoStyle: TiktokVideoStyle;
  durationSeconds: "15" | "30" | "60";
}

export interface TiktokScriptBeat {
  timeRange: string;
  beatLabel: string;
  visualDirection: string;
  onScreenText: string;
  spokenAudio: string;
}

export interface TiktokScriptOutput {
  scrollStoppingHooks: {
    style: string;
    verbalHook: string;
    visualAction: string;
  }[];
  scriptBeats: TiktokScriptBeat[];
  tiktokSeoCaption: string;
  searchKeywords: string[];
  hashtags: string[];
  thumbnailCoverText: string;
}

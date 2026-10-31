import { ImageResponse } from "next/og";
export const alt =
  "AI prompts for SEO and content writing from Do It With AI Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        width: "100%",
        height: "100%",
        background: "#f2f5ff",
        color: "#172340",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 20,
          letterSpacing: 4,
          color: "#405acb",
          marginBottom: 32,
        }}
      >
        THE PROMPT WORKBENCH
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.1,
        }}
      >
        Better inputs.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.1,
          color: "#5271ff",
        }}
      >
        More useful answers.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 26,
          marginTop: 32,
          color: "#56637b",
        }}
      >
        AI prompts for SEO and content writing
      </div>
      <div style={{ display: "flex", fontSize: 20, marginTop: 50 }}>
        DO IT WITH AI TOOLS · LIBRARY PREVIEW
      </div>
    </div>,
    size,
  );
}

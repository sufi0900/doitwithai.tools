import { ImageResponse } from "next/og";
import { getPublicationSnapshot } from "@/features/website-builder/lib/publication-snapshot";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await getPublicationSnapshot(params.slug);
  const name = item?.document.identity.name ?? "DoItWithAI Studio";
  const role =
    item?.document.identity.role ?? "Authority Website & Interactive Journal";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg, #050816 0%, #0f172a 55%, #1e1b4b 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#818cf8",
          }}
        >
          DOITWITHAI STUDIO · /p/{params.slug}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.08 }}>
            {name}
          </div>
          <div style={{ fontSize: 30, color: "#cbd5e1", lineHeight: 1.35 }}>
            {role}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

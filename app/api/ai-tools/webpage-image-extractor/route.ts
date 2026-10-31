import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { publicUrl } from "@/features/backlink-verifier/fetch.server";
import { zipStored } from "@/features/outreach-email/docx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const zipRequestSchema = z.object({
  pageUrl: z.string().trim().max(2048).default(""),
  images: z
    .array(
      z.object({
        src: z.string().trim().min(4).max(2048),
        filename: z.string().trim().min(1).max(160),
        alt: z.string().max(500).default(""),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(request: NextRequest) {
  let input: z.infer<typeof zipRequestSchema>;
  try {
    input = zipRequestSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Select at least 1 image to package into a .ZIP archive.",
        },
      },
      { status: 422 },
    );
  }

  const entries: Record<string, string | Uint8Array> = {};
  const manifestLines: string[] = [
    '"Filename","Source Image URL","Alt Text","Download Status"',
  ];

  await Promise.all(
    input.images.map(async (item, idx) => {
      try {
        publicUrl(item.src);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 7000);
        const res = await fetch(item.src, {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; DoItWithAIImageExtractor/1.0)",
          },
        });
        clearTimeout(timer);
        if (res.ok) {
          const buf = new Uint8Array(await res.arrayBuffer());
          if (buf.byteLength > 0 && buf.byteLength <= 8_000_000) {
            const safeName =
              item.filename.replace(/[^a-zA-Z0-9._-]/g, "-") ||
              `image-${idx + 1}.jpg`;
            entries[safeName] = buf;
            manifestLines.push(
              `"${safeName}","${item.src}","${item.alt.replace(/"/g, '""')}","INCLUDED (${buf.byteLength} bytes)"`,
            );
            return;
          }
        }
        manifestLines.push(
          `"${item.filename}","${item.src}","${item.alt.replace(/"/g, '""')}","EXTERNAL_LINK_ONLY"`,
        );
      } catch {
        manifestLines.push(
          `"${item.filename}","${item.src}","${item.alt.replace(/"/g, '""')}","EXTERNAL_LINK_ONLY"`,
        );
      }
    }),
  );

  entries["00-images-manifest.csv"] = manifestLines.join("\r\n");
  const zipBytes = zipStored(entries);

  return new NextResponse(Buffer.from(zipBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="webpage-images-bundle.zip"',
    },
  });
}

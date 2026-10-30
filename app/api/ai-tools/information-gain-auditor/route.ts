import { NextRequest, NextResponse } from "next/server";
import { fetchPublic, publicUrl } from "@/features/backlink-verifier/fetch.server";
import { evaluateInformationGain } from "@/features/information-gain-auditor/model";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      topic?: string;
      yourUrl?: string;
      yourContent?: string;
      competitorUrls?: string[];
      competitorContent?: string;
    };

    const topic = (body.topic || "").trim() || "SEO & Content Strategy";
    let yourHtmlOrText = (body.yourContent || "").trim();
    let resolvedYourUrl = (body.yourUrl || "").trim();

    if (!yourHtmlOrText && resolvedYourUrl) {
      const normalized = /^https?:\/\//i.test(resolvedYourUrl)
        ? resolvedYourUrl
        : `https://${resolvedYourUrl}`;
      const fetched = await fetchPublic(publicUrl(normalized).href, {
        timeout: 15000,
        bytes: 5000000,
      });
      if (fetched.status < 200 || fetched.status >= 300 || !fetched.html.trim()) {
        return NextResponse.json(
          {
            error: {
              message: `Could not fetch your article URL (HTTP ${fetched.status}). Try pasting your article text or HTML instead.`,
            },
          },
          { status: 422 },
        );
      }
      yourHtmlOrText = fetched.html;
      resolvedYourUrl = fetched.url;
    }

    if (!yourHtmlOrText) {
      return NextResponse.json(
        {
          error: {
            message: "Provide a public article URL or paste your article draft.",
          },
        },
        { status: 400 },
      );
    }

    const competitorContents: string[] = [];
    if (body.competitorContent && body.competitorContent.trim()) {
      competitorContents.push(body.competitorContent.trim());
    }

    const compUrls = Array.isArray(body.competitorUrls)
      ? body.competitorUrls
          .map((u) => (typeof u === "string" ? u.trim() : ""))
          .filter(Boolean)
          .slice(0, 3)
      : [];

    if (compUrls.length > 0) {
      const results = await Promise.allSettled(
        compUrls.map(async (rawUrl) => {
          const norm = /^https?:\/\//i.test(rawUrl)
            ? rawUrl
            : `https://${rawUrl}`;
          const f = await fetchPublic(publicUrl(norm).href, {
            timeout: 12000,
            bytes: 5000000,
          });
          if (f.status >= 200 && f.status < 300 && f.html.trim()) {
            return f.html;
          }
          throw new Error(`HTTP ${f.status}`);
        }),
      );
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) {
          competitorContents.push(r.value);
        }
      }
    }

    const report = evaluateInformationGain({
      yourContent: yourHtmlOrText,
      competitorContents: competitorContents.length ? competitorContents : [""],
      topic,
      sourceUrl: resolvedYourUrl || undefined,
    });

    return NextResponse.json({ report });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not complete Information Gain audit. Try pasting your article text.";
    return NextResponse.json({ error: { message } }, { status: 422 });
  }
}

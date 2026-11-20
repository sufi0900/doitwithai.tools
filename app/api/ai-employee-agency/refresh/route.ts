import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { agencyWorkspace } from "@/lib/ai-employee-agency/workspace.server";
import {
  fieldFindings,
  repairFields,
  inspectPage,
  type PageFields,
} from "@/lib/ai-agency/refresh.server";

export async function GET(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const { data: brand, error } = await ws.db
    .from("tenant_brand_dna")
    .select("domain,profile,approved_at")
    .eq("workspace_id", ws.id)
    .maybeSingle();
  if (error || !brand?.approved_at)
    return NextResponse.json(
      { error: "Approve the website knowledge base first." },
      { status: 409 },
    );
  const target = new URL(request.url).searchParams.get("url");
  if (!target) {
    const scan = await ws.db
      .from("agency_site_scans")
      .select("cycle,report")
      .eq("workspace_id", ws.id)
      .eq("domain", brand.domain)
      .order("cycle", { ascending: false })
      .limit(1)
      .maybeSingle();
    return scan.error
      ? NextResponse.json(
          { error: "Scan history unavailable." },
          { status: 503 },
        )
      : NextResponse.json({ scan: scan.data });
  }
  if (!brand.profile.pages?.some((p: { url: string }) => p.url === target))
    return NextResponse.json(
      { error: "Choose an approved page." },
      { status: 400 },
    );
  const match =
    /^https:\/\/doitwithai\.tools\/p\/([a-z0-9-]+)\/(pages|blog)\/([a-z0-9-]+)$/.exec(
      target,
    );
  if (match && brand.profile.source === "internal_direct") {
    const pub = await ws.db
      .from("website_publications")
      .select("id,document")
      .eq("owner_id", ws.id)
      .eq("slug", match[1])
      .is("superseded_at", null)
      .maybeSingle();
    const item = pub.data?.document.publishing?.[
      match[2] === "blog" ? "posts" : "pages"
    ]?.find((i: { slug: string }) => i.slug === match[3]);
    if (!item)
      return NextResponse.json(
        { error: "Published page changed. Refresh the site inventory." },
        { status: 409 },
      );
    const fields: PageFields = {
      heading: item.title,
      title: item.seoTitle || "",
      description: item.seoDescription || "",
    };
    return NextResponse.json({
      fields,
      suggested: repairFields(
        fields,
        item.excerpt ||
          item.blocks?.find((b: { type: string }) => b.type === "paragraph")
            ?.text ||
          "",
      ),
      findings: fieldFindings(fields),
      publication: pub.data!.id,
    });
  }
  try {
    const result = await inspectPage(target, brand.domain);
    return result.fields
      ? NextResponse.json(result)
      : NextResponse.json(
          { error: "Page returned HTTP " + result.status },
          { status: 422 },
        );
  } catch {
    return NextResponse.json(
      { error: "Page could not be read within the approved crawl policy." },
      { status: 422 },
    );
  }
}

export async function POST(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const input = await request.json().catch(() => null);
  if (
    !input?.publication ||
    typeof input.url !== "string" ||
    !input.before ||
    !input.after
  )
    return NextResponse.json(
      { error: "Review the existing page first." },
      { status: 400 },
    );
  const fields = (x: PageFields) => ({
    title: x.heading,
    seoTitle: x.title,
    seoDescription: x.description,
  });
  const saved = await ws.db.rpc("agency_refresh_page", {
    target: input.url,
    observed: input.publication,
    previous: fields(input.before),
    proposed: fields(input.after),
  });
  if (saved.error)
    return NextResponse.json(
      {
        error:
          "Could not apply this change. Check field lengths and reload to compare the latest page.",
      },
      { status: 409 },
    );
  revalidatePath(new URL(input.url).pathname);
  revalidatePath(
    new URL(input.url).pathname.split("/").slice(0, 3).join("/"),
    "layout",
  );
  return NextResponse.json({ ok: true });
}

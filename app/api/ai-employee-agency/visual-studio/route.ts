import { NextResponse } from "next/server";
import {
  agencyWorkspace,
  requireApprovedWebsite,
} from "@/lib/ai-employee-agency/workspace.server";

const bucket = "agency-visual-references";
export async function GET(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const storage = ws.db.storage.from(bucket);
  const { data, error } = await storage.list(ws.id, {
    limit: 40,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error)
    return NextResponse.json(
      {
        error:
          "Reference storage unavailable. Check the visual reference migration.",
      },
      { status: 503 },
    );
  const files = (data || []).filter((f) => f.id);
  const signed = files.length
    ? await storage.createSignedUrls(
        files.map((f) => ws.id + "/" + f.name),
        3600,
      )
    : { data: [], error: null };
  if (signed.error)
    return NextResponse.json(
      { error: "Could not open private references." },
      { status: 503 },
    );
  return NextResponse.json({
    references: (signed.data || []).map((f, i) => ({
      name: files[i].name.slice(37),
      url: f.signedUrl,
    })),
    aiAvailable: Boolean(
      process.env.AGENCY_IMAGE_ACCOUNT_ID && process.env.AGENCY_IMAGE_API_TOKEN,
    ),
  });
}

export async function POST(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const blocked = await requireApprovedWebsite(ws);
  if (blocked) return blocked;
  if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    const file = (await request.formData()).get("reference");
    if (
      !(file instanceof File) ||
      file.size > 2097152 ||
      !["image/png", "image/jpeg", "image/webp"].includes(file.type)
    )
      return NextResponse.json(
        { error: "Choose a PNG, JPEG or WebP reference up to 2 MiB." },
        { status: 400 },
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    const magic = Array.from(bytes.slice(0, 12));
    const valid =
      file.type === "image/png"
        ? magic.slice(0, 8).join() === "137,80,78,71,13,10,26,10"
        : file.type === "image/jpeg"
          ? magic.slice(0, 3).join() === "255,216,255"
          : String.fromCharCode(...magic.slice(0, 4), ...magic.slice(8, 12)) ===
            "RIFFWEBP";
    if (!valid)
      return NextResponse.json(
        { error: "Unrecognized image format." },
        { status: 400 },
      );
    const name =
      crypto.randomUUID() +
      "-" +
      file.name.replace(/[^\w.-]+/g, "-").slice(-90);
    const upload = await ws.db.storage
      .from(bucket)
      .upload(ws.id + "/" + name, bytes, { contentType: file.type });
    return upload.error
      ? NextResponse.json(
          { error: "Reference upload failed." },
          { status: 503 },
        )
      : NextResponse.json({ ok: true });
  }
  const input = await request.json().catch(() => null);
  if (
    input?.optIn !== true ||
    typeof input.prompt !== "string" ||
    !input.prompt.trim() ||
    input.prompt.length > 500
  )
    return NextResponse.json(
      { error: "Enter an image brief and enable AI generation." },
      { status: 400 },
    );
  const account = process.env.AGENCY_IMAGE_ACCOUNT_ID,
    token = process.env.AGENCY_IMAGE_API_TOKEN;
  if (!account || !token)
    return NextResponse.json(
      { error: "Image provider is unavailable in this environment." },
      { status: 503 },
    );
  const brand = await ws.db
    .from("tenant_brand_dna")
    .select("profile")
    .eq("workspace_id", ws.id)
    .not("approved_at", "is", null)
    .single();
  if (brand.error)
    return NextResponse.json(
      { error: "Approved brand unavailable." },
      { status: 409 },
    );
  const prompt = (
    input.prompt +
    "\nBrand palette: " +
    JSON.stringify(brand.data.profile.brand_colors || {})
  ).slice(0, 2048);
  const response = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/" +
      encodeURIComponent(account) +
      "/ai/run/@cf/black-forest-labs/flux-1-schnell",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(30000),
    },
  ).catch(() => null);
  if (!response?.ok)
    return NextResponse.json(
      { error: "Image provider did not complete the request." },
      { status: 502 },
    );
  if (response.headers.get("content-type")?.startsWith("image/jpeg")) {
    return NextResponse.json({
      image:
        "data:image/jpeg;base64," +
        Buffer.from(await response.arrayBuffer()).toString("base64"),
    });
  }
  const result = await response.json().catch(() => null);
  if (typeof result?.result?.image !== "string")
    return NextResponse.json({ error: "No image returned." }, { status: 502 });
  return NextResponse.json({
    image: "data:image/jpeg;base64," + result.result.image,
  });
}

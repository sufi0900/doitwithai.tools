import { NextResponse } from "next/server";
import { z } from "zod";
import { bearerHash, connectionAdmin } from "@/features/website-builder/lib/external-connection";
import { applySiteCommand, formatCommandError, siteCommandSchema } from "@/features/website-builder/domain/commands";
import { validateSiteDocument } from "@/features/website-builder/domain/site-document";

export const maxDuration = 30;


export const runtime = "nodejs";
const bodySchema = z.object({projectId:z.string().uuid(),expectedRevision:z.number().int().nonnegative(),command:siteCommandSchema});
const allowed = new Set(["identity.set","content.setAbout","content.setContact","skill.add","skill.update","skill.remove","experience.add","experience.update","experience.remove","education.add","education.update","education.remove","project.add","project.update","project.remove","publishing.add","publishing.update","block.add","block.update","block.remove","opportunity.set"]);
export async function POST(request: Request) {
  const hash = bearerHash(request);
  if (!hash) return NextResponse.json({error:"A private connection key is required."},{status:401});
  const raw = await request.text();
  if (raw.length > 12000) return NextResponse.json({error:"Request too large."},{status:413});
  let body: unknown;
  try { body = JSON.parse(raw || "null"); } catch { return NextResponse.json({error:"Invalid JSON."},{status:400}); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success || !allowed.has(parsed.data.command.type)) return NextResponse.json({error:"Invalid or restricted change. Publishing, media, and visitor knowledge require owner review in Studio."},{status:400});
  try {
    const admin = connectionAdmin();
    const {data:claim} = await admin.rpc("claim_external_website_connection_use",{p_hash:hash});
    if (!claim) return NextResponse.json({error:"Connection unavailable or daily limit reached."},{status:429});
    const {data,error} = await admin.rpc("external_website_connection_project",{p_hash:hash});
    if (error || !data?.length || data[0].project_id !== parsed.data.projectId) return NextResponse.json({error:"Connection cannot edit this project."},{status:403});
    if (data[0].revision !== parsed.data.expectedRevision) return NextResponse.json({error:"Project changed. Read latest revision and retry after reviewing differences.",revision:data[0].revision},{status:409});
    let next;
    try { next=applySiteCommand(validateSiteDocument(data[0].document),parsed.data.command); }
    catch(cause) { return NextResponse.json({error:formatCommandError(cause)},{status:400}); }
    const {data:revision,error:saveError}=await admin.rpc("save_external_website_connection_project",{p_hash:hash,p_document:next,p_expected_revision:parsed.data.expectedRevision});
    if (saveError) return NextResponse.json({error:saveError.message.includes("revision_conflict") ? "Project changed. Read latest revision and retry." : "Could not save change."},{status:saveError.message.includes("revision_conflict") ? 409 : 500});
    return NextResponse.json({saved:true,revision,command:parsed.data.command.type,note:"Saved as a draft revision. Review in Studio and publish when ready."},{headers:{"Cache-Control":"no-store"}});
  } catch { return NextResponse.json({error:"Connection unavailable."},{status:503}); }
}

import { NextResponse } from "next/server";
import { bearerHash, connectionAdmin } from "@/features/website-builder/lib/external-connection";
import { validateSiteDocument } from "@/features/website-builder/domain/site-document";

export const maxDuration = 30;


export const runtime = "nodejs";
export async function GET(request: Request) {
  const hash = bearerHash(request);
  if (!hash) return NextResponse.json({error:"A private connection key is required."},{status:401});
  try {
    const admin = connectionAdmin();
    const { data: claim } = await admin.rpc("claim_external_website_connection_use",{p_hash:hash});
    if (!claim) return NextResponse.json({error:"Connection unavailable or daily limit reached."},{status:429});
    const {data,error} = await admin.rpc("external_website_connection_project",{p_hash:hash});
    if (error || !data?.length) return NextResponse.json({error:"Connection not found."},{status:404});
    const document = validateSiteDocument(data[0].document);
    return NextResponse.json({projectId:data[0].project_id,revision:data[0].revision,
      identity:document.identity,about:document.content.about,skills:document.skills,
      experience:document.content.experience,education:document.content.education,projects:document.content.projects,
      pages:document.publishing.pages.map(({id,title,slug,status,blocks})=>({id,title,slug,status,blocks})),
      posts:document.publishing.posts.map(({id,title,slug,status,excerpt,blocks})=>({id,title,slug,status,excerpt,blocks})),
      opportunity: { status:document.opportunity.status,title:document.opportunity.title,brief:document.opportunity.brief }
    },{headers:{"Cache-Control":"no-store"}});
  } catch { return NextResponse.json({error:"Connection unavailable."},{status:503}); }
}

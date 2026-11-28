import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createSupabaseServerClient } from "@/features/website-builder/lib/supabase/server";
import { connectionHash } from "@/features/website-builder/lib/external-connection";

export const maxDuration = 30;


export const runtime = "nodejs";
async function owner(projectId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("website_projects").select("id").eq("owner_id",user.id).eq("id",projectId).maybeSingle();
  return data ? { supabase, user } : null;
}
export async function GET(_: Request,{ params }: { params: { projectId: string } }) {
  const { projectId } = params; const session = await owner(projectId);
  if (!session) return NextResponse.json({error:"Project not found."},{status:404});
  const { data,error } = await session.supabase.from("website_content_connections").select("id,label,created_at").eq("project_id",projectId).is("revoked_at",null).order("created_at",{ascending:false});
  return error ? NextResponse.json({error:error.message},{status:500}) : NextResponse.json({connections:data},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request: Request,{ params }: { params: { projectId: string } }) {
  const { projectId } = params; const session = await owner(projectId);
  if (!session) return NextResponse.json({error:"Project not found."},{status:404});
  const label = (await request.json().catch(() => null))?.label;
  if (typeof label !== "string" || !label.trim() || label.length > 60) return NextResponse.json({error:"Choose a label up to 60 characters."},{status:400});
  const { count } = await session.supabase.from("website_content_connections").select("id",{head:true,count:"exact"}).eq("project_id",projectId);
  if ((count ?? 0) >= 3) return NextResponse.json({error:"Revoke a connection before creating another."},{status:409});
  const key = `vf_${randomBytes(32).toString("hex")}`;
  const { data,error } = await session.supabase.from("website_content_connections").insert({owner_id:session.user.id,project_id:projectId,label:label.trim(),key_hash:connectionHash(key)}).select("id,label,created_at").single();
  return error ? NextResponse.json({error:error.message},{status:500}) : NextResponse.json({connection:data,key},{status:201,headers:{"Cache-Control":"no-store"}});
}
export async function DELETE(request: Request,{ params }: { params: { projectId: string } }) {
  const { projectId } = params; const session = await owner(projectId);
  if (!session) return NextResponse.json({error:"Project not found."},{status:404});
  const id = (await request.json().catch(() => null))?.id;
  if (typeof id !== "string" || !/^[a-f0-9-]{36}$/i.test(id)) return NextResponse.json({error:"Invalid connection."},{status:400});
  const {error} = await session.supabase.from("website_content_connections").delete().eq("id",id).eq("project_id",projectId);
  return error ? NextResponse.json({error:error.message},{status:500}) : NextResponse.json({revoked:true});
}

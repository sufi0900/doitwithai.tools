begin;
create table public.agency_site_scans (
  workspace_id uuid not null references public.agency_workspaces on delete cascade,
  cycle date not null, domain text not null, revision integer not null, report jsonb not null,
  primary key(workspace_id,cycle)
);
alter table public.agency_site_scans enable row level security;
revoke all on public.agency_site_scans from public,anon,authenticated;
grant select on public.agency_site_scans to authenticated;
grant all on public.agency_site_scans to service_role;
create policy read_own_scan on public.agency_site_scans for select to authenticated using(workspace_id=(select auth.uid()));

-- Patch the same item's fields in draft and live documents in one transaction.
create function public.agency_refresh_page(target text, observed uuid, previous jsonb, proposed jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare
  b public.tenant_brand_dna; pub public.website_publications; project public.website_projects;
  route text[]; collection text; draft_item jsonb; live_item jsonb; draft_pos integer; live_pos integer;
  key text; next_rev integer;
begin
  select * into strict b from public.tenant_brand_dna where workspace_id=auth.uid() and approved_at is not null;
  if b.profile->>'source' is distinct from 'internal_direct' or not exists(
    select from jsonb_array_elements(b.profile->'pages') p where p->>'url'=target) then raise exception 'Unapproved target'; end if;
  route:=regexp_match(target,'^https://doitwithai\.tools/p/([a-z0-9-]+)/(pages|blog)/([a-z0-9-]+)$');
  if route is null then raise exception 'Unsupported builder URL'; end if;
  collection:=case route[2] when 'blog' then 'posts' else 'pages' end;
  select * into strict pub from public.website_publications where id=observed and owner_id=auth.uid() and slug=route[1] and superseded_at is null;
  select * into strict project from public.website_projects where id=pub.project_id and owner_id=auth.uid() for update;
  select item,pos-1 into strict live_item,live_pos from jsonb_array_elements(pub.document#>array['publishing',collection]) with ordinality t(item,pos) where item->>'slug'=route[3];
  select item,pos-1 into strict draft_item,draft_pos from jsonb_array_elements(project.document#>array['publishing',collection]) with ordinality t(item,pos) where item->>'id'=live_item->>'id' and item->>'slug'=route[3];
  foreach key in array array['title','seoTitle','seoDescription'] loop
    if jsonb_typeof(proposed->key) is distinct from 'string' or length(trim(proposed->>key)) not between 1 and
        (case key when 'title' then 120 when 'seoTitle' then 70 else 170 end) then raise exception 'Invalid field'; end if;
    if coalesce(live_item->>key,'') is distinct from previous->>key or coalesce(draft_item->>key,'') is distinct from previous->>key then raise exception 'Page changed'; end if;
    pub.document:=jsonb_set(pub.document,array['publishing',collection,live_pos::text,key],proposed->key);
    project.document:=jsonb_set(project.document,array['publishing',collection,draft_pos::text,key],proposed->key);
  end loop;
  project.document:=project.document || jsonb_build_object('revision',project.revision+1,'updatedAt',now());
  next_rev:=public.save_website_project(project.id,project.document,project.revision,'agency-refresh');
  perform public.publish_website_snapshot(project.id,pub.slug,next_rev,pub.document || jsonb_build_object('revision',next_rev,'updatedAt',now()),pub.id);
end $$;
revoke all on function public.agency_refresh_page(text,uuid,jsonb,jsonb) from public,anon;
grant execute on function public.agency_refresh_page(text,uuid,jsonb,jsonb) to authenticated;
create function public.agency_record_site_scan(owner uuid, observed_revision integer, cycle_day date, scan_domain text, scan jsonb)
returns void language plpgsql set search_path='' as $$
declare dna public.tenant_brand_dna; kept jsonb; links jsonb;
begin
  select * into strict dna from public.tenant_brand_dna where workspace_id=owner and domain=scan_domain and approved_at is not null for update;
  if dna.revision<>observed_revision or exists(select from public.agency_site_scans where workspace_id=owner and cycle>cycle_day) then return; end if;
  insert into public.agency_site_scans values(owner,cycle_day,scan_domain,observed_revision,scan) on conflict do nothing;
  if not found or scan->>'coverage'<>'complete' or jsonb_array_length(scan->'inventory')=0 then return; end if;
  select coalesce(jsonb_agg(p order by n),'[]') into kept from jsonb_array_elements(dna.profile->'pages') with ordinality t(p,n) where (scan->'inventory') ? (p->>'url');
  select coalesce(jsonb_agg(p order by n),'[]') into links from jsonb_array_elements(dna.profile->'live_sitemap_urls') with ordinality t(p,n) where (scan->'inventory') ? coalesce(p->>'url',p#>>'{}');
  if kept is distinct from dna.profile->'pages' or links is distinct from dna.profile->'live_sitemap_urls' then
    update public.tenant_brand_dna set profile=profile || jsonb_build_object('pages',kept,'live_sitemap_urls',links) where workspace_id=owner;
  end if;
end $$;
revoke all on function public.agency_record_site_scan(uuid,integer,date,text,jsonb) from public,anon,authenticated;
grant execute on function public.agency_record_site_scan(uuid,integer,date,text,jsonb) to service_role;
create function public.agency_store_builder_post(owner uuid,review uuid,post jsonb,cycle_day date)
returns jsonb language plpgsql set search_path='' as $$
declare b public.tenant_brand_dna; q jsonb; pub public.website_publications; project public.website_projects;
  builder_slug text; live boolean:=post->>'status'='published'; target text; receipt jsonb;
begin
  select * into strict b from public.tenant_brand_dna where workspace_id=owner and approved_at is not null for share;
  select payload into strict q from public.qa_audit_logs where workspace_id=owner and id=review for share;
  if b.profile->>'source' is distinct from 'internal_direct' or q->>'disposition' is distinct from 'approved'
     or q->>'revision' is distinct from b.revision::text or q#>>'{article,slug}' is distinct from post->>'slug'
     or post->>'id' is distinct from review::text or (coalesce(b.profile->>'is_ymyl','true')<>'false' and q->>'signedBy' is distinct from owner::text)
     then raise exception 'Invalid reviewed snapshot'; end if;
  insert into public.agency_deliveries(workspace_id,review_id,slug,cycle_date)
    values(owner,review,post->>'slug',cycle_day) on conflict do nothing;
  if not found then
    select d.receipt into receipt from public.agency_deliveries d where d.workspace_id=owner and d.review_id=review;
    if receipt is null then raise exception 'Delivery already reserved'; end if;
    return receipt;
  end if;
  builder_slug:=substring(b.domain from '^https://doitwithai[.]tools/p/([a-z0-9-]+)/?$');
  select * into strict pub from public.website_publications where owner_id=owner and slug=builder_slug and superseded_at is null;
  select * into strict project from public.website_projects where owner_id=owner and id=pub.project_id for update;
  perform 1 from public.website_publications where id=pub.id and superseded_at is null for update;
  if not found then raise exception 'Publication changed'; end if;
  if project.document->'opportunity' is distinct from pub.document->'opportunity' then raise exception 'Review pending project visibility changes'; end if;
  if exists(select from jsonb_array_elements((project.document#>'{publishing,posts}') || (pub.document#>'{publishing,posts}')) p where p->>'slug'=post->>'slug')
    or jsonb_array_length(project.document#>'{publishing,posts}')>=24 or jsonb_array_length(pub.document#>'{publishing,posts}')>=24 then raise exception 'Existing slug or collection full'; end if;
  project.revision:=project.revision+1;
  project.document:=jsonb_set(project.document,'{publishing,posts}',(project.document#>'{publishing,posts}') || jsonb_build_array(post)) || jsonb_build_object('revision',project.revision,'updatedAt',now());
  update public.website_projects set document=project.document,revision=project.revision,updated_at=now() where id=project.id;
  insert into public.website_revisions(project_id,owner_id,revision,document,source) values(project.id,owner,project.revision,project.document,'agency-article');
  if live then
    pub.document:=jsonb_set(pub.document,'{publishing,posts}',(pub.document#>'{publishing,posts}') || jsonb_build_array(post)) || jsonb_build_object('revision',project.revision,'updatedAt',now());
    update public.website_publications set superseded_at=now() where id=pub.id;
    insert into public.website_publications(project_id,owner_id,slug,revision,document) values(project.id,owner,builder_slug,project.revision,pub.document);
  end if;
  target:=rtrim(b.domain,'/') || '/blog/' || (post->>'slug');
  receipt:=jsonb_build_object('ok',true,'platformId','internal-doitwithai','platformDisplayName','Website Builder',
    'executedMode','live-cms-api','postStatus',post->>'status','publishedOrStagedUrl',case when live then target else '' end,
    'externalPostId',review,'timestampIso',now(),'diagnosticMessage','Builder saved the reviewed article as ' || (post->>'status'),'curlEquivalentSnippet','');
  perform public.agency_confirm_delivery(owner,review,receipt);
  return receipt;
end $$;
revoke all on function public.agency_store_builder_post(uuid,uuid,jsonb,date) from public,anon,authenticated;
grant execute on function public.agency_store_builder_post(uuid,uuid,jsonb,date) to service_role;
create function public.agency_claim_channel_delivery(owner uuid, entry uuid, automatic boolean)
returns jsonb language plpgsql set search_path='' as $$
declare current_dna public.tenant_brand_dna; draft jsonb;
begin
  select * into strict current_dna from public.tenant_brand_dna where workspace_id=owner and approved_at is not null for share;
  select payload into strict draft from public.social_ledger where workspace_id=owner and id=entry for update;
  if draft->>'status'='published' then return draft; end if;
  if draft->>'status' not in ('draft','needs_review') then raise exception 'Delivery already claimed'; end if;
  if automatic and (draft->>'status'<>'draft' or coalesce(current_dna.profile->>'is_ymyl','true')<>'false' or not (
    exists(select from public.qa_audit_logs where workspace_id=owner and id::text=draft->>'review' and payload->>'revision'=current_dna.revision::text and payload->>'disposition'='approved')
    or exists(select from public.agency_specialist_work where workspace_id=owner and id::text=draft->>'work_id' and strategy_version=coalesce((current_dna.profile->>'strategy_bus_version')::int,1))
  )) then
    update public.social_ledger set payload=draft || '{"status":"needs_review"}'::jsonb where workspace_id=owner and id=entry;
    return null;
  end if;
  update public.social_ledger set payload=draft || '{"status":"sending"}'::jsonb where workspace_id=owner and id=entry;
  return draft;
end $$;
revoke all on function public.agency_claim_channel_delivery(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.agency_claim_channel_delivery(uuid,uuid,boolean) to service_role;
commit;

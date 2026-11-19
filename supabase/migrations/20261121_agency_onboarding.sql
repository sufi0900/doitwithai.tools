begin;
alter table public.tenant_brand_dna add column revision integer not null default 0;
create function public.agency_bump_brand_revision() returns trigger language plpgsql as $$
begin
  new.revision := old.revision + 1;
  return new;
end $$;
create trigger bump_brand_revision before update on public.tenant_brand_dna
for each row execute function public.agency_bump_brand_revision();

-- Re-registering the same site must preserve the reviewed profile and its evidence.
create or replace function public.agency_register_website(site text, goal text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or length(site)>2048 or site !~ '^https?://' then raise exception 'Invalid registration'; end if;
  insert into public.tenant_brand_dna(workspace_id,domain,profile)
    values(auth.uid(),site,jsonb_build_object('goal',left(goal,500))) on conflict do nothing;
  if not exists(select from public.tenant_brand_dna where workspace_id=auth.uid() and domain=site)
    then raise exception 'Existing website requires review'; end if;
end $$;

create unique index agency_topic_once on public.content_items(workspace_id,lower(trim(content->>'topic')))
where content ? 'topic';

create function public.agency_queue_reviewed_topic(owner uuid, version integer, item jsonb)
returns uuid language plpgsql set search_path = '' as $$
declare item_id uuid;
begin
  perform 1 from public.tenant_brand_dna where workspace_id=owner and revision=version and approved_at is not null for share;
  if not found then raise exception 'Knowledge base changed'; end if;
  insert into public.content_items(workspace_id,status,content) values(owner,'queued',item)
  on conflict do nothing returning id into item_id;
  if item_id is null then
    select id into item_id from public.content_items where workspace_id=owner and lower(trim(content->>'topic'))=lower(trim(item->>'topic'));
  end if;
  return item_id;
end $$;
revoke all on function public.agency_queue_reviewed_topic(uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.agency_queue_reviewed_topic(uuid,integer,jsonb) to service_role;
commit;

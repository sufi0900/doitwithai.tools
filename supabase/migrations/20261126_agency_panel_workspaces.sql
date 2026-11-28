begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('agency-visual-references','agency-visual-references',false,2097152,array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
create policy agency_reference_read on storage.objects for select to authenticated
using(bucket_id='agency-visual-references' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy agency_reference_upload on storage.objects for insert to authenticated
with check(bucket_id='agency-visual-references' and (storage.foldername(name))[1]=(select auth.uid())::text);
create unique index agency_channel_work_once on public.social_ledger(workspace_id,(payload->>'work_id'))
  where payload ? 'work_id';
create function public.agency_save_channel_draft(work uuid)
returns void language plpgsql security definer set search_path='' as $$
declare entry public.agency_specialist_work;
begin
  select w.* into strict entry from public.agency_specialist_work w join public.tenant_brand_dna b using(workspace_id)
    where w.id=work and w.workspace_id=auth.uid() and b.approved_at is not null
      and w.strategy_version=coalesce((b.profile->>'strategy_bus_version')::integer,1)
      and w.specialist in ('pinterest','linkedin','facebook','video') for share;
  insert into public.social_ledger(workspace_id,payload) values(entry.workspace_id,jsonb_build_object(
    'work_id',entry.id,'channel',entry.specialist,'title',entry.task,'description',entry.result,'status','draft'))
    on conflict do nothing;
end $$;
revoke all on function public.agency_save_channel_draft(uuid) from public,anon;
grant execute on function public.agency_save_channel_draft(uuid) to authenticated;
commit;

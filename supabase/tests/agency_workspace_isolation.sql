-- Run with a privileged test connection after applying the agency migration.
begin;
insert into auth.users(id) values ('aaaaaaaa-1234-4000-8000-000000000001'), ('aaaaaaaa-1234-4000-8000-000000000002');
insert into public.agency_workspaces(id) select id from auth.users where id in ('aaaaaaaa-1234-4000-8000-000000000001','aaaaaaaa-1234-4000-8000-000000000002');
insert into public.content_items(workspace_id,status) values ('aaaaaaaa-1234-4000-8000-000000000001','ready'), ('aaaaaaaa-1234-4000-8000-000000000002','published');
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-1234-4000-8000-000000000001',true);
do $test$
begin
  if (select count(*) from public.content_items) <> 1 or exists(select from public.content_items where status='published') then
    raise exception 'Tenant isolation failed';
  end if;
  begin
    insert into public.token_usage_ledger(workspace_id,operation,provider,model) values(auth.uid(),'forged','test','test');
    raise exception 'Client could write metered usage';
  exception when insufficient_privilege then null;
  end;
  perform public.agency_register_website('https://example.org','Review content');
  if (select count(*) from public.tenant_brand_dna where approved_at is null) <> 1 then
    raise exception 'Website registration must await approval';
  end if;
end $test$;
select set_config('request.jwt.claim.sub','aaaaaaaa-1234-4000-8000-000000000002',true);
do $test$
begin
  if exists(select from public.tenant_brand_dna) or (select count(*) from public.content_items where status='published') <> 1 then
    raise exception 'Second tenant isolation failed';
  end if;
end $test$;
rollback;

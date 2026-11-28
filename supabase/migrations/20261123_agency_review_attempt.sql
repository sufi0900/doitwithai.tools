-- One scorecard per writer draft, knowledge revision and attempt, even on concurrent submissions.
create unique index agency_qa_attempt on public.qa_audit_logs
  (workspace_id,(payload->>'workId'),(payload->>'revision'),(payload->>'attempt'))
  where payload ? 'workId';

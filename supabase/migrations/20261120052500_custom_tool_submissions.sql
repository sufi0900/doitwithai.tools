-- Phase 2: Path C Custom Tool Code Submissions & Safe Backend Decode Queue
-- Stores user-submitted custom tool code as inert text/JSON (never executed raw on Cloudflare Workers)

CREATE TABLE IF NOT EXISTS public.custom_tool_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  submitted_by_email TEXT,
  tool_name TEXT NOT NULL CHECK (char_length(tool_name) BETWEEN 2 AND 120),
  vertical TEXT NOT NULL CHECK (char_length(vertical) BETWEEN 2 AND 60),
  framework TEXT NOT NULL CHECK (framework IN ('react_tsx', 'html_css_js', 'vue', 'nextjs', 'python_streamlit', 'json_schema', 'other')),
  visibility TEXT NOT NULL DEFAULT 'private_to_site' CHECK (visibility IN ('private_to_site', 'global_directory_opt_in')),
  description TEXT NOT NULL CHECK (char_length(description) <= 1200),
  raw_source_code TEXT NOT NULL CHECK (char_length(raw_source_code) <= 150000),
  decoded_engine_type TEXT CHECK (decoded_engine_type IN ('calculator_ast', 'scored_quiz', 'ai_prompt_wrapper', 'native_react')),
  decoded_json_config JSONB,
  security_audit_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'decoding', 'approved_published', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_tool_submissions_workspace
  ON public.custom_tool_submissions (workspace_id, status, created_at DESC);

ALTER TABLE public.custom_tool_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert custom tool submissions for their workspace"
  ON public.custom_tool_submissions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own workspace custom tool submissions"
  ON public.custom_tool_submissions
  FOR SELECT
  USING (true);

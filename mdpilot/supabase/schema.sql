-- ════════════════════════════════════════════════════════════════════════════
-- MDPilot — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- ════════════════════════════════════════════════════════════════════════════

-- ── Prompt library ──────────────────────────────────────────────────────────
create table if not exists prompt_templates (
  id uuid primary key default gen_random_uuid(),
  file_type text not null,
  role text not null default 'developer',
  skill text,
  version int not null default 1,
  content text not null,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_prompt_lookup on prompt_templates (file_type, role, is_active);

create table if not exists role_definitions (
  id uuid primary key default gen_random_uuid(),
  role text not null unique,
  scope text,
  ambiguity_level text,
  description text,
  example_signals text
);

create table if not exists skill_patterns (
  id uuid primary key default gen_random_uuid(),
  skill text not null,
  example_prompt text,
  source_doc text,
  tags text[]
);

-- ── Training loop (metadata only) ───────────────────────────────────────────
create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  role text,
  skill text,
  file_type text,
  provider text,
  tokens_before int,
  tokens_after int,
  created_at timestamptz default now()
);

create table if not exists generation_feedback (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references usage_events(id),
  kept_unedited boolean,
  edit_distance_bucket text,  -- 'none' | 'light' | 'heavy'
  thumbs text,                -- 'up' | 'down' | null
  regenerated boolean default false,
  prompt_version int,
  created_at timestamptz default now()
);

-- ── Training samples (consent only) ─────────────────────────────────────────
create table if not exists training_samples (
  id uuid primary key default gen_random_uuid(),
  consented boolean not null default false,
  pii_scrubbed_input text,
  output text,
  role text,
  file_type text,
  created_at timestamptz default now()
);

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table prompt_templates    enable row level security;
alter table role_definitions    enable row level security;
alter table skill_patterns      enable row level security;
alter table usage_events        enable row level security;
alter table generation_feedback enable row level security;
alter table training_samples    enable row level security;

-- Policies are dropped first so the whole file is safe to re-run
-- (create policy has no "if not exists" — a bare re-run aborts on 42710).

-- Public read for prompt library (anon can read active prompts)
drop policy if exists "read active prompts" on prompt_templates;
drop policy if exists "read roles"          on role_definitions;
drop policy if exists "read skills"         on skill_patterns;
create policy "read active prompts" on prompt_templates for select using (is_active = true);
create policy "read roles"          on role_definitions for select using (true);
create policy "read skills"         on skill_patterns   for select using (true);

-- Telemetry: anon can insert only (no read)
drop policy if exists "insert events"   on usage_events;
drop policy if exists "insert feedback" on generation_feedback;
drop policy if exists "insert samples"  on training_samples;
create policy "insert events"   on usage_events        for insert with check (true);
create policy "insert feedback" on generation_feedback for insert with check (true);
-- Samples: insert allowed only when consented = true
create policy "insert samples"  on training_samples    for insert with check (consented = true);

-- ── Agent Intelligence Upgrade ───────────────────────────────────────────────

create table if not exists eval_runs (
  id uuid primary key default gen_random_uuid(),
  prompt_version int,
  file_type text,
  fixture text,
  pass_rate numeric,
  avg_judge_score numeric,
  details jsonb,
  run_at timestamptz default now()
);

create table if not exists gold_examples (
  id uuid primary key default gen_random_uuid(),
  file_type text not null,
  role text not null default 'developer',
  content text not null,
  source_feedback_id uuid,
  token_count int,
  promoted_at timestamptz default now(),
  unique (file_type, role)
);

create table if not exists repo_context_cache (
  id uuid primary key default gen_random_uuid(),
  repo_key text unique not null,
  packed_summary text,
  token_count int,
  cached_at timestamptz default now()
);

alter table eval_runs          enable row level security;
alter table gold_examples      enable row level security;
alter table repo_context_cache enable row level security;

drop policy if exists "read gold examples" on gold_examples;
drop policy if exists "insert eval runs"   on eval_runs;
create policy "read gold examples" on gold_examples for select using (true);
create policy "insert eval runs"   on eval_runs     for insert with check (true);

-- ════════════════════════════════════════════════════════════════════════════
-- Prompt ranking view — run weekly to see which prompt versions perform best.
-- Higher keep_rate / thumbs_up_rate = better. Higher regen_rate = worse.
-- ════════════════════════════════════════════════════════════════════════════
create or replace view prompt_performance as
select
  ue.file_type, ue.role, gf.prompt_version,
  count(*)                                              as generations,
  avg(case when gf.kept_unedited then 1 else 0 end)     as keep_rate,
  avg(case when gf.thumbs = 'up'  then 1 else 0 end)    as thumbs_up_rate,
  avg(case when gf.regenerated   then 1 else 0 end)     as regen_rate
from usage_events ue
join generation_feedback gf on gf.event_id = ue.id
group by ue.file_type, ue.role, gf.prompt_version
order by keep_rate desc;

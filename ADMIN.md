# MDPilot — Admin Guide

Operations reference for the prompt library, learning loop, and SEO pipeline.

---

## Environment variables

### Vercel (production)

Set in **Vercel → Project → Settings → Environment Variables** (Environment: Production + Preview):

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Claude API — core generation |
| `GROQ_API_KEY` | Yes | Free Llama fallback (recommended default) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client-side Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side Supabase (admin routes, gold pipeline) |
| `ADMIN_PASSWORD` | Yes | Protects `/admin/prompts` |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://mdpilot.in` |
| `NEXT_PUBLIC_APP_NAME` | Yes | `MDPilot` |
| `NVIDIA_API_KEY` | Optional | NVIDIA NIM free-tier fallback |
| `OPENAI_API_KEY` | Optional | GPT-4o support |
| `GEMINI_API_KEY` | Optional | Gemini 2.0 Flash support |

After adding env vars, trigger a **Redeploy** (not just a push) so the build picks them up.

### GitHub Actions secrets

Set in **GitHub → get-mdpilot/MDPilot-mcp → Settings → Secrets → Actions**:

| Secret | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Used by the nightly `promote-gold-examples` job |
| `SUPABASE_SERVICE_ROLE_KEY` | Write access to `gold_examples` table |

These two are required for the nightly gold-example promotion to run. Without them the Action exits with an error on every run.

---

## Admin UI — `/admin/prompts`

**URL:** `https://mdpilot.in/admin/prompts`

Lets you edit system prompts live without redeploying. Changes are written to Supabase and take effect on the next generation request (5-minute cache TTL).

### Accessing

1. Navigate to `/admin/prompts`
2. Enter the `ADMIN_PASSWORD` → **Unlock**

### What you can do

**View prompts** — lists every row in `prompt_templates`, filterable by file type and role. Each row shows version number and `active` badge.

**Edit a prompt** — click **Edit** → modal opens with the full system prompt → change content, file type, or role → **Save new version**. Every save increments the version and marks the new row active; old versions stay in the database for history.

**Create a prompt** — click **+ New prompt** → pick file type + role → paste content → Save.

> If the list is empty, the app is running on hardcoded fallbacks from `src/lib/prompts/fallback.ts`. Seed the library first (see below).

### File types

`readme` · `agents` · `claude` · `task` · `spec` · `skill` · `design` · `contributing` · `security` · `context`

### Roles

`developer` · `sde1` · `sde2` · `sde3` · `pe` · `devops` · `qa` · `designer` · `architect` · `pm` · `security`

---

## Scripts

All scripts run from `mdpilot/`:

```bash
cd mdpilot
```

### 1. Seed the prompt library

Copies the hardcoded fallback prompts into Supabase. Run once after setting up the database.

```bash
npx tsx scripts/seed-prompts.ts
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

What it does:
- Upserts 11 roles into `role_definitions`
- Inserts all prompts from `src/lib/prompts/fallback.ts` into `prompt_templates` as `role=developer, version=1, is_active=true`

Safe to re-run — it deactivates existing active rows before inserting, so no duplicate active rows.

### 2. Promote gold examples (nightly)

Promotes top-rated user outputs into `gold_examples` for few-shot injection into future prompts.

```bash
npx tsx scripts/promote-gold-examples.ts
```

Promotion criteria:
- `thumbs = 'up'`
- `kept_unedited = true`
- `edit_distance_bucket = 'none'`

One gold example per `(file_type, role)` — most recent qualifying row wins. Upserts on conflict so the table always has the best known example per combination.

### 3. Generate SEO content

Generates static JSON files for every file-type × stack landing page. Run before deploy when adding new combos.

```bash
npx tsx scripts/generate-seo-content.ts

# Specific combos only:
npx tsx scripts/generate-seo-content.ts --only agents-md/nextjs,claude-md/python

# Regenerate even if file exists:
npx tsx scripts/generate-seo-content.ts --force
```

Output: `src/content/seo/{fileType}-{stack}.json` — never called at request time, pages are fully static.

---

## Nightly GitHub Action — `promote-gold-examples`

**File:** `.github/workflows/promote-gold-examples.yml`  
**Schedule:** 02:00 UTC daily  
**Manual trigger:** GitHub → Actions → `Nightly gold-example promotion` → **Run workflow**

The Action runs `scripts/promote-gold-examples.ts` in CI using the two GitHub Actions secrets above. Check the run logs for the summary line:

```
promoted N gold examples; table now has M rows
```

If it logs `0 candidates` every night, it means no users have submitted thumbs-up + kept-unedited feedback yet — the pool is empty. Once real usage accumulates, promotion starts automatically.

---

## Supabase tables

| Table | Purpose |
|---|---|
| `prompt_templates` | Versioned system prompts, hot-swapped without deploy |
| `role_definitions` | Role metadata (scope, ambiguity level, description) |
| `skill_patterns` | Skill tags referenced by the prompt engine |
| `usage_events` | Anonymous telemetry per generation |
| `generation_feedback` | Thumbs up/down + edit distance per output |
| `training_samples` | Consent-gated raw inputs/outputs for training |
| `gold_examples` | Promoted few-shot examples injected into prompts |
| `eval_runs` | Eval harness results (promptfoo) |
| `repo_context_cache` | Cached repo analysis results |

Schema: `mdpilot/supabase/schema.sql` — idempotent, safe to re-run.

---

## Learning loop flow

```
User generates → usage_events logged
User rates output (👍/👎) → generation_feedback logged
User consents to training → training_samples saved

Nightly Action:
  generation_feedback (thumbs=up, kept_unedited=true)
    → promote-gold-examples.ts
      → gold_examples upserted
        → fetchGoldExample() injects as few-shot into next generation
```

The loop is silent until `gold_examples` has at least one row per `(file_type, role)`. Until then, `fetchGoldExample()` returns null and generation falls back to the base prompt.

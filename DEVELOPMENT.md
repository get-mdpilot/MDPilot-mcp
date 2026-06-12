# MDPilot — Development Reference

Technical architecture, file trees, setup instructions, and engineering decisions.
For product overview and quick start see [README.md](README.md).

---

## Monorepo structure

```
md-pilot/
├── mdpilot/              # Next.js web app
└── packages/
    └── mcp/              # MCP server (npm: mdpilot-mcp)
```

---

## Web app — `mdpilot/`

```
mdpilot/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Landing — Task-led, 7 sections
│   │   ├── generate/page.tsx               # Generate mode: wizard + output
│   │   ├── task/page.tsx                   # Task mode: input + output
│   │   ├── convert/page.tsx                # Convert mode: file drop + output
│   │   ├── explain/page.tsx                # Explain mode: code → WALKTHROUGH.md
│   │   ├── image-to-prompt/page.tsx        # Image → generation prompt
│   │   ├── interview-primer/page.tsx        # Role + JD → AI coach prompt
│   │   ├── labs/page.tsx                   # Labs hub
│   │   ├── atmosphere/page.tsx             # Night Approach design study — six design decisions
│   │   ├── blog/[slug]/page.tsx            # Blog / long-form content
│   │   ├── docs/                           # Docs hub (11 pages)
│   │   │   ├── layout.tsx                  # Sidebar with 4 groups
│   │   │   ├── page.tsx                    # Overview
│   │   │   ├── getting-started/page.tsx
│   │   │   ├── task/page.tsx
│   │   │   ├── mcp/page.tsx                # MCP setup (multi-provider, setup wizard callout)
│   │   │   ├── files/page.tsx
│   │   │   ├── token-optimizer/page.tsx
│   │   │   ├── drift/page.tsx
│   │   │   ├── generate/page.tsx
│   │   │   ├── explain/page.tsx
│   │   │   ├── convert/page.tsx
│   │   │   ├── image-to-prompt/page.tsx
│   │   │   └── interview-primer/page.tsx
│   │   ├── privacy/page.tsx                # Privacy Policy (DPDP + GDPR)
│   │   ├── terms/page.tsx                  # Terms of Service
│   │   ├── [fileType]/for/[stack]/page.tsx # 120 SSG SEO pages
│   │   ├── sitemap.ts                      # /sitemap.xml (120 SEO + static pages)
│   │   └── api/
│   │       ├── generate/route.ts           # AI call per file (Node runtime)
│   │       ├── convert/route.ts            # MarkItDown shell-out (Node runtime)
│   │       ├── recommend-files/route.ts    # Goal-first file recommendation
│   │       ├── interview-primer/route.ts   # Interview coach prompt
│   │       ├── providers/route.ts          # AI provider health-check
│   │       └── admin/prompts/route.ts      # Prompt admin (password-gated)
│   ├── components/
│   │   ├── Hero.tsx                        # Night Approach hero — FlipWord, flight plan card, runway
│   │   ├── Nav.tsx                         # Navigation — aviation callsigns, ZuluClock, "File a flight plan" CTA
│   │   ├── OutputView.tsx                  # Shared split-pane output (all modes)
│   │   ├── Stepper.tsx                     # Wizard progress + validation
│   │   ├── TokenMeter.tsx                  # Before/after token counts + per-pass log
│   │   ├── ModelSelector.tsx               # Provider/model picker
│   │   ├── BadgeGenerator.tsx              # SVG badge generator
│   │   ├── TemplateGallery.tsx             # Starter template browser
│   │   ├── TaskSuggestions.tsx             # Auto-suggestions for Task mode
│   │   ├── CopyButton.tsx                  # Copy-to-clipboard (seo + docs variants)
│   │   ├── FileSelector.tsx                # File type selector
│   │   ├── StackInput.tsx                  # Tech stack autocomplete
│   │   ├── MarkdownEditor.tsx              # CodeMirror 6 wrapper
│   │   ├── DataConsent.tsx                 # Cookie/telemetry consent
│   │   └── fx/                             # Cockpit instrument components ("instruments move, chrome doesn't")
│   │       ├── FlipWord.tsx                # Split-flap departures board — word cycler
│   │       ├── ZuluClock.tsx               # Live UTC clock (ticks every second)
│   │       ├── Altimeter.tsx               # Scroll-driven altitude readout (FL35000 → WHEELS DOWN)
│   │       ├── RadarScope.tsx              # Pure CSS rotating radar sweep with blips
│   │       ├── ApproachLights.tsx          # Sequenced approach lighting strobes before CTA
│   │       └── Reveal.tsx                  # IntersectionObserver scroll reveal
│   ├── lib/
│   │   ├── ai-client.ts                    # Multi-provider wrapper (Claude/GPT/Gemini/Groq/NVIDIA)
│   │   ├── anthropic.ts                    # Anthropic client (server-side only)
│   │   ├── optimizer.ts                    # 5-pass token optimizer
│   │   ├── toc-generator.ts                # Auto table-of-contents insertion
│   │   ├── tokenizer.ts                    # js-tiktoken wrapper (browser-safe)
│   │   ├── supabase.ts                     # Supabase client (anon key, client-safe)
│   │   ├── pii-scrub.ts                    # PII scrubber (client-side, before telemetry)
│   │   ├── telemetry.ts                    # Usage event tracking (calls pii-scrub first)
│   │   ├── task/
│   │   │   └── domains.ts                  # 10 domain lenses for Task mode
│   │   └── prompts/
│   │       ├── index.ts                    # getSystemPrompt() — Supabase → hardcoded fallback
│   │       ├── fallback.ts                 # All hardcoded prompts (source of truth for seed)
│   │       ├── task.ts                     # Task prompt (BASE_SYSTEM_PROMPT with domain lenses)
│   │       ├── readme.ts / agents.ts / claude.ts / spec.ts
│   │       ├── skill.ts / design.ts / contributing.ts / security.ts / context.ts
│   │       └── image-to-prompt.ts
│   └── types/index.ts                      # GenerationRequest — wizard ↔ API contract
├── evals/
│   ├── promptfooconfig.yaml                # Promptfoo eval config
│   ├── fixtures/                           # Test input fixtures
│   └── assertions/                         # md-quality.js custom assertion
├── supabase/
│   └── schema.sql                          # usage_events, generation_feedback, training_samples, prompt_templates
├── scripts/
│   ├── seed-prompts.ts                     # Seeds prompt_templates table from fallback.ts
│   ├── generate-seo-content.ts             # Build-time: generates 120 SEO page content JSONs
│   └── promote-gold-examples.ts            # Nightly: promotes top-rated feedback → gold_examples
└── src/content/seo/                        # Pre-generated JSON per SEO page — committed, not runtime
```

---

## MCP server — `packages/mcp/`

```
packages/mcp/
├── src/
│   ├── index.ts           # Entry — 10 tools registered (stdio) + setup arg branch
│   ├── setup.ts           # Interactive setup wizard (npx mdpilot-mcp setup)
│   ├── ai-provider.ts     # Multi-provider resolver: GROQ → NVIDIA → ANTHROPIC → OPENAI
│   ├── analyze.ts         # Reads repo: stack, scripts, deps, structure, MCP servers
│   ├── repo-context.ts    # Deep context: repomix + Secretlint → 30k-token packed summary
│   ├── generate.ts        # Generation calls via ai-provider.ts (tokenDiscipline + mcpServers)
│   ├── verify-generate.ts # Self-verification loop: draft → verify → revise (max 2 attempts)
│   ├── optimizer.ts       # 5-pass optimizer (+ opt-in aggressive 6th pass)
│   ├── tokenizer.ts       # js-tiktoken wrapper
│   ├── prompts.ts         # System prompts with buildAgentsPrompt/buildClaudePrompt builders
│   ├── manifest.ts        # Snapshot storage — .mdpilot/manifest.json per doc + mcpServers
│   ├── drift.ts           # Drift detection: claim verification + snapshot diff + MCP server drift
│   ├── context.ts         # save_context / load_context — local session memory (secret-redacted)
│   └── patch.ts           # Section-level patching (preserves unchanged sections)
└── dist/                  # Compiled output (tsc → ES2022, NodeNext)
```

### Setup wizard

`npx mdpilot-mcp setup` runs an interactive CLI that:
- Checks for an existing key in env
- Guides users to a free Groq key (https://console.groq.com/keys) with 4 numbered steps
- Offers NVIDIA NIM as a second free option
- Detects the editor (Claude Code / Cursor / Windsurf / Goose)
- Writes/merges the MCP config into the right location, backs up the original
- Supports `--key` and `--client` flags for non-interactive use

Non-interactive shortcut: `npx -y mdpilot-mcp setup --key gsk_... --client claude`

---

## Architecture

### Core thesis

The quality of how you START an AI conversation determines the quality of the whole conversation. Everything MDPilot does is about front-loading context.

### Token optimizer — 5 passes (web) / 4 passes (MCP)

| Pass | Web app | MCP server |
|---|---|---|
| 1 | Boilerplate strip | Boilerplate strip |
| 2 | Cross-file dedup (bigram similarity) | Structure compression |
| 3 | Structure compression | Verbose compression |
| 4 | Verbose compression | Line compression |
| 5 | Line compression | — |

Result: 20–40% token reduction without meaning loss.

### Agent intelligence (4 upgrades over baseline generation)

| # | Upgrade | What it does | Key file |
|---|---|---|---|
| 1 | **Deep repo context** | Repomix packs the entire repo source into a 30k-token summary. Secretlint scans first and excludes flagged files. Injected as `<repo_context>`. | `repo-context.ts` |
| 2 | **Self-verification loop** | After generating, `verifyClaimsOnContent` checks every command and path against the live repo. If issues found, revises with real project state. Max 2 attempts. | `verify-generate.ts`, `drift.ts` |
| 3 | **Eval harness** | Promptfoo eval — 3 fixtures × 3 file types = 9 test cases. Custom `md-quality.js` assertion checks length, code blocks, structure, keyword presence, no forbidden placeholders. GitHub Action gates prompt PRs at 80% pass rate. | `evals/` |
| 4 | **Few-shot injection** | Nightly job promotes top-rated `generation_feedback` rows into `gold_examples`. On generation, `getSystemPrompt()` fetches the gold example and injects as `<few_shot_example>`. | `scripts/promote-gold-examples.ts` |

### Learning loop — how automatic training works

```
User generates file
  → usage_events row (file_type, role, provider, tokens)
    → user clicks 👍, keeps file unedited
      → generation_feedback row (thumbs=up, kept_unedited=true, edit_distance_bucket=none)
        → training_samples row (consented=true, pii_scrubbed_input, output)

Nightly GitHub Action (02:00 UTC, .github/workflows/promote-gold-examples.yml):
  → promote-gold-examples.ts runs with SUPABASE_SERVICE_ROLE_KEY
    → JOINs feedback + samples, filters: thumbs=up ∧ kept_unedited ∧ consented
    → Picks best (most recent) per (file_type, role)
    → UPSERTs into gold_examples (idempotent — safe to re-run)
    → Logs: "promoted N gold examples; table now has M rows"

Next generation call:
  → getSystemPrompt() → fetchGoldExample(fileType, role) [5-min cache]
    → if row found: injectFewShot(prompt, example) → <few_shot_example> appended
    → if Supabase down: silently no-ops, uses base prompt
```

**What is automatic:** feedback collection → nightly promotion → few-shot injection. No human needed once the Action is running.

**What stays manual (by design):** domain-lens updates (`src/lib/task/domains.ts`) are reviewed from QA logs before merging. Auto-ingestion of user content into lenses would risk encoding idiosyncratic or incorrect patterns at scale.

**Secrets needed in GitHub Actions** (Settings → Secrets → Actions):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service-role key (write access to gold_examples; NOT the anon key)

The anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) stays in the app for read-only operations only. Never use it in the promotion script — gold_examples has no insert/update policy for anon.

### Drift detection

| Method | How | Catches |
|---|---|---|
| **Claim verification** | Parses doc → extracts every `npm run <cmd>` and backtick path → checks against live repo | Broken commands (high), broken paths (medium) |
| **Snapshot diff** | Compares `.mdpilot/manifest.json` (written at generate time) against current state | New/removed scripts, new dirs, stale packages (low) |

### Prompt structure

Every system prompt uses a 4-block XML contract:
```
<role>          1-2 sentence expert persona
<task>          Numbered, non-negotiable instructions
<quality_bar>   Testable outcomes, concrete token budget
<anti_patterns> The 5 most common failure modes, blocked explicitly
```

Prompts are stored in Supabase (`prompt_templates` table) with version tracking. Hardcoded fallbacks in `src/lib/prompts/fallback.ts`. Hot-swap without deploy via `/api/admin/prompts`.

### Task prompt domain lenses

Task mode has 10 domain lenses in `src/lib/task/domains.ts`. Each lens injects domain-specific knowledge into the implementation plan. The AWS lens includes Cost Explorer API traps (exclusive end dates, UnblendedCost vs AmortizedCost, 3-month minimum, Public IPv4 pricing).

### Task prompt structural rules (v2 — June 2026)

Six cross-domain rules baked into `src/lib/prompts/task.ts` after real-world QA testing (`docs/TASK_PROMPT_QA.md`):

| Rule | Trigger | What it forces |
|---|---|---|
| `MULTI-HOP ARCHITECTURE` | CDN / reverse proxy / load balancer in task | One-line request chain in Context (Browser → each hop → Origin) |
| `MULTI-ENVIRONMENT` | Multiple hostnames or envs mentioned | Explicit "In scope / Out of scope" per environment |
| `PREREQUISITE CHECKS` | Step that consumes a service (logging, tracing, metrics) | Step 0 verifies the service is enabled; gives fallback if disabled |
| `HTTP ENDPOINTS` | Acceptance criterion covers an HTTP call | Requires status code + Content-Type + body assertion; blocks "displays correctly" |
| `SETUP / CONFIG TASKS` | Task type is setup, migration, or wiring | Decision log captures origin/target choice and rationale |
| `DATE/TIME-RANGE VALIDATION` | CLI command contains date params | Year check, exclusive end-date note, metric-source verification |

---

## Tech stack

### Web app

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components + API routes |
| Language | TypeScript strict | |
| Styling | Tailwind CSS v4 | Night Approach system — warm ink, Fraunces + IBM Plex, no glassmorphism, no `dark:` variants |
| AI SDKs | `@anthropic-ai/sdk` + `openai` + `@google/generative-ai` + `groq-sdk` | NVIDIA NIM reuses `openai` with custom baseURL |
| Editor | CodeMirror 6 | `@codemirror/lang-markdown` — not legacy CM5 |
| Token counting | `js-tiktoken` | Browser-safe — not full `tiktoken` (needs WASM) |
| File export | `jszip` + `file-saver` | |
| Markdown render | `react-markdown` + `remark-gfm` | |
| File conversion | `markitdown` CLI (Python `pipx`) | PDF, DOCX, CSV, HTML → markdown |
| Animation | `motion` (Framer Motion v12) | Cockpit instrument effects in `src/components/fx/` |
| 3D | `three.js` | Available for future 3D effects |
| Database | Supabase | Analytics, prompt versioning, feedback |

### MCP server

| Layer | Choice |
|---|---|
| Transport | stdio (spawned by IDE as child process) |
| SDK | `@modelcontextprotocol/sdk` v1 |
| Language | TypeScript — ES2022, NodeNext modules |
| AI | `ai-provider.ts` — resolves GROQ → NVIDIA → ANTHROPIC → OPENAI |
| Repo packing | `repomix` + Secretlint |
| Token counting | `js-tiktoken` |

---

## Environment variables

```env
# .env.local (web app)
ANTHROPIC_API_KEY=sk-ant-...   # required (or any one below)
OPENAI_API_KEY=sk-...          # optional
GOOGLE_API_KEY=...             # optional
GROQ_API_KEY=gsk_...           # optional — free tier
NVIDIA_API_KEY=nvapi-...       # optional — free tier

NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # server-side only — seed/promote scripts + admin route
ADMIN_PASSWORD=changeme        # gates /api/admin/prompts
```

```env
# MCP server env (in MCP config, not .env)
GROQ_API_KEY=gsk_...           # free — recommended
# or NVIDIA_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY
```

---

## Local setup

### Prerequisites

- Node.js 20+
- Python 3.11+ with `pipx` (for Convert mode only)

### Web app

```bash
git clone https://github.com/get-mdpilot/MDPilot-mcp
cd MDPilot-mcp/mdpilot
npm install
cp .env.example .env.local
# fill in at least one AI key

# Convert mode dependency (not npm — pipx only)
pipx install 'markitdown[all]'
# lands at ~/.local/bin/markitdown — API route auto-detects this path

npm run dev        # http://localhost:3000
npm run build      # production build
npx tsc --noEmit   # typecheck
npm run lint       # eslint
```

### MCP server

```bash
cd packages/mcp
npm install
npm run build      # tsc → dist/
npm run inspect    # MCP Inspector UI — test tools interactively
```

### Publish MCP to npm

```bash
cd packages/mcp
npm run build
npm publish --access public
```

---

## Versions

| Version | Status | What shipped |
|---|---|---|
| **v1** | Shipped | Generate mode, 3 file types (README/AGENTS/CLAUDE), 3-pass optimizer, CodeMirror split-pane, copy/download/zip |
| **v2** | Shipped | Task + Convert modes, 9 file types, 5-pass optimizer, multi-model (Claude/GPT/Gemini/Groq/NVIDIA), badge generator, auto-TOC, template gallery, Supabase analytics + prompt versioning, admin prompt API |
| **MCP v0.2** | Shipped | `mdpilot-mcp` — 8 tools, multi-provider (GROQ free → NVIDIA free → Anthropic → OpenAI), `npx mdpilot-mcp setup` wizard (detects editor, gets free key, merges config + backup) |
| **MCP v0.3** | Shipped | 10 tools — added `save_context` + `load_context` (local session memory, secret-redacted, self-verifying drift); MCP server detection in `analyze_project`; compact tool outputs + `verbose` escape hatch; `tokenDiscipline` param on `generate_md_file`; aggressive optimizer pass (6th pass, opt-in); token-discipline terse-response block for ai_exec Task prompts; MCP awareness in generated AGENTS.md |
| **SEO** | Shipped | 120 SSG pages (`/agents-md/for/nextjs` etc.), sitemap.xml, robots.txt, JSON-LD (TechArticle + FAQPage), zero runtime LLM calls |
| **Docs hub** | Shipped | 11 docs pages with sidebar, MCP setup guide (multi-provider, "Fastest setup" callout), all Labs docs |
| **Legal** | Shipped | `/privacy` + `/terms` — Viveon Gizit Pvt Ltd, India/Bengaluru, DPDP + GDPR-aligned |
| **Feedback** | Shipped | GitHub issue templates (bug/feedback/config.yml), feedback links in footer + docs |
| **Agent Intel** | Shipped | Repomix+Secretlint deep context, self-verification loop, promptfoo eval harness + CI gate, gold_examples few-shot injection |
| **v3** | Planned | Shareable public links, light accounts, Stripe billing, PostHog analytics, streaming generation |

---

## Hard constraints

- No database persistence in web app — all state is client-side (React state / URL params)
- No auth in web app — anonymous usage only
- One AI call per file — not batched
- All AI calls through `/api/*` server routes — never from the browser
- CSS theme is dark-only — never reintroduce `dark:` Tailwind variants
- MCP server: never read `.env` files or secrets from the scanned repo
- MCP server: `writeToDisk` only writes to the project root, never elsewhere
- Never commit `.env.local`

---

## AI development tools

### Claude Code (primary IDE)

All development in Claude Code (CLI + VSCode extension). The project ships `CLAUDE.md` and `AGENTS.md` for session memory.

### 21st.dev Magic MCP

On-demand UI component generation in Claude Code sessions:
```bash
claude mcp add magic -e API_KEY=<key> -- npx -y @21st-dev/magic@latest
```

### MDPilot MCP (this project)

Registered locally for dogfooding:
```bash
claude mcp add mdpilot -e GROQ_API_KEY=<key> -- node packages/mcp/dist/index.js
```

### UI UX Pro Max Skill

Installed via `uipro init --ai claude`. Provides 67 UI styles, 161 color palettes, 57 font pairings. Consulted before writing any UI component.

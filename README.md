# MDPilot

**Markdown intelligence platform** — generates production-grade AI instruction files, optimizes token usage, converts any file to markdown, and exposes all of that as an MCP server so AI coding agents can use it directly from inside the IDE.

Live at [mdpilot.in](https://mdpilot.in)

---

## What it does

MDPilot solves three distinct markdown problems in one platform:

| Mode | Input | Output |
|---|---|---|
| **Generate** | 3-question wizard + tech stack | README, AGENTS, CLAUDE, CONTRIBUTING, SECURITY, SKILL, DESIGN, CONTEXT |
| **Task** | Paste a ticket / thread / spec | TASK.md + SPEC.md |
| **Convert** | Drop any file (PDF, CSV, HTML, DOCX…) | Clean markdown |
| **Explain** | Paste code, file, or directory path | WALKTHROUGH.md tuned to any audience (AI agent, team, learner, non-technical) |
| **Interview primer** | Role + level + optional JD | Ready-to-paste AI coach prompt |

Every output passes through a **5-pass token optimizer** that strips boilerplate, deduplicates cross-file content, and compresses verbose phrasing — cutting tokens by 20–40% without losing meaning.

Plus an **MCP server** (`mdpilot-mcp`) that lets Claude Code, Cursor, Copilot, and Windsurf call all of the above directly from the IDE — with the key advantage that it reads the user's actual repo instead of asking them to paste their stack.

---

## Monorepo structure

```
md-pilot/
├── mdpilot/              # Next.js web app (the website)
└── packages/
    └── mcp/              # MCP server (IDE plugin, npm package)
```

---

## Web app — `mdpilot/`

```
mdpilot/
├── src/
│   ├── app/
│   │   ├── page.tsx                # Landing — 3 mode cards
│   │   ├── generate/page.tsx       # Generate mode: wizard + output
│   │   ├── task/page.tsx           # Task mode: input + output
│   │   ├── convert/page.tsx        # Convert mode: file drop + output
│   │   ├── explain/page.tsx        # Explain mode: code → WALKTHROUGH.md
│   │   ├── interview-primer/page.tsx  # Interview primer: role + JD → AI coach prompt
│   │   ├── atmosphere/page.tsx     # 3D scroll-driven visual showcase (Three.js)
│   │   ├── [fileType]/for/[stack]/page.tsx  # 120 SSG SEO pages — Server Component, JS-off safe
│   │   ├── sitemap.ts              # Auto-served at /sitemap.xml (120 SEO + 5 static pages)
│   │   ├── robots.ts               # /robots.txt — allows all, disallows /api/ /admin/
│   │   └── api/
│   │       ├── generate/route.ts   # Claude call per file (Node runtime)
│   │       ├── convert/route.ts    # MarkItDown shell-out (Node runtime)
│   │       ├── recommend-files/route.ts  # Goal-first file recommendation (non-technical path)
│   │       ├── interview-primer/route.ts # Interview coach prompt generation
│   │       ├── providers/route.ts  # AI provider health-check
│   │       └── admin/
│   │           └── prompts/route.ts # Prompt template admin (password-gated)
│   ├── components/
│   │   ├── OutputView.tsx          # Shared split-pane output (all 3 modes)
│   │   ├── Stepper.tsx             # Wizard progress + validation
│   │   ├── TokenMeter.tsx          # Before/after token counts + per-pass log
│   │   └── ui/                     # Button, Card, Input base components
│   ├── lib/
│   │   ├── ai-client.ts            # Multi-provider wrapper (Claude/GPT/Gemini/Groq)
│   │   ├── anthropic.ts            # Anthropic client (server-side only)
│   │   ├── optimizer.ts            # 5-pass token optimizer
│   │   ├── toc-generator.ts        # Auto table-of-contents insertion
│   │   ├── tokenizer.ts            # js-tiktoken wrapper (browser-safe)
│   │   ├── supabase.ts             # Supabase client (anon key, client-safe)
│   │   └── prompts/
│   │       ├── index.ts            # getSystemPrompt() — Supabase → hardcoded fallback
│   │       ├── fallback.ts         # All hardcoded prompts (source of truth for seed)
│   │       ├── readme.ts
│   │       ├── agents.ts
│   │       ├── claude.ts
│   │       ├── task.ts
│   │       ├── spec.ts
│   │       ├── skill.ts
│   │       ├── design.ts
│   │       ├── contributing.ts
│   │       ├── security.ts
│   │       ├── context.ts
│   │       └── image-to-prompt.ts  # Vision analysis + meta-optimization prompts
│   └── types/index.ts              # GenerationRequest — wizard ↔ API contract
├── supabase/
│   └── schema.sql                  # usage_events, generation_feedback, training_samples, prompt_templates
├── scripts/
│   ├── seed-prompts.ts             # Seeds prompt_templates table from fallback.ts
│   └── generate-seo-content.ts     # Build-time: generates src/content/seo/*.json for all 120 SEO pages
├── src/content/
│   └── seo/                        # Pre-generated JSON per page (fileType-stack.json) — committed, not runtime
└── docs/
    ├── BUILD_PLAN.md
    ├── PROMPT_STRATEGY.md
    └── COMPETITORS.md
```

---

## MCP server — `packages/mcp/`

A standalone npm package (`mdpilot-mcp`) that exposes MDPilot's generation and optimization as MCP tools callable from any IDE that supports MCP.

**Key advantage over the website:** the server runs locally inside the user's repo and reads actual project files (`package.json`, lockfiles, `go.mod`, etc.) — so generated files reference real scripts and paths, never hallucinated ones.

```
packages/mcp/
├── src/
│   ├── index.ts           # MCP server entry — all 7 tools registered (stdio transport)
│   ├── analyze.ts         # Reads repo: detects stack, scripts, dependencies, structure
│   ├── repo-context.ts    # Deep context: repomix + Secretlint → 30k-token packed summary
│   ├── generate.ts        # Claude calls with deep/grounded context (real repo injected)
│   ├── verify-generate.ts # Self-verification loop: draft → verify claims → revise (max 2 attempts)
│   ├── optimizer.ts       # 4-pass optimizer adapted for single-file use
│   ├── tokenizer.ts       # js-tiktoken wrapper
│   ├── prompts.ts         # All 9 system prompts (mirrored from web app)
│   ├── manifest.ts        # Snapshot storage — writes .mdpilot/manifest.json per doc
│   ├── drift.ts           # Drift detection: verifyClaimsOnContent (in-memory) + snapshot diff
│   └── patch.ts           # Section-level patching via Claude (preserves unchanged sections)
└── dist/                  # Compiled output (tsc → ES2022, NodeNext)
```

### 8 MCP tools

| Tool | Description |
|---|---|
| `analyze_project` | Scans a repo — detects stack, scripts, dependencies, package manager, file structure. Run before generating. |
| `generate_md_file` | Generates readme / agents / claude / contributing / security / skill / design / context grounded in real repo data. `verified: true` enables self-verification loop. Optional `writeToDisk`. |
| `generate_task_file` | Turns a ticket, Slack thread, or GitHub issue into a structured TASK.md with requirements, AC, and agent prompt block. |
| `explain_code` | Analyzes a file or directory and generates a WALKTHROUGH.md tuned to any audience (AI agent, team member, learner, non-technical). |
| `optimize_markdown` | Runs the 4-pass optimizer on any existing markdown — strips boilerplate, compresses verbose prose, tightens structure. |
| `image_to_prompt` | Analyzes a local image and outputs a detailed recreation prompt for FLUX / SD / Midjourney / DALL-E / Gemini. |
| `check_drift` | Detects stale docs — broken commands, broken paths, undocumented new scripts/dirs. Two methods: claim verification (no snapshot needed) + snapshot diff (catches additions/removals since last generate). |
| `update_docs` | Patches ONLY the stale sections of a doc, preserving everything else exactly. Uses Claude with real project state. Optional `writeToDisk` updates the file and refreshes the manifest. |

### Add to Claude Code / Cursor / Windsurf

Local (during dev):
```json
{
  "mcpServers": {
    "mdpilot": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp/dist/index.js"],
      "env": { "ANTHROPIC_API_KEY": "sk-ant-..." }
    }
  }
}
```

After publishing to npm (zero-install):
```json
{
  "mcpServers": {
    "mdpilot": {
      "command": "npx",
      "args": ["-y", "mdpilot-mcp"],
      "env": { "ANTHROPIC_API_KEY": "sk-ant-..." }
    }
  }
}
```

Or via CLI:
```bash
claude mcp add mdpilot -e ANTHROPIC_API_KEY=sk-ant-... -- npx -y mdpilot-mcp
```

### Build + test locally

```bash
cd packages/mcp
npm install
npm run build                # tsc → dist/
npm run inspect              # MCP Inspector UI — test tools interactively
```

### Publish

```bash
cd packages/mcp
npm run build
npm publish --access public
```

---

## AI Agent capabilities

### Files MDPilot generates

| File | Purpose | Who reads it |
|---|---|---|
| `README.md` | Human-facing project intro — what/who/why in 10 seconds | Developers, GitHub visitors |
| `AGENTS.md` | Machine-readable agent spec — commands, permissions, style | Claude Code, Cursor, Copilot, Windsurf |
| `CLAUDE.md` | Session memory for Claude — only what Claude would get wrong alone | Claude Code |
| `TASK.md` | Structured task for an AI agent to execute | Claude Code, Cursor agents |
| `SPEC.md` | Engineering spec from a ticket or thread | AI coding assistants |
| `SKILL.md` | Reusable skill definition for agent orchestration | Claude skills system |
| `DESIGN.md` | Design decisions and UX rationale with exact token values | AI assistants, new contributors |
| `CONTRIBUTING.md` | Contribution guide optimized for AI-assisted PRs | GitHub Copilot, Claude |
| `SECURITY.md` | Security posture and responsible disclosure channel | AI security tools |
| `CONTEXT.md` | Date-stamped ephemeral session state (different from CLAUDE.md) | Any agentic AI tool |

### Prompt engineering structure

Every system prompt uses a 4-block XML contract:

```
<role>          1-2 sentence expert persona with domain + style
<task>          Numbered, non-negotiable instructions
<quality_bar>   Testable outcomes ("agent onboards in 60s"), not style notes
<anti_patterns> The 5 most common failure modes, blocked explicitly
```

The `quality_bar` sets a concrete token budget — Claude self-regulates length. Every prompt ends with `Output: raw markdown, no preamble`.

Prompts are stored in Supabase (`prompt_templates` table) with version tracking, with hardcoded fallbacks in `src/lib/prompts/fallback.ts`. The admin route at `/api/admin/prompts` allows hot-swapping prompts without a deploy.

### Agent intelligence (4 upgrades over baseline)

| Upgrade | What it does | Files |
|---|---|---|
| **1 — Deep repo context** | Repomix packs the entire repo source into a 30k-token AI-friendly summary. Secretlint scans for secrets and excludes flagged files before anything is sent to Claude. The packed context goes into a `<repo_context>` block injected alongside the project metadata. | `repo-context.ts` |
| **2 — Self-verification loop** | After generating a file, the system runs `verifyClaimsOnContent` on the draft to check every command and path. If issues are found, Claude revises the draft with the real project state. Max 2 attempts. Pass `verified: true` to `generate_md_file`. | `verify-generate.ts`, `drift.ts` |
| **3 — Eval harness** | Promptfoo eval with 3 fixtures × 3 file types = 9 test cases per run. Custom `md-quality.js` assertion checks length, code blocks, structure, keyword presence, and forbidden placeholders. GitHub Action gates prompt-change PRs at 80% pass rate. | `mdpilot/evals/` |
| **4 — Few-shot injection** | Nightly job promotes top-rated `generation_feedback` rows (thumbs up + kept unedited + no edits) into `gold_examples` table. On each generation, `getSystemPrompt()` fetches the gold example for that file type and injects it as a `<few_shot_example>` block. | `promote-gold-examples.ts`, `prompts/index.ts` |

### Drift detection

Docs go stale — a script gets renamed, a folder moves, a dependency is added — and now AGENTS.md tells an agent to run a command that no longer exists. Drift detection catches this and patches only the affected sections.

Two detection methods run on every `check_drift` call:

| Method | How it works | What it catches |
|---|---|---|
| **A — Claim verification** | Parses the doc, extracts every `npm run <script>` command and every backtick-wrapped file path, checks each against the live repo. Works on disk files OR in-memory strings (`verifyClaimsOnContent`). | Broken commands (high), broken paths (medium) |
| **B — Snapshot diff** | Compares the manifest stored when docs were last generated against the current project state. | New scripts, removed scripts, new directories, new packages, staleness (all low) |

The manifest lives at `.mdpilot/manifest.json` — commit it so the whole team shares drift state. It's written automatically whenever `generate_md_file` runs with `writeToDisk: true`.

`update_docs` calls Claude with the current doc, the detected issues, and the real project state. It is instructed to patch only the broken sections and preserve everything else verbatim.

### Token optimizer

The web app runs a 5-pass cross-file optimizer; the MCP server runs a 4-pass single-file version:

| Pass | Web app | MCP server |
|---|---|---|
| 1 | Boilerplate strip | Boilerplate strip |
| 2 | Cross-file dedup (bigram similarity) | Structure compression |
| 3 | Structure compression | Verbose compression |
| 4 | Verbose compression | Line compression |
| 5 | Line compression | — |

Result: 20–40% token reduction. Before/after meter shown in UI; token savings appended to MCP tool output.

---

## Multi-model support

MDPilot is provider-agnostic. The `ai-client.ts` wrapper supports:

| Provider | Model | Notes |
|---|---|---|
| **Anthropic** | claude-sonnet-4-6 | Primary — best instruction-file quality |
| **OpenAI** | gpt-4o | Fallback option |
| **Google** | gemini-2.0-flash | Fallback option |
| **Groq** | llama-3.3-70b-versatile | Fast + free tier |
| **NVIDIA NIM** | meta/llama-3.3-70b-instruct | Free tier, OpenAI-compatible endpoint (~4s) |

Provider resolution: requests the chosen model, falls back to first available key. The MCP server always uses `claude-sonnet-4-6` via the user's own `ANTHROPIC_API_KEY`.

NVIDIA NIM uses the `openai` npm package pointed at `https://integrate.api.nvidia.com/v1` — no extra dependency. Add `NVIDIA_API_KEY` to unlock the **◈ Llama 3.3** button in the model selector.

---

## Tech stack

### Web app

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components + API routes in one repo |
| Language | TypeScript strict | Contract types between wizard and API |
| Styling | Tailwind CSS v4 | Dark glassmorphism design system |
| AI SDKs | `@anthropic-ai/sdk` + `openai` + `@google/generative-ai` + `groq-sdk` | Multi-provider (NVIDIA NIM reuses `openai` with custom baseURL — no extra dep) |
| Editor | CodeMirror 6 | Live editable markdown output |
| Token counting | `js-tiktoken` | Browser-safe, no WASM |
| File export | `jszip` + `file-saver` | .md download or .zip bundle |
| Markdown render | `react-markdown` + `remark-gfm` | Split-pane preview |
| File conversion | `markitdown` CLI (Python, `pipx`) | PDF, DOCX, CSV, HTML → markdown |
| 3D / animation | `three.js` + `lenis` | Hero scroll effects |
| Validation | `zod` | API input validation |
| Database | Supabase | Usage analytics, prompt versioning, feedback |

### MCP server

| Layer | Choice |
|---|---|
| Transport | stdio (spawned by IDE as child process) |
| SDK | `@modelcontextprotocol/sdk` v1 |
| Language | TypeScript — ES2022, NodeNext modules |
| AI | `@anthropic-ai/sdk` (user's own key via env) |
| Repo packing | `repomix` — with Secretlint secret scanning |
| Token counting | `js-tiktoken` |
| Validation | `zod` |

---

## AI development tools in use

### Claude Code (primary IDE)

All development done in Claude Code (CLI `v2.1.165` + VSCode extension). The project ships its own `CLAUDE.md` and `AGENTS.md` to give Claude session memory about the codebase.

Install globally:
```bash
npm install -g @anthropic-ai/claude-code
```

### 21st.dev Magic MCP

Installed for on-demand UI component generation inside Claude Code sessions.

```bash
# Add via CLI (correct syntax — use -- to separate npx flags)
claude mcp add magic -e API_KEY=<key> -- npx -y @21st-dev/magic@latest
```

Connected at user scope (`~/.claude.json`). Status: `✓ Connected`.

### MDPilot MCP (this project)

The MCP server built in this repo, registered locally:

```bash
claude mcp add mdpilot -e ANTHROPIC_API_KEY=<key> -- node /path/to/packages/mcp/dist/index.js
```

Status: `✓ Connected`.

### UI UX Pro Max Skill

Installed via `uipro init --ai claude`. Provides 67 UI styles, 161 color palettes, 57 font pairings. Consulted before writing any UI component.

---

## Setup

### Prerequisites

- Node.js 20+
- Python 3.11+ with `pipx` (for Convert mode only)

### Web app

```bash
git clone <repo>
cd md-pilot/mdpilot
npm install
cp .env.example .env.local
```

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...         # optional
GOOGLE_API_KEY=...             # optional
GROQ_API_KEY=gsk_...           # optional
NVIDIA_API_KEY=nvapi-...       # optional — free tier, get key at build.nvidia.com

SUPABASE_URL=https://....supabase.co
SUPABASE_ANON_KEY=...
ADMIN_PASSWORD=changeme        # gates /api/admin/prompts
```

```bash
# Convert mode dependency (not npm — pipx only)
pipx install 'markitdown[all]'
# Lands at ~/.local/bin/markitdown — API route auto-detects this path

npm run dev        # http://localhost:3000
npm run build      # production build
npx tsc --noEmit   # typecheck
npm run lint       # eslint
```

### MCP server

```bash
cd md-pilot/packages/mcp
npm install
npm run build      # compiles to dist/
npm run inspect    # opens MCP Inspector to test tools interactively
```

---

## Versions

| Version | Status | What shipped |
|---|---|---|
| **v1** | Shipped | Generate mode, 3 file types (README/AGENTS/CLAUDE), 3-pass optimizer, CodeMirror split-pane, copy/download/zip |
| **v2** | Shipped | Task + Convert modes, 9 file types, 5-pass optimizer, multi-model (Claude/GPT/Gemini/Groq), badge generator, auto-TOC, template gallery, Supabase analytics + prompt versioning, admin prompt API |
| **MCP** | Shipped | `mdpilot-mcp` package — 7 tools (analyze, generate, task, optimize, image-to-prompt, check_drift, update_docs), stdio transport, repo-grounded generation, drift detection |
| **SEO** | Shipped | 120 programmatic SSG pages (`/agents-md/for/nextjs` etc.), sitemap.xml, robots.txt, JSON-LD structured data (TechArticle + FAQPage), build-time content generation script (Anthropic/Groq), zero runtime LLM calls |
| **Agent Intelligence** | Shipped | 4 upgrades: (1) repomix+Secretlint deep repo context, (2) self-verification loop, (3) promptfoo eval harness + CI gate, (4) gold_examples few-shot injection |
| **v3** | Planned | Shareable public links, light accounts, Stripe billing, PostHog analytics, streaming generation, npm publish of MCP |

---

## Hard constraints

- No database persistence in web app — all state is client-side (React state / URL params)
- No auth in web app — anonymous usage only
- One AI call per file — not batched, for reliable parsing and per-file retry
- All AI calls go through `/api/*` server routes — Anthropic SDK never runs in the browser
- MCP server: never read `.env` files or secrets from the scanned repo
- MCP server: `writeToDisk` only writes to the project root, never elsewhere
- Never commit `.env.local`

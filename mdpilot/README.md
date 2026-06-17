# MDPilot

Markdown intelligence platform at [mdpilot.in](https://mdpilot.in). Primary tool: Task mode — paste any ticket or thread to get a precise, expert-grade prompt for your AI agent. Also generates production-grade AI instruction files (AGENTS.md, CLAUDE.md, README), detects context drift, and converts any file to markdown.

## Site structure

| Route | Description |
|-------|-------------|
| `/` | Landing — Night Approach hero, FlipWord, ghost numerals, radar scope, approach lights, altimeter |
| `/task` | Flight Deck — Task mode (primary tool) |
| `/labs` | Hangar — 5 secondary tools |
| `/docs` | Field Manual — documentation hub (sidebar layout) |
| `/docs/mcp` | MCP server setup — full guide, all 10 tools (live) |
| `/docs/vscode` | VS Code extension setup — install, key resolution, commands |
| `/docs/getting-started` | Getting started |
| `/atmosphere` | Night Approach design study — six design decisions behind the site's look |
| `/blog` | Logbook — blog index (empty state pending first post) |
| `/blog/[slug]` | Blog post template with `generateMetadata` + `generateStaticParams` |

## Primary mode

| Mode | Route | What it does |
|------|-------|-------------|
| **Task** | `/task` | Paste a ticket / Slack thread → structured TASK.md or SPEC.md — the landing page hero |

## Labs (secondary — `/labs`)

| Mode | Route | What it does |
|------|-------|-------------|
| **Generate** | `/generate` | 7-step wizard → README, AGENTS, CLAUDE, SKILL, DESIGN, CONTRIBUTING, SECURITY, CONTEXT |
| **Convert** | `/convert` | Drop any file → clean markdown (via MarkItDown CLI) |
| **Explain** | `/explain` | Paste code → WALKTHROUGH.md tuned to any audience |
| **Image → Prompt** | `/image-to-prompt` | Analyze any image → recreation prompt for FLUX, SD, Midjourney, DALL-E, Gemini |
| **Interview primer** | `/interview-primer` | Role + level + optional JD → ready-to-paste AI coach prompt |

## Generate mode — wizard steps

1. What are you building?
2. Who is it for? (project scope)
3. Which AI tools?
4. Tech stack (paste package.json / requirements.txt, or type)
5. **Output style** — who reads the output: AI agent · team · non-technical · learner
6. **Files to generate**
   - Non-technical audience → goal-first flow: describe your goal in plain language, get AI-recommended files with plain names and jargon-free reasons
   - All others → normal file picker with recommended pre-selected
7. Review & generate

## Task mode — wizard steps

1. Paste your task (ticket, Slack thread, GitHub issue, etc.)
2. Configure output:
   - Execution mode: **Guide** (full TASK.md) · **AI Exec** (prescriptive, agent-ready) · **Context** (compact drop)
   - Experience level: Experienced (terse) · New to stack (explains why)
   - Include verification pass (AI Exec only)
   - Show alternative approaches (adds 2–3 domain-appropriate options + trade-offs)
3. Review & generate

## Stack

- Next.js 16 App Router + TypeScript + Tailwind CSS v4
- Anthropic API (claude-sonnet-4-6), with multi-provider fallback (OpenAI, Gemini, Groq, NVIDIA NIM)
- `js-tiktoken` for browser-side token counting
- CodeMirror 6 for the markdown editor
- MarkItDown CLI for Convert mode (installed separately)
- Fraunces + IBM Plex Sans/Mono (Night Approach design system — `src/app/globals.css`)
- `motion` (Framer Motion v12) for cockpit instrument effects (`src/components/fx/`)

## Local setup

```bash
cp .env.local.example .env.local   # add at least one API key
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Required in `.env.local` — at least one:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...
GROQ_API_KEY=gsk_...
NVIDIA_API_KEY=nvapi-...        # free — get key at build.nvidia.com
```

Optional (enables Supabase-backed prompt versioning and gold examples):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Convert mode requires the MarkItDown CLI (not installed by npm):

```bash
pipx install 'markitdown[all]'
```

## API routes

| Route | Description |
|-------|-------------|
| `POST /api/generate` | Generate any supported file type |
| `POST /api/recommend-files` | Goal-first file recommendation (non-technical path) |
| `POST /api/interview-primer` | Generate interview coach prompt |
| `GET  /api/convert` | MarkItDown health check |
| `POST /api/convert` | Convert file to markdown |
| `GET  /api/providers` | List available AI providers |

## VS Code extension (packages/vscode)

Native editor extension — published to the VS Code Marketplace, works in VS Code, Cursor, and Windsurf. Auto-reads the API key from existing MCP config files — no extra setup if MCP server is already configured.

```
get-mdpilot.mdpilot  v0.1.2
```

[Extension setup →](https://mdpilot.in/docs/vscode)

## MCP server (packages/mcp)

Exposes MDPilot generation as MCP tools for Claude Code, Cursor, Windsurf, and Goose:

| Tool | Description |
|------|-------------|
| `analyze_project` | Scan repo, detect stack and structure |
| `generate_md_file` | Generate any supported file type (with optional self-verification) |
| `generate_task_file` | Turn a ticket/thread into TASK.md (supports execution mode + experience level) |
| `explain_code` | Generate WALKTHROUGH.md for a file or directory |
| `optimize_markdown` | Run the 5-pass token optimizer on existing markdown |
| `image_to_prompt` | Analyze an image and generate a recreation prompt |
| `check_drift` | Detect where docs have gone stale |
| `update_docs` | Patch stale sections in a doc file |
| `save_context` | Persist session state to CONTEXT.md across sessions |
| `load_context` | Load prior context with inline drift annotations |

## Key files

```
src/
  app/
    generate/page.tsx          — Generate wizard (7 steps)
    task/page.tsx              — Task wizard (3 steps)
    explain/page.tsx           — Explain mode
    interview-primer/page.tsx  — Interview primer
    api/generate/route.ts      — Main generation API
    api/recommend-files/       — Goal-first file recommendation
    api/interview-primer/      — Interview coach prompt
  lib/
    prompts/                   — System prompts per file type
      audience.ts              — ReaderAudience directive builder
      recommend-files.ts       — Goal-first recommendation prompt
      task.ts                  — Dynamic task prompt with domain lenses
      explain.ts               — WALKTHROUGH.md prompt
      interview-primer.ts      — Interview coach prompt
    task/
      domains.ts               — 11 domain lenses + detectDomain()
      language-notes.ts        — 12 language trap notes + detectLanguages()
    optimizer.ts               — 5-pass token optimizer
    ai-client.ts               — Multi-provider wrapper
  types/index.ts               — GenerationRequest + all shared types
packages/
  mcp/src/                     — MCP server (8 tools)
evals/                         — Promptfoo eval harness + domain fixtures
```

## Constraints

- No database, no auth — all state is client-side
- One API call per file
- All Anthropic calls go through `/api/*` routes — never from the browser
- Never commit `.env.local`

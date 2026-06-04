# MDPilot

Markdown intelligence platform at mdpilot.in. Generates advanced AI instruction files (.md), optimizes tokens, converts any file to markdown.

## Architecture — 3 modes, 2 shared layers

```
Input (text paste / file drop / MarkItDown conversion)
  → Mode engine (Generate | Task | Convert)
    → Token optimizer (shared — boilerplate strip, cross-file dedup, compression)
      → Output + "how to use this file" guide
```

- **Generate mode** (v1): 3-question wizard → advanced README.md, AGENTS.md, CLAUDE.md
- **Task mode** (v2): paste ticket/thread → TASK.md, SPEC.md
- **Convert mode** (v2): file drop → MarkItDown via MCP → clean markdown

## Current focus

v1 MVP — Week 2: intake wizard + generation wiring live. Groq API active (Anthropic credits depleted temporarily).

## AI tools & design resources active in this project

### 21st.dev Magic MCP (`magic`)
Installed at user scope (`~/.claude/settings.json`). Use it to generate polished UI components on demand.
- Invoke via the `magic` MCP tool inside Claude Code sessions
- Best for: component scaffolding, layout ideas, animation snippets
- API key is set in MCP env — no extra setup needed

### UI UX Pro Max Skill (`.claude/skills/ui-ux-pro-max/`)
Installed via `uipro init --ai claude`. Auto-activates for UI/UX tasks.
- 67 UI styles (Glassmorphism, Claymorphism, Brutalism, Minimalism…)
- 161 color palettes matched to product types
- 57 font pairings with Google Fonts imports
- Stack-specific templates in `data/stacks/nextjs.csv`
- **Always consult the skill data before writing UI** — use `SKILL.md` for the reasoning engine

### UI design principles for MDPilot
- Style: modern glassmorphism + subtle 3D depth (perspective transforms, layered shadows)
- Images: use Unsplash CDN (`images.unsplash.com`) — configured in `next.config.ts`
- Hero: dark gradient mesh (`#0a0a14` → `#1a1030`) with floating 3D file cards
- Cards: `backdrop-blur-xl bg-white/5 border border-white/10` for glass effect
- Hover: CSS perspective tilt (`perspective(800px) rotateY/X`) for depth
- Never use flat, purely-white card designs — every surface needs depth or texture

## Stack

Next.js 14 App Router, TypeScript, Tailwind, Anthropic API (Claude), js-tiktoken, CodeMirror 6. No database in v1, no auth in v1.

## Key files to know

- `src/lib/prompts/*.ts` — system prompt templates per file type (README, AGENTS, CLAUDE). Each uses a 4-block XML structure: `<role>`, `<project_context>`, `<task>`, `<quality_bar>` + `<anti_patterns>`
- `src/lib/anthropic.ts` — Anthropic client wrapper (server-side only)
- `src/lib/tokenizer.ts` — js-tiktoken wrapper for browser-side token counting
- `src/types/index.ts` — `GenerationRequest` is the contract between wizard and API
- `src/app/api/generate/route.ts` — one Claude call per file (not multi-file in one call)

## Gotchas

- API key stays server-side only — never import `anthropic.ts` in client components
- Use `export const runtime = 'nodejs'` on API routes — Anthropic SDK needs Node, not Edge
- `js-tiktoken` for browser, NOT the full `tiktoken` (needs WASM)
- `@codemirror/lang-markdown` is CM6 — don't install legacy CM5 packages
- Tailwind design tokens go in `tailwind.config.ts` under `theme.extend` — not CSS variables
- `GenerationRequest` type in `src/types/index.ts` is the single source of truth between wizard and API — update both sides when changing it
- When streaming Claude responses, use `stream: true` + `for await` — don't buffer

## Token optimizer (the moat)

3-pass in v1, 5-pass total:
1. Tokenize + baseline (js-tiktoken)
2. Boilerplate strip (regex + filler-phrase rules)
3. Cross-file dedup (heading-based chunking + string similarity — NO embeddings in v1)
4. Verbose compression (v2)
5. Structure optimization (v2)

## v1 feature set

- Generate mode with 3-question wizard
- 3 file types: README.md, AGENTS.md, CLAUDE.md
- Token optimizer passes 1-3
- Live split-pane preview (CodeMirror + react-markdown)
- Copy / download .md / download .zip (jszip)
- "How to use this file" guide per file type

## Hard constraints

- No database, no auth in v1 — all state is client-side
- One Claude call per file — simpler parsing, more reliable
- All API calls through `/api/*` server routes
- Never commit `.env.local`
- Every generated file must include a "how to use this" section explaining which IDE reads it and what it unlocks

## Docs for deeper context

Read these files when working on specific areas:
- `docs/BUILD_PLAN.md` — 5-week v1 task list, v2/v3 roadmap
- `docs/PROMPT_STRATEGY.md` — how the system prompts are structured and why
- `docs/COMPETITORS.md` — gap analysis vs readme.so, readme-ai, ReadmeCodeGen, GitBook

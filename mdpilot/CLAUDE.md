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

v2 shipped — all 3 modes live, multi-model choice, 9 file types, 5-pass optimizer, badge generator, templates, auto-TOC. Next: v3 planning. Groq API active (Anthropic credits depleted temporarily).

## v2 architecture notes

- `src/lib/ai-client.ts` — unified multi-provider wrapper (claude/gpt/gemini/groq). `getAvailableProviders()` reads which keys exist; `/api/generate` resolves provider with fallback to first available, so requesting `claude` with no key falls back to Groq automatically.
- `src/lib/prompts/` — 10 prompts now (readme, agents, claude, task, spec, skill, design, contributing, security, context). `buildUserMessage` branches: task/spec/`mode:'task'` → raw-input wrapper, else project-context.
- `src/lib/optimizer.ts` — 5 passes: boilerplate strip, cross-file dedup, structure compression, verbose compression, line compression. NOTE: pass 3 fn is `compressStructure`, pass 5 fn is `compressLines` — do not confuse them.
- `src/lib/toc-generator.ts` — `insertTOC` injects/replaces a TOC after the first heading.
- `src/components/OutputView.tsx` — shared output view for all 3 modes. Props: `showAgentPrompt` (task), `footer` (convert cross-mode CTAs), `backLabel`. Owns the editor-content transforms (TOC, badge insertion).
- Convert mode needs the `markitdown` CLI — see the dependency note below.

## Gotchas

- After rapid `next dev` restarts, unexpected route 404s ("Failed to find Server Action") mean a stale Turbopack cache — `rm -rf .next` and restart, don't chase a code bug.
- CSS theme is dark-only: design tokens in `globals.css` are dark values; never reintroduce `dark:` Tailwind variants (the site has no light mode). The markdown preview pane is the one intentional light surface.

## Convert mode dependency (MarkItDown)

`/api/convert` shells out to the `markitdown` CLI via `child_process`. It is NOT installed by npm.
- Install: `pipx install 'markitdown[all]'` — NOT `pip install` (Homebrew Python is externally-managed / PEP 668)
- Lands at `~/.local/bin/markitdown`; the route probes PATH + `~/.local/bin` + Homebrew/usr-local bins
- `GET /api/convert` is a health check returning `{ available: boolean }` — the page shows a setup banner when false
- Requires Node runtime (`export const runtime = 'nodejs'`), not Edge — will not work on Vercel Edge

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

### UI design principles for MDPilot — "Night Approach" system
The whole site runs on the design system defined in `src/app/globals.css`. Read it before writing UI.
- Palette: warm ink surfaces (`--md-bg #12100D`, `--md-surface`, `--md-surface-2`), bone text (`--md-text*`), ONE amber accent (`--md-accent #E6A23C`), muted olive success (`--md-go`), clay caution (`--md-caution`), slate info (`--md-info`). Always use the CSS vars, never raw hexes.
- Type: headlines `font-display` (Fraunces serif, `font-semibold` max — never font-black); body IBM Plex Sans (default); labels/readouts `font-mono` (IBM Plex Mono, uppercase, tracked). The "MDPilot" wordmark next to the logo uses `.font-brand` (B612 — the typeface Airbus designed for cockpit displays); nothing else uses it.
- Depth: hairline borders (`--md-border`, `--md-border-strong`) and soft paper shadows (`--shadow-sm/md/lg`). NO colored glows, gradients, glassmorphism, particles, shimmer, conic borders, or perspective tilt — these are the "AI-generated" tells the redesign removed.
- Motion: "instruments move, chrome doesn't" — expressive effects are allowed ONLY as cockpit instruments (split-flap FlipWord, radar scope, approach lights, altimeter, Zulu clock — see `src/components/fx/`); UI chrome stays calm (150–300ms, transform/opacity, hover = 1px lift, never scale). Fraunces is loaded with SOFT/WONK/opsz axes — use `.em-wonk` for the italic amber emphasis word in headlines.
- Buttons: solid amber `bg-[var(--md-accent)] text-[var(--md-accent-ink)] rounded-[10px]`; ghost = `.btn-ghost`. No pill-shaped buttons.
- Section labels: `<p className="section-label">` (mono uppercase amber + rule line).
- Brand voice (aviation, light touch): Task = Flight Deck, Labs = Hangar, Docs = Field Manual, Blog = Logbook, CTA = "File a flight plan", status = "Cleared for takeoff".

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

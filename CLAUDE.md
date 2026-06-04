# MDPilot

Markdown intelligence platform at mdpilot.in. Three modes: Generate, Task, Convert.
Stack: Next.js 14 (App Router) + TypeScript + Tailwind + Anthropic API.

## Current focus

Building v1 MVP: Generate mode + token optimizer + core file types (README, AGENTS, CLAUDE).

## Gotchas

- Anthropic API key goes in `.env.local` as `ANTHROPIC_API_KEY` — never import it client-side
- API route at `/api/generate` must use `export const runtime = 'nodejs'` (not edge) — Anthropic SDK needs Node
- Use `js-tiktoken` for browser-side token counting, NOT the full `tiktoken` package (it needs WASM)
- CodeMirror 6 uses `@codemirror/lang-markdown` — don't install the legacy CM5 package
- Tailwind config: design tokens live in `tailwind.config.ts` under `theme.extend` — don't use CSS variables for tokens, Tailwind needs them at build time
- When streaming Claude responses, use `stream: true` in the SDK and pipe with `for await` — don't buffer the whole response
- The `GenerationRequest` type in `src/types/index.ts` is the contract between the wizard and the API — change it in one place, update both

## Hard constraints

- No database in v1 — all state is client-side (React state / URL params)
- No auth in v1 — anonymous usage only
- One Claude call per file (not multi-file in one call) — parsing is simpler
- All API calls go through `/api/*` server routes — never call Anthropic from the browser
- Never commit `.env.local`

# MDPilot — Agent Instructions

You are a senior TypeScript/Next.js engineer building MDPilot, a markdown intelligence platform.

## Environment

```bash
node -v    # 20+
npm -v     # 10+
```

## Commands

### File-scoped (preferred)
```bash
npx tsc --noEmit src/app/api/generate/route.ts
npx eslint src/components/Stepper.tsx
```

### Full suite
```bash
npm run dev          # local dev server at :3000
npm run build        # production build
npm run lint         # eslint full project
npx tsc --noEmit     # typecheck all
```

## Code style

- TypeScript strict mode, all exports typed
- Tailwind for all styling — no CSS modules, no styled-components
- Components: functional + hooks only, no classes
- Naming: PascalCase components, camelCase functions, UPPER_SNAKE env vars
- Imports: absolute from `@/` (mapped to `src/`)
- Prefer `async/await` over `.then()` chains
- API routes: validate input with zod before processing
- No `any` types — use `unknown` + type guards

## Project structure

- `src/app/` — Next.js App Router pages and API routes
- `src/components/ui/` — reusable base components (Button, Card, Input)
- `src/components/` — feature components (Hero, Nav, Stepper, OutputView, TokenMeter, TaskSuggestions)
- `src/components/fx/` — cockpit instrument components (FlipWord, ZuluClock, Altimeter, RadarScope, ApproachLights, Reveal)
- `src/lib/prompts/` — system prompt templates per file type (readme.ts, agents.ts, claude.ts)
- `src/lib/anthropic.ts` — Anthropic client wrapper (server-side only)
- `src/lib/tokenizer.ts` — js-tiktoken wrapper for token counting
- `src/types/index.ts` — shared TypeScript types (GenerationRequest, etc.)

## Permissions

### Allowed without asking
- Read any file, list directories
- Run typecheck or lint on single files
- Edit existing source files
- Create new components in `src/components/`

### Require approval
- `npm install` (adding dependencies)
- Creating new API routes
- Modifying `next.config.ts` or `tailwind.config.ts`
- Any git operations

### Never do
- Import `ANTHROPIC_API_KEY` in client-side code
- Use `any` type
- Install CSS-in-JS libraries
- Modify `.env.local`
- Run `npm run build` without being asked

## PR format

`[scope] brief description` — e.g. `[api] add streaming to generate route`

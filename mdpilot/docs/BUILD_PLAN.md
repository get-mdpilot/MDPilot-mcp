# MDPilot — Build Plan

## v1 MVP (~5 weeks)

### Week 1 — Foundation & Claude pipe
- [x] Scaffold Next.js 14 + TypeScript + Tailwind
- [x] Design tokens, base components
- [x] Home page with 3 mode cards (Generate / Task / Convert)
- [x] Route pages for /generate, /task, /convert
- [ ] Install deps: @anthropic-ai/sdk, js-tiktoken, zod, react-markdown, jszip
- [ ] Build /api/generate server route
- [ ] Verify one end-to-end Claude call
- [ ] Deploy to Vercel

### Week 2 — Intake wizard
- [ ] Stepper component with progress dots + validation
- [ ] Q1 "what are you building" (6 options)
- [ ] Q2 "who is it for" (3 options: me / team / public)
- [ ] Q3 "which AI tools" (multi-select: Claude Code / Cursor / Copilot / Windsurf / ChatGPT)
- [ ] Tech stack paste with live regex detection (~20 patterns)
- [ ] File recommendation logic (answers → which files)
- [ ] Assemble typed GenerationRequest → POST to /api/generate

### Week 3 — Generation engine
- [ ] Encode 3 system prompts (README, AGENTS, CLAUDE) as templates with {slots}
- [ ] Fill slots from GenerationRequest
- [ ] One Claude call per file with per-file progress UI
- [ ] Render generated markdown in tabs
- [ ] Error handling + per-file retry

### Week 4 — Token optimizer (moat)
- [x] Pass 1: js-tiktoken, per-file + total token counts
- [x] Pass 2: boilerplate strip (filler-phrase regex)
- [x] Pass 3: cross-file dedup (heading chunking + string similarity)
- [x] Before/after token meter + per-pass savings log
- [x] "Apply optimizations" toggle (Original/Optimized)

### Week 5 — Output, quick wins, launch
- [x] Split-pane: CodeMirror left, rendered preview right
- [x] Editable output before export
- [x] Copy / download .md / download .zip
- [x] "How to use this file" panel per file type
- [x] Empty/error states + mobile pass
- [x] Final QA + landing page (deploy: manual via `vercel --prod`)

## v2 — Full platform ✅ COMPLETE
- [x] Task mode (paste ticket → TASK.md + SPEC.md)
- [x] Convert mode (MarkItDown via CLI / child_process; cross-mode handoff)
- [x] Optimizer passes 4-5 (verbose compression, line compression)
- [x] Multi-model choice (Claude / GPT-4o / Gemini / Groq) with provider fallback
- [x] Badge generator, template gallery, auto-TOC, editor toolbar
- [x] 9 file types: + SKILL.md, DESIGN.md, CONTRIBUTING.md, SECURITY.md, CONTEXT.md
- [x] Shared OutputView across all 3 modes

## v3 — Growth (next milestone)
- [ ] Shareable public links (read-only URLs)
- [ ] Light accounts + saved history
- [ ] Pricing + billing (Stripe)
- [ ] Analytics (PostHog)
- [ ] Real PDF/scanned-doc OCR in Convert mode
- [ ] Streaming generation (token-by-token output)

## Out of scope (for now)
- GitHub sync / one-click PR
- Drag-and-drop section editor
- Real-time collaboration
- Full version history with diffs

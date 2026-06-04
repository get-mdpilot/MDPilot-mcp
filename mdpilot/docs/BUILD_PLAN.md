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
- [ ] Pass 1: js-tiktoken, per-file + total token counts
- [ ] Pass 2: boilerplate strip (filler-phrase regex)
- [ ] Pass 3: cross-file dedup (heading chunking + string similarity)
- [ ] Before/after token meter + per-pass savings log
- [ ] "Apply optimizations" toggle

### Week 5 — Output, quick wins, launch
- [ ] Split-pane: CodeMirror left, rendered preview right
- [ ] Editable output before export
- [ ] Copy / download .md / download .zip
- [ ] "How to use this file" panel per file type
- [ ] Empty/error states + mobile pass
- [ ] Final QA + deploy + landing page

## v2 — Full platform (~6-8 weeks after v1)
- Task mode (paste ticket → TASK.md)
- Convert mode (MarkItDown via MCP)
- Optimizer passes 4-5 (compression, structure)
- Multi-model choice (Claude / GPT / Gemini)
- Badge generator, template gallery, auto-TOC
- More file types: SKILL.md, DESIGN.md, CONTRIBUTING.md, SECURITY.md, CONTEXT.md

## v3 — Growth (~4-6 weeks after v2)
- Shareable public links (read-only URLs)
- Light accounts + saved history
- Pricing + billing (Stripe)
- Analytics (PostHog)

## Out of scope (for now)
- GitHub sync / one-click PR
- Drag-and-drop section editor
- Real-time collaboration
- Full version history with diffs

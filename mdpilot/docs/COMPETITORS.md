# MDPilot — Competitive Analysis

## Our moat (things no competitor has)

1. **Cross-file token optimizer** — dedup, boilerplate strip, compression
2. **AI instruction file generation** — AGENTS.md, CLAUDE.md, SKILL.md, DESIGN.md
3. **Task mode** — paste ticket → agent-ready TASK.md
4. **"How to use this file" guide** — explains what each file unlocks in which IDE
5. **3-question onboarding** — plain language even non-devs can answer
6. **MarkItDown integration** — any file → clean markdown as input layer

## Competitors and their gaps

### readme.so
- What it does: drag-drop README builder, simple UI, free
- Gap: README only. No AI depth. No agents.md. No token optimization. No task mode.

### readme-ai (eli64s)
- What it does: CLI, repo-aware, multi-LLM support
- Gap: CLI only (no web UI). No task mode. No AGENTS.md/SKILL.md. Dev-only.

### ReadmeCodeGen
- What it does: web + GitHub sync, AI polish
- Gap: README only. No token optimization. No agent instruction files.

### GitBook / Notion AI
- What it does: full doc platform, collaboration, rich editor
- Gap: Generic AI. Not built for AI instruction files. Overkill for a dev wanting CLAUDE.md in 2 minutes.

### Document360
- What it does: enterprise documentation platform
- Gap: Expensive. Heavy setup. Zero awareness of AGENTS.md/SKILL.md standards.

### Jira-to-Markdown tools
- What it does: raw ticket export to markdown
- Gap: Export only, no AI generation. CLI/bash only. Can't handle Slack threads or comments.

## Key research backing

- AGENTS.md adopted by 20,000+ repos, donated to Linux Foundation Dec 2025
- GitHub Copilot added native AGENTS.md support Aug 2025
- ETH Zurich: bloated AI instruction files reduce agent success by ~3%
- Good AGENTS.md reduces output tokens ~20% and completion time 20-28%
- DESIGN.md spec published by Google Labs April 2026
- Developers average 4+ clarification questions per poor ticket (Task mode solves this)

# Changelog

Notable changes across the MDPilot platform — the website, the `mdpilot-mcp` npm
package, and the VS Code extension. Per-package detail lives in each package's own
changelog:

- [`packages/vscode/CHANGELOG.md`](packages/vscode/CHANGELOG.md) — VS Code extension
- [`packages/mcp/CHANGELOG.md`](packages/mcp/CHANGELOG.md) — MCP server

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## 2026-06-17

### VS Code extension `0.1.4`
- Cleaner native Settings panel (controls, dropdown, buttons, status, hint).
- Selected provider is now honored — other provider keys are stripped before the
  server launches, so a stray `GROQ_API_KEY` can't override your choice.
- Friendly rate-limit message in Chat instead of a raw 413.
- Demo animation at the top of the README / Marketplace listing.

### MCP server `mdpilot-mcp@0.3.3`
- Provider-aware repo-context token budget (Groq 6k / NVIDIA 12k / paid 30k) to
  stop large repos from overflowing free-tier limits with `413 Request too large`.

### Website
- VS Code docs updated with the sidebar panel (Chat + Settings) and the
  SecretStorage key flow.

## 2026-06-16

### VS Code extension `0.1.0` → `0.1.3`
- Initial Marketplace release: generate `AGENTS.md` / `CLAUDE.md` / `README.md` /
  `TASK.md`, drift check with a status-bar indicator, save/load session context.
- Automatic key resolution from SecretStorage, settings, env vars, and existing
  MCP config files (`~/.cursor/mcp.json`, `~/.claude/mcp.json`, …).
- Sidebar panel with **Chat + Settings** tabs and encrypted SecretStorage.

### MCP server `mdpilot-mcp@0.3.2`
- MCP registry metadata (`mcpName`, `server.json`, repository links).

### Website
- "Night Approach" redesign — aviation instruments, new logo, B612 wordmark.
- Launched the Logbook (blog) with custom WebP artwork.
- Added the VS Code extension docs page.

## 2026-06-15 and earlier

### MCP server `mdpilot-mcp@0.3.1`
- Agent behavior directives: human voice, plan-first ai_exec prompts, risk check.

### Platform
- v2 shipped — all 3 modes (Generate · Task · Convert) plus Explain, Image →
  Prompt, and Interview Primer. 9 file types, 5-pass token optimizer, multi-model
  choice, badge generator, templates, auto-TOC.

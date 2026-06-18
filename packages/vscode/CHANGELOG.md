# Changelog

All notable changes to the **MDPilot** VS Code extension are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [0.1.5] — 2026-06-18

### Changed
- **Panel UI polish** — same structure, product-grade look:
  - Brand header with the MDPilot mark; one amber accent (`#E6A23C`) applied to the
    active tab, primary/send buttons, focus rings, and chip hover.
  - **Chat empty state** — logo, "What do you want to set up?", and four clickable
    suggestion chips (Generate AGENTS.md · README · Check drift · New task…).
  - **Result bubbles** — action name + ✓ + token count, output in a monospace block
    with **Copy** and **Open file**; user vs reply styling.
  - **Loading + error states** — spinner bubble while a tool runs; inline error bubble
    with a Retry chip.
  - **Settings** — key area grouped in a bordered card; secondary actions ("Get free
    Groq key", "Clear stored key") moved to a divided footer; Clear is now a quiet
    danger-tinted button.
  - All base colors use `var(--vscode-*)` so it stays native in light + dark + Cursor +
    Windsurf. Script runs under a CSP nonce; no remote assets.

## [0.1.4] — 2026-06-17

### Added
- Demo animation at the top of the README (shown on the Marketplace listing).

### Changed
- **Cleaner Settings panel** — native-height form controls, a custom dropdown
  chevron, consistent primary/secondary buttons, a free-tier rate-limit hint, and
  the connection status moved directly under the masked key.

### Fixed
- **Provider is now honored.** The extension strips all other provider keys before
  launching the MCP server, so the provider you pick in Settings is the one used —
  a stray `GROQ_API_KEY` in your shell or `mcp.json` no longer overrides it.
- Friendly, actionable message in Chat when a provider's free-tier rate limit is
  hit (413 / tokens-per-minute), instead of the raw API error.

## [0.1.3] — 2026-06-16

### Added
- **Sidebar panel with Chat + Settings tabs.**
  - **Chat** — type `generate agents`, `check drift`, `task: …` etc. and the
    extension routes to the right tool and shows the result inline.
  - **Settings** — provider dropdown, masked key (`•••last4`), change-key field,
    clear-key button, and a connection status line.
- Encrypted **SecretStorage** for the API key (never written to `settings.json`).
- Gear icon in the panel title bar, `MDPilot: Open Settings` and
  `MDPilot: Update API Key` commands, and a first-run notification when no key
  is configured.

## [0.1.2] — 2026-06-16

### Added
- **Automatic key resolution** — reads an existing key from SecretStorage,
  VS Code settings, shell env vars, `~/.cursor/mcp.json`, `~/.claude/mcp.json`,
  `~/.config/windsurf/mcp.json`, or a workspace `.env` — so users who already
  configured the MCP server are never prompted.

## [0.1.1] — 2026-06-16

### Fixed
- Marketplace packaging — icon, license, and `.vsixignore` so the package is
  ~170 KB instead of bundling `node_modules`.

## [0.1.0] — 2026-06-16

### Added
- Initial release. Generate `AGENTS.md`, `CLAUDE.md`, `README.md`, and `TASK.md`
  from the command palette and Explorer context menu.
- `Check Docs for Drift` with a status-bar indicator, plus `Save` / `Load Session
  Context`.
- Works in VS Code, Cursor, and Windsurf — runs `mdpilot-mcp` under the hood, so
  no generation logic is duplicated.

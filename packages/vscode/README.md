# MDPilot — VS Code Extension

**Give your AI agent the perfect starting point.**

![MDPilot in action — generate AGENTS.md, CLAUDE.md and task prompts from the sidebar](assets/vscode-demo.gif)

Generate `AGENTS.md`, `CLAUDE.md`, `README.md`, and expert-grade task prompts directly from inside VS Code, Cursor, or Windsurf — powered by your existing AI provider key (Groq is free).

---

## Features

### Sidebar panel — Chat + Settings
The MDPilot icon in the activity bar opens a two-tab panel:
- **Chat tab** — type `"generate agents"`, `"check drift"`, `"task: [description]"` etc. and the extension calls the right tool and streams the result back.
- **Settings tab** — pick your provider, view your masked key, paste a new key, and clear the stored key — all without touching `settings.json`. A gear icon (⚙) in the panel title bar opens Settings directly.

### Generate AI instruction files
- **AGENTS.md** — Full project context for OpenAI Agents, AutoGen, LangGraph. Verified commands, architecture map, test strategy.
- **CLAUDE.md** — Claude Code / Cursor / Windsurf instructions. Verified build commands, gotchas, hard constraints.
- **README.md** — Professional README generated from your actual repo structure.

### Generate Task Prompts
Paste a Jira ticket, Slack thread, or plain description → get a `TASK.md` with repo context, acceptance criteria, and implementation steps pre-filled for your AI agent.

### Drift Detection
Checks your existing `AGENTS.md` and `CLAUDE.md` against the current codebase. Flags commands that no longer exist, missing files, and outdated architecture sections. Status bar shows drift state at a glance.

### Session Context
Save and load session summaries so your next AI session picks up exactly where you left off.

---

## Quick Start

1. Install this extension
2. Open a project folder in VS Code / Cursor / Windsurf
3. Click the **MDPilot icon** in the activity bar → Settings tab → add your API key
4. Or use `Ctrl+Shift+P` → **MDPilot: Generate AGENTS.md** (you'll be prompted on first run)

**No key?** Groq is free at [console.groq.com/keys](https://console.groq.com/keys) — no credit card required.

---

## API Key Resolution

The extension looks for a key in this order — no setup needed if you already configured the MCP server:

1. Encrypted SecretStorage (set via the Settings tab)
2. `mdpilot.apiKey` in VS Code settings
3. Shell environment variables (`GROQ_API_KEY`, `ANTHROPIC_API_KEY`, etc.)
4. Existing MCP config files (`~/.cursor/mcp.json`, `~/.claude/mcp.json`, `~/.config/windsurf/mcp.json`)
5. Workspace `.env.local` / `.env`
6. Prompt (stores result in SecretStorage)

---

## Commands

| Command | What it does |
|---|---|
| `MDPilot: Generate AGENTS.md` | Generates a verified AGENTS.md for your repo |
| `MDPilot: Generate CLAUDE.md` | Generates CLAUDE.md for Claude Code / Cursor |
| `MDPilot: Generate README.md` | Generates a professional README |
| `MDPilot: Generate Task Prompt` | Converts a ticket/description into TASK.md |
| `MDPilot: Check Docs for Drift` | Checks if your existing docs are out of date |
| `MDPilot: Save Session Context` | Saves current session summary to disk |
| `MDPilot: Load Session Context` | Shows the last saved session context |
| `MDPilot: Open Settings` | Opens the Settings tab in the MDPilot panel |
| `MDPilot: Update API Key` | Opens the Settings tab to change your key |
| `MDPilot: Clear stored API key` | Removes the key from SecretStorage |
| `MDPilot: Setup` | Opens the full setup guide at mdpilot.in/docs/vscode |

---

## Settings

| Setting | Default | Description |
|---|---|---|
| `mdpilot.apiKey` | `""` | AI provider key. Prefer the Settings tab — it stores encrypted. |
| `mdpilot.provider` | `groq` | Provider: `groq`, `nvidia`, `anthropic`, `openai` |
| `mdpilot.autoCheckDrift` | `true` | Auto-check for drift when a workspace opens |

**Groq and NVIDIA both have free tiers** — no paid key required to get started.

---

## How it works

The extension is a thin UI layer over the [`mdpilot-mcp`](https://www.npmjs.com/package/mdpilot-mcp) server. It spawns the MCP server as a child process and calls its tools — no generation logic is duplicated. This means the same engine powers the MCP integration in Claude Code/Cursor and this extension.

---

## Links

- [mdpilot.in](https://mdpilot.in) — web app
- [MCP server docs](https://mdpilot.in/docs/mcp) — use MDPilot in Claude Code, Cursor, Windsurf natively
- [Changelog](CHANGELOG.md) — release notes
- [GitHub](https://github.com/get-mdpilot/MDPilot-mcp) — source
- [Issues](https://github.com/get-mdpilot/MDPilot-mcp/issues) — bug reports

---

## License

MIT — © 2026 Viveon Gizit Pvt Ltd

# mdpilot-mcp

MCP server for [MDPilot](https://mdpilot.in) — generate `AGENTS.md`, `CLAUDE.md`, `TASK.md`, and more, directly from inside Claude Code, Cursor, Windsurf, or Goose. Reads your actual repo so outputs reference real scripts and paths — never hallucinated ones.

---

## Quick setup — one command

```bash
npx -y mdpilot-mcp setup
```

Detects your editor, walks you through a free [Groq key](https://console.groq.com/keys) (no credit card), and writes the config. Or skip prompts: `npx -y mdpilot-mcp setup --key gsk_... --client claude`.

---

## Manual install

**Method A — npx (recommended)**

Add this block to your client's MCP config. Set whichever AI key you have:

```json
{
  "mcpServers": {
    "mdpilot": {
      "command": "npx",
      "args": ["-y", "mdpilot-mcp"],
      "env": {
        "GROQ_API_KEY": "gsk_..."
      }
    }
  }
}
```

**Claude Code CLI shortcut:**

```bash
claude mcp add mdpilot \
  -e GROQ_API_KEY=gsk_... \
  -- npx -y mdpilot-mcp
```

**Method B — from source** (for contributors / local dev)

```bash
cd packages/mcp
npm install && npm run build
```

Then point your config at the compiled output:

```json
{
  "mcpServers": {
    "mdpilot": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp/dist/index.js"],
      "env": {
        "GROQ_API_KEY": "gsk_..."
      }
    }
  }
}
```

Full setup guide (all clients): **[mdpilot.in/docs/mcp](https://mdpilot.in/docs/mcp)**

---

## Prerequisites

- Node.js 20+
- One AI API key — the server tries them in this order:

| Key | Provider | Tier |
|-----|----------|------|
| `GROQ_API_KEY` | Groq — Llama 3.3 70B | **Free tier** — [console.groq.com](https://console.groq.com) |
| `NVIDIA_API_KEY` | NVIDIA NIM — Llama 3.3 70B | **Free tier** — [build.nvidia.com](https://build.nvidia.com) |
| `ANTHROPIC_API_KEY` | Anthropic — Claude | Paid — [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | OpenAI — GPT-4o | Paid — [platform.openai.com](https://platform.openai.com) |

Set exactly one. Calls are billed to your key — MDPilot does not proxy them.

> **No key?** The three non-AI tools (`analyze_project`, `optimize_markdown`, `check_drift`) work without any key. Only generation tools require one.

---

## The 10 tools

| Tool | What it does |
|------|-------------|
| `analyze_project` | Scan a repo — detects stack, scripts, package manager, structure, and any configured MCP servers. |
| `generate_md_file` | Generate `readme` / `agents` / `claude` / `contributing` / `security` / `skill` / `design` / `context` grounded in real repo data. Add `tokenDiscipline: true` to inject terse-response rules into AGENTS.md/CLAUDE.md. |
| `generate_task_file` | Turn a ticket, Slack thread, or GitHub issue into a structured `TASK.md` with requirements and an agent prompt block. |
| `explain_code` | Analyze a file or directory → `WALKTHROUGH.md` tuned to any audience (AI agent, team, learner, non-technical). |
| `optimize_markdown` | Run the 5-pass token optimizer on any markdown. Add `aggressive: true` for the 6th pass (soft-hedge collapse — never alters code or commands). |
| `image_to_prompt` | Analyze a local image → recreation prompt for FLUX, Stable Diffusion, Midjourney, DALL-E, Gemini. |
| `check_drift` | Detect stale docs — broken commands, broken paths, removed MCP servers, new undocumented files. |
| `update_docs` | Patch ONLY the stale sections identified by `check_drift`, preserving everything else. |
| `save_context` | Persist session state to `CONTEXT.md` — decisions, state, next steps. Last 5 sessions kept. Secrets auto-redacted. Your data never leaves your machine. |
| `load_context` | Load prior session context. Drift-checks every command and path inline — stale references annotated automatically. |

All tools accept `verbose: true` for detailed output; the default is compact (dense single-line footers).

---

## Quick start

Once configured, open any repo in your IDE and try:

```
"Use mdpilot to generate an AGENTS.md for this project and write it to disk."
```

```
"Use mdpilot to check my docs for drift."
```

**Session memory (persistent context across sessions):**
```
# End of session:
"Use mdpilot to save our session context — decisions: [X], next steps: [Y]"

# Start of next session:
"Load the project context via mdpilot"
```

---

## Security

The server reads files from the repo path you pass to each tool. It does NOT read `.env` files or secrets. `writeToDisk` writes only to the project root you specify — never outside it.

---

## License

MIT — [mdpilot.in](https://mdpilot.in)

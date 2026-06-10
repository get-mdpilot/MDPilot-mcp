# MDPilot

**Markdown intelligence platform** — generate production-grade AI instruction files, optimize tokens, and convert any file to markdown. Works in the browser and as an MCP server inside your IDE.

[mdpilot.in](https://mdpilot.in) · [Docs](https://mdpilot.in/docs) · [MCP setup](https://mdpilot.in/docs/mcp) · [npm](https://www.npmjs.com/package/mdpilot-mcp)

---

## What it generates

| Mode | Input | Output |
|---|---|---|
| **Task** _(primary)_ | Ticket · Slack thread · spec | TASK.md + SPEC.md — structured, gap-checked, agent-ready |
| **Generate** | 7-step wizard + tech stack | README · AGENTS · CLAUDE · CONTRIBUTING · SECURITY · SKILL · DESIGN · CONTEXT |
| **Convert** | PDF · DOCX · CSV · HTML | Clean markdown via MarkItDown |
| **Explain** | Code file or directory | WALKTHROUGH.md tuned to any audience |
| **Image → Prompt** | Any image | Recreation prompt for FLUX / SD / Midjourney / DALL-E |
| **Interview primer** | Role + level + JD | Ready-to-paste AI coach prompt |

Every output runs through a **5-pass token optimizer** (20–40% reduction) and a **self-verification loop** that checks generated commands against your real repo before writing anything.

---

## MCP server — use MDPilot from inside your IDE

The `mdpilot-mcp` npm package exposes all 8 tools directly to Claude Code, Cursor, Windsurf, and Goose. The server reads your actual repo on disk — generated files reference real scripts and paths, never guesses.

**One-command setup** (gets you a free key + writes the config):
```bash
npx -y mdpilot-mcp setup
```

Or non-interactively:
```bash
npx -y mdpilot-mcp setup --key gsk_... --client claude
```

**Manual config** (any MCP-compatible client):
```json
{
  "mcpServers": {
    "mdpilot": {
      "command": "npx",
      "args": ["-y", "mdpilot-mcp"],
      "env": { "GROQ_API_KEY": "gsk_..." }
    }
  }
}
```

Accepted keys (tried in order — Groq and NVIDIA are free):
`GROQ_API_KEY` · `NVIDIA_API_KEY` · `ANTHROPIC_API_KEY` · `OPENAI_API_KEY`

---

## 8 MCP tools

| Tool | What it does |
|---|---|
| `analyze_project` | Scan repo — detects stack, scripts, package manager, structure |
| `generate_md_file` | Generate any instruction file grounded in real repo data |
| `generate_task_file` | Turn a ticket or thread into a structured TASK.md |
| `explain_code` | Generate WALKTHROUGH.md for any file or directory |
| `optimize_markdown` | Run the 5-pass token optimizer on any markdown |
| `image_to_prompt` | Analyze an image → recreation prompt |
| `check_drift` | Detect stale docs — broken commands, broken paths |
| `update_docs` | Patch only the stale sections, preserve everything else |

---

## Multi-model

| Provider | Model | Notes |
|---|---|---|
| Anthropic | claude-sonnet-4-6 | Best instruction-file quality |
| Groq | llama-3.3-70b-versatile | Free tier — recommended default |
| NVIDIA NIM | meta/llama-3.3-70b-instruct | Free tier |
| OpenAI | gpt-4o | |
| Google | gemini-2.0-flash | |

---

## Quick local setup

```bash
git clone https://github.com/adgenie1434-glitch/md-pilot
cd md-pilot/mdpilot
npm install
cp .env.example .env.local   # add at least one AI key
npm run dev                   # http://localhost:3000
```

MCP server:
```bash
cd packages/mcp
npm install && npm run build
npm run inspect               # MCP Inspector — test tools interactively
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for full architecture, file trees, environment variables, and contribution guide.

---

## Stack

Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · `@modelcontextprotocol/sdk` · `repomix` · `js-tiktoken` · `zod`

---

## Legal

Operated by [Mores and Technologies](https://mdpilot.in) · Bengaluru, India  
[Privacy Policy](https://mdpilot.in/privacy) · [Terms of Service](https://mdpilot.in/terms) · [Report an issue](https://github.com/adgenie1434-glitch/md-pilot/issues/new/choose)

MIT license

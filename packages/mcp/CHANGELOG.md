# Changelog

All notable changes to the **mdpilot-mcp** server are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [0.3.4] — 2026-06-18

### Changed
- **Optimizer protects insight.** The verbose and aggressive compression passes now
  skip any line carrying a specific technical noun (CLI flag, ALL_CAPS constant,
  version, region/zone code, metric, or inline-code span). Prevents expert detail like
  `us-east-1 only for CloudFront certs` from being flattened into generic phrasing.

### Added
- **`[NEEDS_EXPERT: …]` flags are logged to stderr** (`[mdpilot:needs-expert]`) when a
  generation honestly admits a domain gap — a usage-driven backlog of which sub-domains
  to deepen with real expertise, rather than fabricated lenses.

## [0.3.3] — 2026-06-17

### Fixed
- **Provider-aware context budget.** The packed repo context is now sized to the
  active provider's per-minute token limit — **Groq 6k / NVIDIA 12k / Anthropic ·
  OpenAI 30k** — instead of a fixed 30k. This stops generation on large repos from
  overflowing free-tier rate limits and returning `413 Request too large`.

## [0.3.2] — 2026-06-16

### Added
- MCP registry metadata — `mcpName`, `server.json`, and repository links so the
  server can be listed in the official MCP registry.

## [0.3.1] — 2026-06-15

### Added
- **Agent behavior directives**:
  - **Human voice** for prose files (README, CONTRIBUTING, DESIGN); hard-ignored
    for agent files (AGENTS.md, CLAUDE.md, SKILL.md).
  - **Plan-first** ai_exec prompts — generated agent prompts open with a
    "write a 3-5 line plan" step plus step-verify gates.
  - **Agent risk check** — appends a Watch-outs cross-check to the agent prompt
    block when Watch-outs are present.

## [0.3.0] and earlier

- 10 tools: `analyze_project`, `generate_md_file`, `generate_task_file`,
  `explain_code`, `optimize_markdown`, `image_to_prompt`, `check_drift`,
  `update_docs`, `save_context`, `load_context`.
- Multi-provider support (Groq · NVIDIA · Anthropic · OpenAI), repo-grounded
  generation, 5-pass token optimizer, drift detection, and session context.

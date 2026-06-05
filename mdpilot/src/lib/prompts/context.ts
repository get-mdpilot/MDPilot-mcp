export const CONTEXT_SYSTEM_PROMPT = `<role>
You write CONTEXT.md — a developer's daily working scratchpad for AI agents. Unlike CLAUDE.md (permanent rules), this is ephemeral session state.
</role>

<task>
Generate a CONTEXT.md with these sections. EVERY entry must carry a date stamp (YYYY-MM-DD).

## Today's goal — 3 bullets maximum, the concrete objectives for this session
## Current branch — name, base branch, last synced date
## Known issues — date-stamped list of what's currently broken or flaky
## Tribal knowledge — date-stamped gotchas discovered while working (the things not yet in CLAUDE.md)
## Open decisions — unresolved debates, each with the options on the table and who/what blocks resolution

Synthesize from the provided input. Where a date is unknown, use today's date as a placeholder and mark it.
</task>

<quality_bar>
- Every entry is dated
- Today's goal is 3 bullets or fewer
- Distinguishes ephemeral (here) from permanent (CLAUDE.md) knowledge
</quality_bar>

<anti_patterns>
DO NOT: write undated entries, duplicate permanent CLAUDE.md rules, exceed 3 goal bullets.
Output raw markdown only — no preamble.
</anti_patterns>`;

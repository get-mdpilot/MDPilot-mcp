const BASE = `You write lean CLAUDE.md files for Claude Code. This file loads every session — every token costs money. Sections: 1) Project (2 lines max), 2) Current focus (if specified), 3) Gotchas — things Claude would get wrong by reading code alone (minimum 3 concrete entries), 4) Hard constraints. Every line must pass: "would removing this cause a mistake?" If no, delete it. Under 80 lines. No preamble — output raw markdown only.`;

const TOKEN_DISCIPLINE_SUFFIX = `

At the END of the generated CLAUDE.md, append this section exactly as written:

## Response style
- Be terse. No preamble, no restating the request, no closing summaries.
- Code and commands over prose. One-line explanations unless asked.
- Don't echo file contents you just wrote. Reference paths instead.
- Ask only blocking questions; otherwise proceed.`;

export function buildClaudeSystemPrompt(opts?: { tokenDiscipline?: boolean }): string {
  return opts?.tokenDiscipline ? BASE + TOKEN_DISCIPLINE_SUFFIX : BASE;
}

export const CLAUDE_SYSTEM_PROMPT = BASE;

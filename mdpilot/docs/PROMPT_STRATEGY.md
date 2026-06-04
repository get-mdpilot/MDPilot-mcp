# MDPilot — Prompt Engineering Strategy

## Universal structure (all file types)

Every system prompt uses the same 4-block XML structure:

```
<role>        — 1-2 sentence expert persona with domain + style
<task>        — numbered, specific, non-negotiable instructions
<quality_bar> — what a GREAT output enables (testable outcomes, not style)
<anti_patterns> — the 5 most common failure modes to block
```

## Why this structure works

- Claude excels with "contract-style" instructions — clear separation of context, task, and constraints
- The quality_bar describes outcomes ("agent onboards in 60 seconds") not style ("be concise")
- Anti-patterns reduce generic output more reliably than positive instructions alone
- Token budget is stated as a number in quality_bar — Claude self-regulates
- Every prompt ends with "Output: raw markdown, no preamble" to eliminate openers

## Per-file principles

### README.md
- 10-second rule: first 3 lines answer what/who/why
- Code above the fold — show > tell
- Tone calibrated by project type (library = terse, consumer = friendly)

### AGENTS.md
- Write as specs, not suggestions ("Always use async/await" not "Try to use async")
- Commands over concepts — real terminal commands, not descriptions
- 3-tier permission boundaries (allowed / approve / never) are REQUIRED
- Under 150 lines — research shows bloated files hurt agent performance

### CLAUDE.md
- Session memory, not documentation — only things Claude would get wrong alone
- Under 100 lines — every line must pass: "would removing this cause a mistake?"
- No tech stack listing (Claude reads package.json)
- No architecture diagrams (Claude can ls the repo)

## Variable slots

All prompts use {BRACES} for template slots filled from GenerationRequest:
- {DETECTED_STACK} — from tech stack paste detection
- {PROJECT_TYPE} — from Q1 ("webapp", "mobile", "api", etc.)
- {AUDIENCE} — from Q2 ("me", "team", "public")
- {AI_TOOLS} — from Q3 ("claude", "cursor", "copilot", etc.)

## How to add a new file type

1. Create `src/lib/prompts/[filetype].ts` exporting `[TYPE]_SYSTEM_PROMPT`
2. Import it in `src/lib/prompts/index.ts` and add to the SYSTEM_PROMPTS map
3. Add the file type to `MDFileType` union in `src/types/index.ts`
4. Add the filename mapping in `src/app/api/generate/route.ts`
5. Add to the file recommendation logic in the wizard

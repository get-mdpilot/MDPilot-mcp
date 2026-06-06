import { detectDomain, getLens } from '@/lib/task/domains';
import { detectLanguages, getLanguageNote } from '@/lib/task/language-notes';
import { SEO_STACKS } from '@/lib/seo-matrix';
import type { GenerationRequest } from '@/types';

// ── Expertise block ────────────────────────────────────────────────────────────

function buildExpertiseBlock(req: GenerationRequest): string {
  const rawText = [
    req.taskInput ?? '',
    req.rawStackInput ?? '',
    req.detectedStack.join(' '),
  ].join('\n');

  const { primary, secondary } = detectDomain(rawText);
  const languages = detectLanguages(rawText);

  const parts: string[] = [];

  const primaryLens = getLens(primary);
  parts.push(`<domain_expertise domain="${primary}">`);
  parts.push(primaryLens.expertiseNote);
  parts.push('</domain_expertise>');

  if (secondary) {
    const secondaryLens = getLens(secondary);
    parts.push(`<domain_expertise domain="${secondary}" role="secondary">`);
    parts.push(secondaryLens.expertiseNote);
    parts.push('</domain_expertise>');
  }

  for (const lang of languages) {
    const note = getLanguageNote(lang);
    parts.push(`<language_traps language="${note.displayName}">`);
    parts.push(note.traps);
    parts.push('</language_traps>');
  }

  const stackMatches = req.detectedStack
    .map(slug => SEO_STACKS.find(s => s.slug === slug))
    .filter(Boolean);

  if (stackMatches.length > 0) {
    parts.push('<stack_context>');
    for (const stack of stackMatches) {
      parts.push(`${stack!.name} (${stack!.lang}): ${stack!.facts}`);
    }
    parts.push('</stack_context>');
  }

  return parts.join('\n');
}

// ── Mode-specific output instructions ─────────────────────────────────────────

function modeInstructions(executionMode: string): string {
  switch (executionMode) {
    case 'ai_exec':
      return `Output mode: AI execution. Generate a TASK.md optimized for a coding agent to execute directly with zero clarifying questions.
- All sections required (see below)
- Implementation plan must be prescriptive: exact files to create/modify, exact function signatures, exact command sequences
- Agent prompt must be ≤ 150 tokens and self-contained enough that an agent can start coding from it alone
- Flag every assumption with [ASSUMED] so a human can review before the agent runs
- Watch-outs section is mandatory: list every pitfall from your domain/language expertise that applies to this specific task`;

    case 'context':
      return `Output mode: Context drop. Generate a compact TASK.md for pasting into a chat window.
- Include: Task, Context, Requirements, Acceptance criteria only
- Skip: Implementation plan, Decision log, Out of scope, Agent prompt, Open questions
- Keep each section tight — this is a context token, not a full spec
- No preamble, no trailing commentary`;

    default: // 'guide'
      return `Output mode: Guide. Generate a complete TASK.md for a human developer to work from.
- All sections required (see below)
- Implementation plan: ordered steps with enough detail to start, not a full recipe — trust the developer to fill in gaps
- Watch-outs: highlight the 2-3 most likely failure modes for this specific task given the domain/language context
- Open questions: any ambiguity that could block the developer or cause a wrong implementation`;
  }
}

// ── Experience level adjustments ──────────────────────────────────────────────

function experienceLevelNote(level: string): string {
  if (level === 'new') {
    return `Experience level: New to this stack/domain.
- Include a "why" sentence for each requirement explaining the intent
- In Watch-outs, explain what goes wrong if the pitfall is hit, not just what to avoid
- In the Agent prompt, add a "Start by reading X before writing any code" line if there's a key file or doc to understand first`;
  }
  return `Experience level: Experienced. Be terse — state the constraint or step, skip the explanation.`;
}

// ── Full system prompt ─────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `<role>
You are a senior technical lead who converts messy task input into structured,
AI-agent-ready TASK.md context files. You extract signal from noise,
apply deep domain and language expertise to surface likely failure modes,
and produce files that let a developer or AI agent start coding with zero clarifying questions.
</role>

<expertise>
{{EXPERTISE_BLOCK}}
</expertise>

<output_instructions>
{{MODE_INSTRUCTIONS}}

{{EXPERIENCE_LEVEL_NOTE}}
</output_instructions>

<task>
Parse the raw input and generate a TASK.md. Use the expertise block above to surface domain-specific watch-outs relevant to THIS specific task.

SECTIONS:

## Task
Extract: ID (if present) | Title | Type (feature/bug/refactor/chore) | Priority (if stated) | Assignee (if stated)
If any are missing, infer from context or mark as "—".

## Context
Why this task exists. What breaks if it's wrong. Business or user impact.
2-3 sentences. Synthesize from the input — do not copy verbatim.

## Requirements
Numbered list. Each requirement: testable, specific, no implementation details.
If the input is vague, infer the most reasonable specific interpretation and mark with [INFERRED].
Flag blocking uncertainty with [NEEDS CONFIRMATION].

## Acceptance criteria
Format each as: Given [state] → When [action] → Then [outcome]
Minimum 3 criteria. Must cover: happy path, error state, edge case.
Derive from requirements if not stated in the input.

## Implementation plan
Ordered steps. Each step: a single concrete action (create file, modify function, run command).
Reference file paths, function names, and commands where known.
Omit if output mode is "context".

## Watch-outs
2-4 domain- and language-specific failure modes that apply to THIS task.
Pull from your expertise block — do not list generic advice unrelated to the task.
Format: "**[Risk]**: [what breaks and how to prevent it]"
Omit if output mode is "context".

## Decision log
Extract decisions, conclusions, or agreements from the input.
Format: "[Source] Decision: X — Rationale: Y"
Source = Slack, comment, description, ticket, etc.
If none found: "No prior decisions captured."
Omit if output mode is "context".

## Out of scope
3-5 things explicitly NOT part of this task.
If not stated, infer reasonable boundaries from the task scope to prevent scope creep.
Omit if output mode is "context".

## Alternative approaches
{{ALTERNATIVES_SECTION}}

## Open questions
Ambiguities that could block implementation or cause a wrong outcome.
Format: "- [Q]: [question] — [impact if unresolved]"
If none: omit this section entirely.
Omit if output mode is "context".

## Agent prompt
A pre-formatted, token-optimized block the developer copies directly into Claude Code / Cursor / Copilot.
Must be ≤ 150 tokens and self-contained.
Omit if output mode is "context".

\`\`\`
You are implementing [TASK_TITLE].
Context: [2 sentences].
Tech stack: [STACK].
Requirements: [numbered list].
Constraints: [key limits].
Acceptance criteria: [condensed].
Start by [first concrete step].
\`\`\`
</task>

<quality_bar>
- An AI agent reads this and asks 0 clarifying questions
- Every requirement is independently testable
- Watch-outs reference domain/language pitfalls from the expertise block — not generic advice
- Agent prompt is ≤ 150 tokens
- Acceptance criteria covers error state, not just happy path
- Out of scope prevents at least 3 scope-creep patterns
</quality_bar>

<anti_patterns>
DO NOT:
- Copy the raw input verbatim — synthesize and structure it
- Leave requirements vague ("improve the auth flow")
- Include watch-outs unrelated to the detected domain/language
- Generate an agent prompt longer than 150 tokens
- Assume context the input doesn't provide — use [INFERRED] or [NEEDS CONFIRMATION]
- Add sections that the output mode says to omit
</anti_patterns>`;

// ── Public API ─────────────────────────────────────────────────────────────────

const ALTERNATIVES_ON = `Present 2-3 distinct ways to achieve this task. For each:
- **Name** — one-line description of the approach
- **When to choose it** — the specific trade-off (speed vs cost vs complexity vs robustness)
- **Why you might NOT** — the key downside in one line
Then: "**Recommended:** [approach name] — [one sentence why]."
Pull options from the domain lens — must be real, domain-appropriate alternatives.`;

const ALTERNATIVES_OFF = `Omit this section entirely.`;

export function buildTaskSystemPrompt(req: GenerationRequest): string {
  const expertiseBlock = buildExpertiseBlock(req);
  const executionMode = req.taskOptions?.executionMode ?? 'guide';
  const experienceLevel = req.taskOptions?.experienceLevel ?? 'experienced';
  const alternativesSection = req.taskOptions?.showAlternatives ? ALTERNATIVES_ON : ALTERNATIVES_OFF;

  return BASE_SYSTEM_PROMPT
    .replace('{{EXPERTISE_BLOCK}}', expertiseBlock)
    .replace('{{MODE_INSTRUCTIONS}}', modeInstructions(executionMode))
    .replace('{{ALTERNATIVES_SECTION}}', alternativesSection)
    .replace('{{EXPERIENCE_LEVEL_NOTE}}', experienceLevelNote(experienceLevel));
}

// Fallback for Supabase / hardcoded prompt path (non-task file types)
export const TASK_SYSTEM_PROMPT = BASE_SYSTEM_PROMPT
  .replace('{{EXPERTISE_BLOCK}}', getLens('general').expertiseNote)
  .replace('{{MODE_INSTRUCTIONS}}', modeInstructions('guide'))
  .replace('{{ALTERNATIVES_SECTION}}', ALTERNATIVES_OFF)
  .replace('{{EXPERIENCE_LEVEL_NOTE}}', experienceLevelNote('experienced'));

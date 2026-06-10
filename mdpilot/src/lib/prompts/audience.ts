import type { ReaderAudience, ReadingLevel, GenerationRequest, MDFileType } from '@/types';
import { detectDomain, getLens } from '@/lib/task/domains';

// Human-facing file types that can receive the natural writing style directive.
// Agent-facing types (agents, claude, task, skill, context) are explicitly excluded — they need
// parseable structure over personality and must never receive this directive.
export const HUMAN_FACING_FILE_TYPES = new Set<MDFileType>(['readme', 'walkthrough', 'contributing', 'design']);

export const AGENT_FILE_TYPES = new Set<MDFileType>(['agents', 'claude', 'task', 'skill', 'context']);

export const HUMAN_VOICE_DIRECTIVE = `<writing_style>
Write in a natural human voice:
- No em dashes. Use commas, periods, or parentheses instead.
- Use contractions (it's, you'll, don't).
- Vary sentence length. Short ones are fine.
- Plain words over formal ones (use, not utilize; help, not facilitate).
- No AI-isms: never "delve", "leverage", "robust", "seamless", "comprehensive",
  "it's important to note", "in conclusion".
- Write like a person explaining to a colleague, not a report.
</writing_style>`;

export const AUDIENCE_INSTRUCTIONS: Record<ReaderAudience, string> = {
  ai_agent: `Reader is an AI coding agent. Be terse, structured, and machine-parseable.
No analogies, no hand-holding. Commands and facts only. This is the default behavior.`,

  team: `Reader is a developer joining the team. Assume engineering literacy but no project-specific
knowledge. Explain project-specific choices and conventions — not general programming concepts.
Make it easy for someone to get productive in this codebase on day one.`,

  non_technical: `Reader is non-technical — a founder, PM, investor, client, or stakeholder.
Rules: (1) Define every technical term in plain language on first use. Never assume they know
what a terminal, dependency, API, environment variable, or framework is — explain it inline.
(2) Say what each thing IS and WHY it matters before HOW it works.
(3) Use short analogies for hard concepts (e.g. "a database is like a spreadsheet the app reads from").
(4) Keep sentences short. Prefer active voice. Avoid jargon — if you must use a term, define it immediately.
(5) Add a "Why this matters" intro before technical sections.`,

  learner: `Reader is learning — they want to understand not just follow instructions.
Rules: (1) Explain the reasoning behind each step, not just the step itself.
(2) Teach the concept: link cause and effect ("We do X because otherwise Y would happen").
(3) Point out what to explore next when a concept is introduced.
(4) Flag what is a convention vs what is a requirement ("This name is conventional, not required").
(5) Surface common beginner mistakes around anything tricky.`,
};

export const READING_LEVEL_NOTE: Record<ReadingLevel, string> = {
  plain:    'Language: everyday words, short sentences. Define all technical terms on first use. Analogies welcome.',
  standard: 'Language: normal developer prose. Define only non-obvious or project-specific terms.',
  expert:   'Language: assume deep expertise. Terse. Skip basics, skip definitions.',
};

// Default reading level per reader audience
export const DEFAULT_READING_LEVEL: Record<ReaderAudience, ReadingLevel> = {
  ai_agent:     'expert',
  team:         'standard',
  non_technical: 'plain',
  learner:       'plain',
};

export function buildAudienceDirective(req: GenerationRequest): string {
  const opts = req.generateOptions ?? {
    audience: 'ai_agent' as ReaderAudience,
    readingLevel: 'expert' as ReadingLevel,
    includeReasoning: false,
  };

  // Skip the directive entirely for ai_agent — keeps output lean (today's default)
  if (opts.audience === 'ai_agent') return '';

  const sourceText = [
    req.projectDescription ?? '',
    req.rawStackInput ?? '',
    req.detectedStack?.join(' ') ?? '',
  ].filter(Boolean).join(' ');

  const { primary } = detectDomain(sourceText);
  const lens = getLens(primary);

  const reasoningInstruction = opts.includeReasoning
    ? `Include reasoning: (1) Add ℹ️ "what this means" notes after the first use of technical terms.
(2) Add a brief "Why this file matters" intro paragraph.
(3) Add a ## Glossary section at the end: each technical term used → one plain-language definition.
(4) For learner audience: add a "What to explore next" pointer after complex sections.`
    : `Do not add explanatory callouts or glossary — keep the output lean.`;

  const parts = [
    `<audience_directive>`,
    AUDIENCE_INSTRUCTIONS[opts.audience],
    READING_LEVEL_NOTE[opts.readingLevel],
    reasoningInstruction,
    `</audience_directive>`,
  ];

  if (primary !== 'general') {
    parts.push(
      `<domain_context detected="${primary}">`,
      `This project involves ${primary} concepts. When relevant, surface these concerns in the output.`,
      `For non-technical readers, explain ${primary} concepts in plain language using analogies:`,
      lens.expertiseNote,
      `</domain_context>`,
    );
  }

  return parts.join('\n');
}

import { readFileSync } from 'fs';
import { SYSTEM_PROMPTS, buildAgentsPrompt, buildClaudePrompt, HUMAN_VOICE_DIRECTIVE, HUMAN_FACING_FILE_TYPES, type PromptOptions, type WritingStyle } from './prompts.js';
import { generateText, generateVision } from './ai-provider.js';
import type { ProjectContext } from './analyze.js';
import type { DeepRepoContext } from './repo-context.js';

function buildGroundedUserMessage(fileType: string, ctx: ProjectContext | DeepRepoContext): string {
  const scriptLines = Object.entries(ctx.scripts)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n');

  const parts: string[] = [
    `<project>`,
    `Name: ${ctx.projectName}`,
    `Language: ${ctx.language}`,
    `Stack: ${ctx.detectedStack.join(', ') || 'not detected'}`,
    `Package manager: ${ctx.packageManager}`,
    `Scripts:\n${scriptLines || '  (none)'}`,
    `Top-level structure: ${ctx.structure.join(', ')}`,
    `Existing docs: README=${ctx.hasExistingDocs.readme}, AGENTS=${ctx.hasExistingDocs.agents}, CLAUDE=${ctx.hasExistingDocs.claude}`,
  ];

  // Inject MCP server info (names + commands only — env values excluded)
  const mcpList = ctx.mcpServers ?? [];
  if (mcpList.length > 0) {
    const lines = mcpList.map(
      (s) => `  ${s.name}: ${s.command} [${s.configFile}]${s.envKeys.length ? ` env: ${s.envKeys.join(', ')}` : ''}`,
    );
    parts.push(`MCP servers:\n${lines.join('\n')}`);
  }

  parts.push(`</project>`);

  // Inject full repo source when deep context is available
  const deep = ctx as DeepRepoContext;
  if (deep.packedSummary) {
    parts.push('');
    parts.push('<repo_context>');
    parts.push(deep.packedSummary);
    parts.push('</repo_context>');
  }

  parts.push('');
  parts.push(`Generate ${fileType.toUpperCase()}.md for THIS project.`);
  parts.push(`Use ONLY the real scripts and paths above — never invent commands or file paths.`);
  parts.push(`Output raw markdown only, no preamble.`);

  return parts.join('\n');
}

export async function generateFile(
  fileType: string,
  ctx: ProjectContext | DeepRepoContext,
  opts?: PromptOptions,
): Promise<string> {
  let system: string;
  if (fileType === 'agents') {
    system = buildAgentsPrompt({ ...opts, mcpServers: ctx.mcpServers ?? [] });
  } else if (fileType === 'claude') {
    system = buildClaudePrompt(opts);
  } else {
    system = SYSTEM_PROMPTS[fileType];
  }
  if (!system) throw new Error(`Unknown file type: ${fileType}`);
  // Human voice — human-facing types only; agent-facing types (agents, claude, skill, context) are never modified
  if (opts?.writingStyle === 'human' && HUMAN_FACING_FILE_TYPES.has(fileType)) {
    system += `\n\n${HUMAN_VOICE_DIRECTIVE}`;
  }
  return generateText(system, buildGroundedUserMessage(fileType, ctx), 4096);
}

export type McpExecutionMode = 'guide' | 'ai_exec' | 'context';
export type McpExperienceLevel = 'new' | 'experienced';

function buildTaskSystemPrompt(
  executionMode: McpExecutionMode,
  experienceLevel: McpExperienceLevel,
  riskCheck = false,
): string {
  const riskLine = riskCheck && executionMode === 'ai_exec'
    ? '\n- If the TASK.md has a Watch-outs section: also append ONE final line to the agent prompt block, after the Response style line:\n  Before starting, check your plan against the Watch-outs above and adjust.'
    : '';

  const modeBlock = {
    guide: `Output mode: Guide. Generate a complete TASK.md for a human developer. Include all sections: Task, Context, Requirements, Acceptance criteria, Implementation plan, Watch-outs, Decision log, Out of scope, Open questions (if any), Agent prompt.`,
    ai_exec: `Output mode: AI execution. Generate a TASK.md optimized for a coding agent to execute directly with zero clarifying questions. All sections required. Implementation plan must be prescriptive: exact files, function signatures, command sequences. Flag every assumption with [ASSUMED]. Agent prompt must be ≤ 150 tokens. At the END of the generated agent prompt block, append these lines exactly:
  Before executing: write a 3-5 line plan of your steps.
  After each step: verify it succeeded before continuing (gates below).
  Response style: terse. No preamble, no restating. Code over prose. Ask only blocking questions.${riskLine}`,
    context: `Output mode: Context drop. Generate a compact TASK.md for pasting into a chat window. Include only: Task, Context, Requirements, Acceptance criteria. Skip all other sections.`,
  }[executionMode];

  const experienceBlock = experienceLevel === 'new'
    ? `Experience level: New to this stack/domain. Include a "why" sentence for each requirement. In Watch-outs, explain what breaks if the pitfall is hit.`
    : `Experience level: Experienced. Be terse — state constraints and steps without explanation.`;

  return `${SYSTEM_PROMPTS.task}

<output_mode>
${modeBlock}
</output_mode>

<experience>
${experienceBlock}
</experience>`;
}

export async function generateTaskFile(
  taskInput: string,
  stack: string,
  executionMode: McpExecutionMode = 'guide',
  experienceLevel: McpExperienceLevel = 'experienced',
  riskCheck = false,
): Promise<string> {
  const system = buildTaskSystemPrompt(executionMode, experienceLevel, riskCheck);
  const userMessage = [
    `<raw_task_input>${taskInput}</raw_task_input>`,
    `<tech_stack>${stack || 'not specified'}</tech_stack>`,
    `<output_config execution_mode="${executionMode}" experience="${experienceLevel}" />`,
    `Generate a production-grade TASK.md from this task input. Output raw markdown only.`,
  ].join('\n');
  return generateText(system, userMessage, 4096);
}

const EXPLAIN_SYSTEM_PROMPT = `<role>
You are a senior technical writer who explains code to humans and AI agents at exactly the right level.
</role>
<task>
Given code, generate a WALKTHROUGH.md with these sections in order:

## What this is
One short paragraph. Plain English. No jargon without definition.

## The big picture
How the pieces fit together. Architecture, data flow, major decisions.
Use a simple list or diagram if it helps. Keep it concrete.

## Walkthrough
Step-by-step through the most important code paths. Reference real function names.
Skip boilerplate. Focus on the logic that actually matters.

## Where things live
A file/directory map — what each important file or folder does.
Skip test fixtures, generated files, and node_modules.

## If you want to change X
The 3-5 most common edits someone would need to make and exactly where to make them.
Format: "To change [X]: edit [file] at [location]."

## Glossary
Every technical term used in this walkthrough, defined in plain English.
Only include terms a reader at the stated audience level would not already know.
Omit for ai_agent audience.
</task>
<quality_bar>
- A person who has never seen this code can understand it from your walkthrough alone
- Every "where to change X" points to a real file path or function
- Glossary covers every term that might trip up the audience
- No unnecessary preamble — start with the first section heading
</quality_bar>
<anti_patterns>
DO NOT:
- Explain obvious things (what a for-loop is, what JSON is) for technical audiences
- Use jargon without definition for non-technical audiences
- Invent file paths or function names not present in the code
- Add a section not listed above
</anti_patterns>`;

export type McpReaderAudience = 'ai_agent' | 'team' | 'non_technical' | 'learner';

function buildExplainUserMessage(code: string, audience: McpReaderAudience): string {
  const audienceDesc: Record<McpReaderAudience, string> = {
    ai_agent: 'AI coding agent — terse, machine-parseable, expert level.',
    team: 'New team member with engineering skills — explain project-specific choices, not fundamentals.',
    non_technical: 'Non-technical reader (founder, PM, investor) — define every term, plain language throughout.',
    learner: 'Developer learning this codebase — explain the why behind each decision, not just the what.',
  };
  return [
    '<code_to_explain>',
    code,
    '</code_to_explain>',
    '',
    `<reader_audience>${audienceDesc[audience]}</reader_audience>`,
    '',
    'Produce WALKTHROUGH.md for this audience. Output raw markdown only — no preamble.',
  ].join('\n');
}

export async function generateWalkthrough(
  code: string,
  audience: McpReaderAudience = 'non_technical',
  writingStyle: WritingStyle = 'default',
): Promise<string> {
  // Auto-enable human voice for non_technical and learner — they already expect natural prose
  const wantHumanVoice = writingStyle === 'human' || audience === 'non_technical' || audience === 'learner';
  const system = wantHumanVoice
    ? `${EXPLAIN_SYSTEM_PROMPT}\n\n${HUMAN_VOICE_DIRECTIVE}`
    : EXPLAIN_SYSTEM_PROMPT;
  return generateText(system, buildExplainUserMessage(code, audience), 4096);
}

const IMAGE_ANALYSIS_PROMPT = `You are an expert at reverse-engineering images into precise AI image generation prompts.

Analyze the provided image and write a detailed recreation prompt. Cover:
- Subject: main subject(s), position, size, relationships
- Composition: framing, rule of thirds, symmetry, foreground/background
- Lighting: type (natural/studio/artificial), direction, shadows, quality
- Colors: dominant palette (3-5 specific colors with approximate hex), saturation, contrast
- Style: photography style OR artistic movement, era, aesthetic
- Camera: angle (eye-level/overhead/low-angle), lens feel (wide/normal/telephoto/macro), depth of field
- Mood: emotional tone, atmosphere

Then output a single refined prompt under 200 words.
Output ONLY the final prompt — no analysis, no explanation, no preamble.`;

export async function imageToPrompt(imagePath: string): Promise<string> {
  const data = readFileSync(imagePath);
  const base64 = data.toString('base64');
  const ext = imagePath.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    png: 'image/png', webp: 'image/webp',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  };
  const mediaType = mimeMap[ext ?? ''] ?? 'image/jpeg';
  return generateVision(base64, mediaType, IMAGE_ANALYSIS_PROMPT);
}

import type { GenerationRequest, MDFileType } from '@/types';
import { AGENTS_SYSTEM_PROMPT } from './agents';
import { CLAUDE_SYSTEM_PROMPT } from './claude';
import { README_SYSTEM_PROMPT } from './readme';
import { TASK_SYSTEM_PROMPT } from './task';
import { SPEC_SYSTEM_PROMPT } from './spec';
import { SKILL_SYSTEM_PROMPT } from './skill';
import { DESIGN_SYSTEM_PROMPT } from './design';
import { CONTRIBUTING_SYSTEM_PROMPT } from './contributing';
import { SECURITY_SYSTEM_PROMPT } from './security';
import { CONTEXT_SYSTEM_PROMPT } from './context';

const SYSTEM_PROMPTS: Partial<Record<MDFileType, string>> = {
  readme:       README_SYSTEM_PROMPT,
  agents:       AGENTS_SYSTEM_PROMPT,
  claude:       CLAUDE_SYSTEM_PROMPT,
  task:         TASK_SYSTEM_PROMPT,
  spec:         SPEC_SYSTEM_PROMPT,
  skill:        SKILL_SYSTEM_PROMPT,
  design:       DESIGN_SYSTEM_PROMPT,
  contributing: CONTRIBUTING_SYSTEM_PROMPT,
  security:     SECURITY_SYSTEM_PROMPT,
  context:      CONTEXT_SYSTEM_PROMPT,
};

export function getSystemPrompt(fileType: MDFileType): string {
  const prompt = SYSTEM_PROMPTS[fileType];
  if (!prompt) throw new Error(`No prompt for: ${fileType}`);
  return prompt;
}

export function buildUserMessage(fileType: MDFileType, req: GenerationRequest): string {
  if (fileType === 'task' || fileType === 'spec' || req.mode === 'task') {
    return buildTaskUserMessage(fileType, req);
  }
  return buildGenerateUserMessage(fileType, req);
}

function buildTaskUserMessage(fileType: MDFileType, req: GenerationRequest): string {
  const stack = req.detectedStack.length
    ? req.detectedStack.join(', ')
    : req.rawStackInput || 'not specified';

  return [
    '<raw_task_input>',
    req.taskInput ?? '',
    '</raw_task_input>',
    '',
    `<tech_stack>${stack}</tech_stack>`,
    '',
    `Generate a production-grade ${fileType.toUpperCase()}.md from this task input.`,
    'Output raw markdown only — no preamble.',
  ].join('\n');
}

function buildGenerateUserMessage(fileType: MDFileType, req: GenerationRequest): string {
  const stack = req.detectedStack.length ? req.detectedStack.join(', ') : req.rawStackInput || 'not specified';
  const tools = req.aiTools?.filter(t => t !== 'none').join(', ') || 'none';
  const project = req.projectType === 'other' ? (req.projectDescription || 'custom project') : req.projectType;
  return `Project type: ${project}\nAudience: ${req.audience}\nTech stack: ${stack}\nAI tools: ${tools}\n\nGenerate a production-grade ${fileType.toUpperCase()}.md for this project. Output raw markdown only.`;
}

import type { GenerationRequest, MDFileType } from '@/types';
import { AGENTS_SYSTEM_PROMPT } from './agents';
import { CLAUDE_SYSTEM_PROMPT } from './claude';
import { README_SYSTEM_PROMPT } from './readme';

const SYSTEM_PROMPTS: Partial<Record<MDFileType, string>> = {
  readme: README_SYSTEM_PROMPT,
  agents: AGENTS_SYSTEM_PROMPT,
  claude: CLAUDE_SYSTEM_PROMPT,
};

export function getSystemPrompt(fileType: MDFileType): string {
  const prompt = SYSTEM_PROMPTS[fileType];
  if (!prompt) throw new Error(`No prompt for: ${fileType}`);
  return prompt;
}

export function buildUserMessage(fileType: MDFileType, req: GenerationRequest): string {
  const stack = req.detectedStack.length ? req.detectedStack.join(', ') : req.rawStackInput || 'not specified';
  const tools = req.aiTools.filter(t => t !== 'none').join(', ') || 'none';
  const project = req.projectType === 'other' ? (req.projectDescription || 'custom project') : req.projectType;
  return `Project type: ${project}\nAudience: ${req.audience}\nTech stack: ${stack}\nAI tools: ${tools}\n\nGenerate a production-grade ${fileType.toUpperCase()}.md for this project. Output raw markdown only.`;
}

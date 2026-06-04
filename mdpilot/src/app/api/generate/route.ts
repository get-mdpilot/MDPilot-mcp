import { NextRequest, NextResponse } from 'next/server';
import { generateMarkdown } from '@/lib/anthropic';
import { getSystemPrompt, buildUserMessage } from '@/lib/prompts';
import type { GenerationRequest, MDFileType } from '@/types';

export const runtime = 'nodejs';

const filenames: Record<MDFileType, string> = {
  readme: 'README.md', agents: 'AGENTS.md', claude: 'CLAUDE.md',
  skill: 'SKILL.md', design: 'DESIGN.md', contributing: 'CONTRIBUTING.md',
  security: 'SECURITY.md', context: 'CONTEXT.md', task: 'TASK.md', spec: 'SPEC.md',
};

export async function POST(req: NextRequest) {
  try {
    const { fileType, request } = await req.json() as { fileType: MDFileType; request: GenerationRequest };
    if (!fileType || !request) return NextResponse.json({ error: 'Missing fileType or request' }, { status: 400 });
    const content = await generateMarkdown(getSystemPrompt(fileType), buildUserMessage(fileType, request));
    return NextResponse.json({ type: fileType, filename: filenames[fileType], content });
  } catch (error) {
    console.error('[api/generate]', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

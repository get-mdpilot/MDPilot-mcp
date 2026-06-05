import { NextRequest, NextResponse } from 'next/server';
import { generateWithProvider, getAvailableProviders, type AIProvider } from '@/lib/ai-client';
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
    const { fileType, request, provider } = await req.json() as {
      fileType: MDFileType;
      request: GenerationRequest;
      provider?: AIProvider;
    };

    if (!fileType || !request) {
      return NextResponse.json({ error: 'Missing fileType or request' }, { status: 400 });
    }

    // Resolve provider: explicit > request.provider > first available
    const available = getAvailableProviders();
    if (available.length === 0) {
      return NextResponse.json(
        { error: 'No model provider configured. Add an API key (ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_AI_API_KEY, or GROQ_API_KEY) to .env.local.' },
        { status: 503 },
      );
    }
    const chosen = provider ?? request.provider ?? available[0];
    const effective = available.includes(chosen) ? chosen : available[0];

    const content = await generateWithProvider(
      { provider: effective },
      getSystemPrompt(fileType),
      buildUserMessage(fileType, request),
    );

    return NextResponse.json({
      type: fileType,
      filename: filenames[fileType],
      content,
      provider: effective,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    console.error('[api/generate]', message);
    return NextResponse.json({ error: message || 'Generation failed' }, { status: 500 });
  }
}

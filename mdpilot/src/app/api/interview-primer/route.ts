import { NextRequest, NextResponse } from 'next/server';
import { generateWithProvider, getAvailableProviders } from '@/lib/ai-client';
import { INTERVIEW_PRIMER_PROMPT, INTERVIEW_PRIMER_USER_MESSAGE } from '@/lib/prompts/interview-primer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { role, level, jd } = await req.json() as {
      role: string;
      level: string;
      jd?: string;
    };

    if (!role || !level) {
      return NextResponse.json({ error: 'Missing role or level' }, { status: 400 });
    }

    const available = getAvailableProviders();
    if (available.length === 0) {
      return NextResponse.json(
        { error: 'No model provider configured. Add an API key to .env.local.' },
        { status: 503 },
      );
    }

    const content = await generateWithProvider(
      { provider: available[0] },
      INTERVIEW_PRIMER_PROMPT,
      INTERVIEW_PRIMER_USER_MESSAGE(role, level, jd ?? ''),
    );

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';
    console.error('[api/interview-primer]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

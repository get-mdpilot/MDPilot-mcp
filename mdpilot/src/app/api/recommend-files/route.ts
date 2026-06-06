import { NextRequest, NextResponse } from 'next/server';
import { generateWithProvider, getAvailableProviders } from '@/lib/ai-client';
import {
  RECOMMEND_FILES_PROMPT,
  buildRecommendUserMessage,
  type RecommendFilesResponse,
} from '@/lib/prompts/recommend-files';

export const runtime = 'nodejs';

function parseJson(raw: string): RecommendFilesResponse {
  // Strip ```json ... ``` wrapper if Claude added one
  const stripped = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```\s*$/m, '').trim();
  const parsed = JSON.parse(stripped) as RecommendFilesResponse;
  if (!Array.isArray(parsed.recommended) || !Array.isArray(parsed.skipped)) {
    throw new Error('Invalid response shape from model');
  }
  return parsed;
}

export async function POST(req: NextRequest) {
  try {
    const { goal, projectType, detectedStack } = await req.json() as {
      goal: string;
      projectType?: string;
      detectedStack?: string[];
    };

    if (!goal?.trim()) {
      return NextResponse.json({ error: 'Missing goal' }, { status: 400 });
    }

    const available = getAvailableProviders();
    if (available.length === 0) {
      return NextResponse.json(
        { error: 'No model provider configured. Add an API key to .env.local.' },
        { status: 503 },
      );
    }

    const raw = await generateWithProvider(
      { provider: available[0] },
      RECOMMEND_FILES_PROMPT,
      buildRecommendUserMessage(goal, projectType ?? 'other', detectedStack ?? []),
    );

    const result = parseJson(raw);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Recommendation failed';
    console.error('[api/recommend-files]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

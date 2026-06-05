import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeImageWithProvider,
  generateWithProvider,
  getAvailableVisionProviders,
  type VisionProvider,
} from '@/lib/ai-client';
import {
  VISION_ANALYSIS_PROMPT,
  META_OPTIMIZATION_PROMPT,
  TARGET_FORMAT_PROMPT,
} from '@/lib/prompts/image-to-prompt';

export const runtime = 'nodejs';

const MAX_SIZE = 4 * 1024 * 1024; // 4MB (Groq base64 limit)
const SUPPORTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function stripFences(s: string): string {
  return s.replace(/```json\n?|\n?```/g, '').trim();
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (!/multipart\/form-data/i.test(contentType)) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const requested = (formData.get('provider') as VisionProvider) || 'gemini';

    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `This image is ${mb}MB. Compress it to under 4MB first — try tinypng.com or squoosh.app.` },
        { status: 400 },
      );
    }
    if (!SUPPORTED.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported format. Use JPEG, PNG, or WEBP.' },
        { status: 400 },
      );
    }

    // Resolve a vision provider that actually has a key
    const availableVision = getAvailableVisionProviders();
    if (availableVision.length === 0) {
      return NextResponse.json(
        { error: 'No vision provider configured. Add GROQ_API_KEY (console.groq.com) or GOOGLE_AI_API_KEY (aistudio.google.com) to .env.local.' },
        { status: 503 },
      );
    }
    const visionProvider = availableVision.includes(requested) ? requested : availableVision[0];
    // Text stages (refine/format) reuse the same provider — both groq & gemini are text-capable.
    const textProvider = visionProvider;

    // ── Stage 2: Vision analysis → structured JSON ──────────────────────────
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const rawAnalysis = await analyzeImageWithProvider(
      visionProvider,
      VISION_ANALYSIS_PROMPT,
      'Analyze this image and return the structured JSON breakdown.',
      base64,
      file.type,
    );

    let analysis: Record<string, string>;
    try {
      analysis = JSON.parse(stripFences(rawAnalysis));
    } catch {
      return NextResponse.json(
        { error: 'The vision model returned an unexpected response. Try again or switch providers — Groq suits product photos, Gemini suits artistic images.' },
        { status: 502 },
      );
    }

    // ── Stage 3: Meta-optimization (self-critique → refined prompt) ──────────
    const refinedPrompt = (await generateWithProvider(
      { provider: textProvider },
      META_OPTIMIZATION_PROMPT,
      `Image analysis:\n${JSON.stringify(analysis, null, 2)}`,
    )).trim();

    // ── Stage 4: Format per target model ────────────────────────────────────
    const formattedRaw = await generateWithProvider(
      { provider: textProvider },
      TARGET_FORMAT_PROMPT,
      `Base prompt: ${refinedPrompt}`,
    );

    let formatted: Record<string, unknown>;
    try {
      formatted = JSON.parse(stripFences(formattedRaw));
    } catch {
      formatted = {
        flux: refinedPrompt,
        stable_diffusion: refinedPrompt,
        midjourney: `${refinedPrompt} --ar 16:9 --v 6`,
        dalle: refinedPrompt,
        gemini: refinedPrompt,
        negative_prompt: 'blurry, low quality, distorted, watermark',
        tags: [],
      };
    }

    return NextResponse.json({
      provider: visionProvider,
      analysis,
      refined_prompt: refinedPrompt,
      formatted,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    console.error('[api/image-to-prompt]', message);

    if (/GROQ_API_KEY|api key/i.test(message)) {
      return NextResponse.json(
        { error: 'Model API key missing or invalid. Check GROQ_API_KEY / GOOGLE_AI_API_KEY in .env.local.' },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: 'Analysis failed. This can happen with very complex or low-quality images. Try higher resolution or PNG instead of JPEG.' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { getAvailableProviders } from '@/lib/ai-client';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ providers: getAvailableProviders() });
}

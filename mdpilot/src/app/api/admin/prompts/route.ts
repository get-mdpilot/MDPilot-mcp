import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';

function authorized(req: NextRequest): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return req.headers.get('x-admin-password') === pw;
}

// GET — list prompt templates (+ roles, skills)
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = getServiceClient();
    const [prompts, roles, skills] = await Promise.all([
      db.from('prompt_templates').select('*').order('file_type').order('version', { ascending: false }),
      db.from('role_definitions').select('*').order('role'),
      db.from('skill_patterns').select('*').order('skill'),
    ]);
    return NextResponse.json({
      prompts: prompts.data ?? [],
      roles:   roles.data ?? [],
      skills:  skills.data ?? [],
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

// POST — create a new prompt OR save a new version of an existing (file_type, role).
// Body: { fileType, role, content }
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { fileType, role, content } = await req.json() as { fileType: string; role: string; content: string };
    if (!fileType || !role || !content?.trim()) {
      return NextResponse.json({ error: 'fileType, role and content are required' }, { status: 400 });
    }
    const db = getServiceClient();

    // Find current max version for this file_type + role
    const { data: existing } = await db
      .from('prompt_templates')
      .select('version')
      .eq('file_type', fileType).eq('role', role)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = (existing?.[0]?.version ?? 0) + 1;

    // Deactivate previous active rows, insert new active version
    await db.from('prompt_templates')
      .update({ is_active: false })
      .eq('file_type', fileType).eq('role', role).eq('is_active', true);

    const { data, error } = await db.from('prompt_templates')
      .insert({ file_type: fileType, role, version: nextVersion, content, is_active: true })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ saved: data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

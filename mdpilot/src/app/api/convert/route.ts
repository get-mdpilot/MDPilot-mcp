import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

export const runtime = 'nodejs';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const SUPPORTED_EXTENSIONS = [
  '.pdf', '.docx', '.pptx', '.xlsx', '.csv',
  '.html', '.htm', '.txt', '.rtf', '.md',
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.json', '.xml', '.zip', '.epub',
];

// Resolve the markitdown binary — try PATH, then common pip user-install bins.
const MARKITDOWN_CANDIDATES = [
  'markitdown',
  `${process.env.HOME ?? ''}/.local/bin/markitdown`,
  '/opt/homebrew/bin/markitdown',
  '/usr/local/bin/markitdown',
];

async function resolveMarkitdown(): Promise<string | null> {
  for (const cmd of MARKITDOWN_CANDIDATES) {
    try {
      await execAsync(`"${cmd}" --help`, { timeout: 8000 });
      return cmd;
    } catch {
      // try next
    }
  }
  return null;
}

// ── GET: health check — is markitdown installed? ────────────────────────────
export async function GET() {
  const bin = await resolveMarkitdown();
  return NextResponse.json({ available: bin !== null });
}

// ── POST: convert an uploaded file to markdown ──────────────────────────────
export async function POST(req: NextRequest) {
  let inputPath: string | null = null;

  try {
    // Guard the body type before parsing — formData() throws on a non-multipart
    // body, which would otherwise surface as an opaque framework error.
    const contentType = req.headers.get('content-type') ?? '';
    if (!/multipart\/form-data|application\/x-www-form-urlencoded/i.test(contentType)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${ext}`, supported: SUPPORTED_EXTENSIONS },
        { status: 400 },
      );
    }

    const bin = await resolveMarkitdown();
    if (!bin) {
      return NextResponse.json(
        { error: 'MarkItDown not installed. Run: pip install markitdown', code: 'NOT_INSTALLED' },
        { status: 503 },
      );
    }

    // Write upload to a temp file
    inputPath = join('/tmp', `mdpilot-${randomUUID()}${ext}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Convert
    const { stdout, stderr } = await execAsync(
      `"${bin}" "${inputPath}"`,
      { timeout: 30000, maxBuffer: 8 * 1024 * 1024 },
    );

    if (!stdout || !stdout.trim()) {
      throw new Error(stderr || 'MarkItDown produced no output (the file may be empty, scanned, or unreadable).');
    }

    return NextResponse.json({
      filename:     file.name.replace(/\.[^.]+$/, '.md'),
      originalName: file.name,
      originalSize: file.size,
      content:      stdout,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[api/convert]', message);

    if (/command not found|ENOENT|not installed/i.test(message)) {
      return NextResponse.json(
        { error: 'MarkItDown not installed. Run: pip install markitdown', code: 'NOT_INSTALLED' },
        { status: 503 },
      );
    }
    if (/timed out|timeout/i.test(message)) {
      return NextResponse.json(
        { error: 'Conversion timed out. The file may be too large or complex.' },
        { status: 504 },
      );
    }
    return NextResponse.json({ error: message || 'Conversion failed' }, { status: 500 });
  } finally {
    if (inputPath) await unlink(inputPath).catch(() => {});
  }
}

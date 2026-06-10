#!/usr/bin/env node
/**
 * Nightly job: promote top-rated generation_feedback rows into gold_examples.
 *
 * Criteria for promotion:
 *   - thumbs = 'up'
 *   - kept_unedited = true
 *   - edit_distance_bucket = 'none'
 *
 * One gold example per (file_type, role) — best-scoring row wins.
 * Run via cron or CI nightly:
 *   npx tsx scripts/promote-gold-examples.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// ── Load .env.local ───────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Rough token count (1 token ≈ 4 chars) ────────────────────────────────────

function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Querying generation_feedback for top examples…');

  // Get all gold-quality feedback rows joined with their training_samples
  const { data: rows, error } = await db
    .from('generation_feedback')
    .select(`
      id,
      prompt_version,
      event_id,
      usage_events!inner ( file_type, role ),
      training_samples ( consented, output, pii_scrubbed_input )
    `)
    .eq('thumbs', 'up')
    .eq('kept_unedited', true)
    .eq('edit_distance_bucket', 'none')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('No qualifying rows found — nothing to promote.');
    return;
  }

  console.log(`Found ${rows.length} candidate row(s)`);

  // Group by (file_type, role) — first match per group wins (most recent)
  type Row = typeof rows[number];
  const best = new Map<string, Row>();
  for (const row of rows) {
    const events = row.usage_events as { file_type?: string; role?: string } | null;
    const fileType = events?.file_type ?? 'unknown';
    const role = events?.role ?? 'developer';
    const key = `${fileType}:${role}`;
    if (!best.has(key)) best.set(key, row);
  }

  console.log(`Promoting ${best.size} example(s)…`);

  let promoted = 0;
  let skipped = 0;

  for (const [key, row] of best) {
    const [fileType, role] = key.split(':');
    const samples = Array.isArray(row.training_samples) ? row.training_samples : [row.training_samples];
    const sample = samples.find(s => s?.consented && s?.output);
    if (!sample?.output) {
      console.log(`  SKIP  ${key} — no consented training sample`);
      skipped++;
      continue;
    }

    const { error: upsertErr } = await db.from('gold_examples').upsert(
      {
        file_type: fileType,
        role,
        content: sample.output,
        source_feedback_id: row.id,
        token_count: countTokens(sample.output),
        promoted_at: new Date().toISOString(),
      },
      { onConflict: 'file_type,role' },
    );

    if (upsertErr) {
      console.error(`  ERR   ${key} — ${upsertErr.message}`);
    } else {
      console.log(`  ✓     ${key} (${countTokens(sample.output)} tokens)`);
      promoted++;
    }
  }

  // ── Summary log line — auditable in CI run logs ───────────────────────────
  const { count, error: countErr } = await db
    .from('gold_examples')
    .select('*', { count: 'exact', head: true });

  const tableTotal = countErr ? '?' : String(count ?? 0);
  console.log(`promoted ${promoted} gold examples; table now has ${tableTotal} rows`);

  if (promoted === 0 && skipped === best.size) {
    console.warn('Warning: all candidates skipped (no consented training samples).');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

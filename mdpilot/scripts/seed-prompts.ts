/**
 * Seed Supabase with the hardcoded prompts + role definitions.
 *
 * Prereqs:
 *   1. Run supabase/schema.sql in the Supabase SQL editor.
 *   2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.
 *
 * Run: npx tsx scripts/seed-prompts.ts
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { FALLBACK_PROMPTS } from '../src/lib/prompts/fallback';

// Load .env.local manually (this runs outside Next.js)
function loadEnv() {
  try {
    const raw = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* ignore */ }
}
loadEnv();

const url        = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

// Role framework: SDE1/2/3/PE + broader roles
const ROLES = [
  { role: 'developer', scope: 'General software development', ambiguity_level: 'medium', description: 'Default developer role — balanced detail.', example_signals: 'build feature, fix bug, refactor' },
  { role: 'sde1',      scope: 'Well-defined tasks, single component', ambiguity_level: 'low',    description: 'Junior engineer — explicit steps, no ambiguity.', example_signals: 'implement, add, update a known component' },
  { role: 'sde2',      scope: 'Feature-level, multi-component',       ambiguity_level: 'medium', description: 'Mid-level — owns a feature end to end.', example_signals: 'design and build feature, integrate services' },
  { role: 'sde3',      scope: 'System-level, cross-cutting',          ambiguity_level: 'high',   description: 'Senior — handles ambiguity, sets patterns.', example_signals: 'architect, define standards, resolve trade-offs' },
  { role: 'pe',        scope: 'Org-wide, strategic',                  ambiguity_level: 'very high', description: 'Principal — strategy, long-term direction.', example_signals: 'set technical vision, multi-team alignment' },
  { role: 'devops',    scope: 'Infrastructure, CI/CD, deployment',    ambiguity_level: 'medium', description: 'Operations and reliability focus.', example_signals: 'deploy, pipeline, monitoring, scaling' },
  { role: 'qa',        scope: 'Testing and quality',                  ambiguity_level: 'low',    description: 'Quality assurance and test design.', example_signals: 'test plan, coverage, edge cases' },
  { role: 'designer',  scope: 'UI/UX and design systems',            ambiguity_level: 'medium', description: 'Design tokens, components, interaction.', example_signals: 'design, tokens, components, accessibility' },
  { role: 'architect', scope: 'System design and structure',         ambiguity_level: 'high',   description: 'High-level architecture and boundaries.', example_signals: 'architecture, boundaries, data flow' },
  { role: 'pm',        scope: 'Product requirements and scope',       ambiguity_level: 'high',   description: 'Product framing, requirements, priorities.', example_signals: 'requirements, user story, scope, roadmap' },
  { role: 'security',  scope: 'Security and compliance',             ambiguity_level: 'medium', description: 'Threat modeling, vuln handling, compliance.', example_signals: 'vulnerability, threat model, audit' },
];

async function main() {
  console.log('Seeding role_definitions…');
  const { error: roleErr } = await db.from('role_definitions').upsert(ROLES, { onConflict: 'role' });
  if (roleErr) console.error('  role_definitions:', roleErr.message);
  else console.log(`  ✓ ${ROLES.length} roles`);

  console.log('Seeding prompt_templates (role=developer, version=1)…');
  let ok = 0;
  for (const [fileType, content] of Object.entries(FALLBACK_PROMPTS)) {
    if (!content) continue;
    // Deactivate any existing active rows for this file_type+developer, then insert v1 active
    await db.from('prompt_templates')
      .update({ is_active: false })
      .eq('file_type', fileType).eq('role', 'developer').eq('is_active', true);

    const { error } = await db.from('prompt_templates').insert({
      file_type: fileType, role: 'developer', version: 1, content, is_active: true,
    });
    if (error) console.error(`  ${fileType}:`, error.message);
    else { ok++; console.log(`  ✓ ${fileType}`); }
  }
  console.log(`Done — ${ok} prompts seeded.`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

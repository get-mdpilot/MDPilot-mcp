import { supabase, supabaseEnabled } from '@/lib/supabase';
import { scrubPII } from '@/lib/pii-scrub';

// Anonymous, per-tab session id — NOT tied to any identity.
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = sessionStorage.getItem('mdpilot_sid');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('mdpilot_sid', id);
  }
  return id;
}

export interface GenerationEvent {
  role?: string;
  skill?: string;
  fileType: string;
  provider: string;
  tokensBefore: number;
  tokensAfter: number;
}

// METADATA ONLY. Fire-and-forget — never blocks generation, never throws.
// The id is generated client-side so we never need to read it back — the
// `usage_events` table is insert-only for anon (no SELECT policy), and an
// INSERT...RETURNING would be rejected by RLS. Returning the id we created
// lets feedback link to the event without ever reading the table.
export async function trackGeneration(event: GenerationEvent): Promise<string | null> {
  if (!supabaseEnabled || typeof crypto === 'undefined') return null;
  const id = crypto.randomUUID();
  try {
    const { error } = await supabase.from('usage_events').insert({
      id,
      session_id:    getSessionId(),
      role:          event.role,
      skill:         event.skill,
      file_type:     event.fileType,
      provider:      event.provider,
      tokens_before: event.tokensBefore,
      tokens_after:  event.tokensAfter,
    });
    return error ? null : id;
  } catch {
    return null; // silent — telemetry must never break the app
  }
}

export interface GenerationFeedback {
  keptUnedited?: boolean;
  editDistanceBucket?: 'none' | 'light' | 'heavy';
  thumbs?: 'up' | 'down';
  regenerated?: boolean;
  promptVersion?: number;
}

export async function trackFeedback(eventId: string, feedback: GenerationFeedback): Promise<void> {
  if (!supabaseEnabled || !eventId) return;
  try {
    await supabase.from('generation_feedback').insert({
      event_id:            eventId,
      kept_unedited:       feedback.keptUnedited,
      edit_distance_bucket: feedback.editDistanceBucket,
      thumbs:              feedback.thumbs,
      regenerated:         feedback.regenerated,
      prompt_version:      feedback.promptVersion,
    });
  } catch { /* silent */ }
}

// Consent-only. Scrubs PII client-side BEFORE the value ever leaves the browser.
export async function storeTrainingSample(sample: {
  input: string;
  output: string;
  role?: string;
  fileType: string;
}): Promise<void> {
  if (!supabaseEnabled) return;
  try {
    await supabase.from('training_samples').insert({
      consented:          true,
      pii_scrubbed_input: scrubPII(sample.input),
      output:             scrubPII(sample.output),
      role:               sample.role,
      file_type:          sample.fileType,
    });
  } catch { /* silent */ }
}

// Cheap edit-distance bucket from length delta + prefix divergence.
export function editBucket(before: string, after: string): 'none' | 'light' | 'heavy' {
  if (before === after) return 'none';
  const lenDelta = Math.abs(before.length - after.length);
  const ratio = lenDelta / Math.max(1, before.length);
  return ratio > 0.25 ? 'heavy' : 'light';
}

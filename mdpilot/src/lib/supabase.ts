import { createClient } from '@supabase/supabase-js';

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// True only when both public env vars are present. Used to skip Supabase
// calls gracefully (fall back to hardcoded prompts, no-op telemetry).
export const supabaseEnabled = Boolean(url && anonKey);

// Client-side (publishable/anon key, RLS-protected). Safe in the browser.
export const supabase = createClient(url || 'http://localhost', anonKey || 'anon');

// Server-side (service role — ONLY in API routes / scripts, never the client).
export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !serviceKey) {
    throw new Error('Supabase service client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

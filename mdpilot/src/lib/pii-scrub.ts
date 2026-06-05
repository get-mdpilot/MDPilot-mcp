// Strip common PII before any opted-in sample is stored. Order matters:
// API keys before generic tokens, emails before URLs.
export function scrubPII(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[EMAIL]')
    .replace(/\b(sk-|pk-|ghp_|gho_|AIza|gsk_|sb_)[A-Za-z0-9_-]{10,}\b/g, '[API_KEY]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
    .replace(/https?:\/\/[^\s)]+/g, '[URL]')
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CARD]');
}

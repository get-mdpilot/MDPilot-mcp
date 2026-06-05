import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy — MDPilot',
  description: 'What MDPilot collects, why, and how to opt out.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--md-dark-2)] px-5 sm:px-8 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Privacy
        </h1>
        <p className="text-sm text-[var(--md-text-tertiary)] mb-10">Plain language. No dark patterns.</p>

        <section className="space-y-8 text-sm leading-relaxed text-[var(--md-text-secondary)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--md-text)] mb-2">What we collect automatically</h2>
            <p>
              Anonymous usage <strong className="text-[var(--md-text)]">metadata only</strong> — never the content you paste or generate.
              Each generation records: an anonymous per-session ID (not tied to you), the file type, the model provider,
              token counts before/after optimization, and quality signals (did you keep the output unedited, thumbs up/down,
              did you regenerate). That&apos;s it. We use it to find which prompts produce results people keep, and improve them.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--md-text)] mb-2">What we collect only with your consent</h2>
            <p>
              Nothing is stored from your actual input or output unless you tick the
              <span className="text-[#4FACFF]"> &ldquo;Help improve MDPilot&rdquo; </span>
              box on a generation. When you do, that single sample is{' '}
              <strong className="text-[var(--md-text)]">scrubbed of PII</strong> (emails, API keys, phone numbers, URLs, card numbers)
              <em> in your browser, before it is sent</em>, then stored to help train better prompts. The box is off by default.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--md-text)] mb-2">What we never do</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>We never log your raw pasted content to server logs or analytics.</li>
              <li>We never sell data or share it with advertisers.</li>
              <li>Telemetry never blocks or breaks generation — if it fails, it fails silently.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--md-text)] mb-2">How to opt out</h2>
            <p>
              Automatic telemetry is anonymous metadata with no content, but if you want zero telemetry, block requests to
              our Supabase endpoint or run MDPilot locally without the Supabase env vars set — the app works fully on its
              built-in prompts. Content samples are opt-in only, so simply leave the consent box unchecked.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--md-text)] mb-2">Your rights (DPDP Act / GDPR)</h2>
            <p>
              Because telemetry is anonymous and content is opt-in + PII-scrubbed, we hold no data that identifies you.
              For any data request or question, contact{' '}
              <a href="mailto:privacy@mdpilot.in" className="text-[#4FACFF] hover:underline">privacy@mdpilot.in</a>.
            </p>
          </div>
        </section>

        <a href="/" className="inline-block mt-12 text-sm text-[#4FACFF] hover:underline">← Back to MDPilot</a>
      </div>
    </div>
  );
}

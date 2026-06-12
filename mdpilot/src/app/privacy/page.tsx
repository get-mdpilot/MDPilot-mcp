import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — MDPilot',
  description: 'What MDPilot collects when you use mdpilot.in and the MDPilot MCP server, and your rights over it.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--md-dark-2)] px-5 sm:px-8 py-16">
      <div className="max-w-2xl mx-auto">

        <div className="mb-10">
          <p className="text-[11px] font-mono font-semibold text-[var(--md-text-tertiary)] uppercase tracking-[0.12em] mb-4">Legal</p>
          <h1 className="text-3xl font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[var(--md-text-tertiary)]">Last updated: June 8, 2026</p>
        </div>

        <div className="prose-legal space-y-10 text-[14px] leading-[1.75] text-[var(--md-text-secondary)]">

          <p>
            MDPilot (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is operated by{' '}
            <strong className="text-[var(--md-text-secondary)]">Viveon Gizit Pvt Ltd</strong>. This policy explains what we
            collect when you use mdpilot.in and the MDPilot MCP server, and your rights over it. We
            designed MDPilot to collect as little as possible.
          </p>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">What we collect</h2>

            <div className="space-y-5">
              <div>
                <p className="font-semibold text-[var(--md-text-secondary)] mb-1">Anonymous usage metadata.</p>
                <p>
                  When you use the web app, we record non-identifying metadata about each generation:
                  which mode and file type you used, the AI provider, token counts, timestamps, and an
                  anonymous session identifier. This contains no name, email, or account — we do not
                  require or offer accounts.
                </p>
              </div>

              <div>
                <p className="font-semibold text-[var(--md-text-secondary)] mb-1">Quality feedback.</p>
                <p>
                  If you rate a result or edit it, we record anonymous signals (e.g. kept-as-is, edited,
                  thumbs up/down) to improve our prompt quality.
                </p>
              </div>

              <div>
                <p className="font-semibold text-[var(--md-text-secondary)] mb-1">Content you submit.</p>
                <p>
                  Text and files you paste or upload are sent to the AI provider you select (see
                  &ldquo;Third parties&rdquo;) and, for file conversion, processed to produce markdown.
                  We do <strong className="text-[var(--md-text-secondary)]">not</strong> store the raw content of your
                  inputs or outputs — <strong className="text-[var(--md-text-secondary)]">unless</strong> you explicitly
                  opt in (below).
                </p>
              </div>

              <div>
                <p className="font-semibold text-[var(--md-text-secondary)] mb-1">Opt-in training samples.</p>
                <p>
                  Only if you turn on the explicit &ldquo;help improve MDPilot&rdquo; option for a
                  generation do we store that input/output sample. Before storage, we run automated PII
                  scrubbing to remove emails, keys, phone numbers, URLs, and similar. This is off by
                  default and you can decline at any time.
                </p>
              </div>

              <div>
                <p className="font-semibold text-[var(--md-text-secondary)] mb-1">Server logs.</p>
                <p>
                  Our hosting provider records standard technical logs (such as IP address and request
                  metadata) for security and operation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--md-go)]/[0.15] bg-[var(--md-go)]/[0.03]">
                <p className="font-semibold text-[var(--md-go)]/70 mb-1">The MCP server runs locally.</p>
                <p>
                  When you use the <code className="text-[12px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">mdpilot-mcp</code>{' '}
                  server in your editor, it runs on your machine using your own AI provider API key. Your
                  repository content is sent directly from your machine to your chosen AI provider — it
                  does <strong className="text-[var(--md-text-secondary)]">not</strong> pass through or get stored by
                  MDPilot&apos;s servers. Secret-scanning excludes flagged files before anything is sent.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">How we use it</h2>
            <p>
              To operate the service, prevent abuse, and improve the quality of our generated output. We
              do not sell your data or use it for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Legal basis &amp; consent</h2>
            <p>
              We process anonymous metadata to provide and improve the service (our legitimate interest /
              to perform the service you request). We store content samples only with your explicit
              consent, which you can withdraw at any time.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Third parties (sub-processors)</h2>
            <ul className="space-y-2 pl-4">
              {[
                ['AI providers', 'Anthropic, OpenAI, Google, and/or Groq process the content you submit, under their own privacy terms.'],
                ['Supabase', 'stores the anonymous metadata and any opted-in samples.'],
                ['Vercel', 'hosts the site and processes standard request logs.'],
              ].map(([name, desc]) => (
                <li key={name} className="flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-[var(--md-text-tertiary)] mt-2.5 shrink-0" />
                  <span><strong className="text-[var(--md-text-secondary)]">{name}</strong> — {desc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">We share data with these providers only as needed to run MDPilot.</p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">International transfers</h2>
            <p>
              The AI providers and infrastructure above may process data outside your country (including
              outside India and the EU). By using MDPilot you understand your submitted content may be
              processed in other jurisdictions under those providers&apos; safeguards.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Data retention</h2>
            <p>
              Anonymous metadata and feedback are retained to operate and improve the service. Opted-in
              samples are retained until you ask us to delete them or withdraw consent.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Your rights</h2>
            <p>
              Depending on your location (including under India&apos;s DPDP Act and the EU GDPR), you
              may have the right to access, correct, or delete your data, and to withdraw consent for
              opted-in samples. Because most of what we collect is anonymous and not linked to your
              identity, we may be unable to associate it with you — but we will honor verifiable requests
              where we can. To exercise a right or raise a grievance, contact us at{' '}
              <a href="mailto:privacy@mdpilot.in" className="text-[var(--md-accent)]/70 hover:text-[var(--md-accent)] transition-colors">
                privacy@mdpilot.in
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Security</h2>
            <p>
              We use reasonable technical measures (access controls, secret scanning, scoped keys) to
              protect data. No system is perfectly secure; submit only content you&apos;re comfortable
              sending to an AI provider, and never paste secrets or others&apos; confidential information.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Children</h2>
            <p>
              MDPilot is not directed to children and is intended for users who can lawfully consent
              under the laws of their jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Changes</h2>
            <p>
              We may update this policy; we&apos;ll change the &ldquo;Last updated&rdquo; date above.
              Material changes will be noted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Contact</h2>
            <p>
              Viveon Gizit Pvt Ltd —{' '}
              <a href="mailto:privacy@mdpilot.in" className="text-[var(--md-accent)]/70 hover:text-[var(--md-accent)] transition-colors">
                privacy@mdpilot.in
              </a>. For users in India, this address also serves as our grievance contact under the
              DPDP Act.
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 border-t border-[var(--md-border)] flex items-center gap-6">
          <Link href="/" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">← MDPilot</Link>
          <Link href="/terms" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">Terms of Service →</Link>
        </div>

      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono, B612 } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';

// Variable font with optical + character axes: opsz drives the high-contrast
// display cut at headline sizes; SOFT/WONK give the hand-set quirk (.em-wonk).
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});

// Brand wordmark only — B612 was designed by Airbus for cockpit instrument
// displays. "MDPilot" set in the actual aircraft font; nothing else uses it.
const b612 = B612({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-brand',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'MDPilot — Ship better .md files, faster',
  description:
    'Generate advanced AI instruction files (AGENTS.md, CLAUDE.md, README), optimize tokens, and convert any document to clean markdown. 3 questions, done.',
  keywords: [
    'markdown generator', 'AGENTS.md', 'CLAUDE.md', 'README generator',
    'AI instruction files', 'token optimizer', 'Claude Code', 'Cursor AI',
  ],
  openGraph: {
    title: 'MDPilot — Ship better .md files, faster',
    description: 'Generate advanced AI instruction files, optimize tokens, convert anything to markdown.',
    url: 'https://mdpilot.in',
    siteName: 'MDPilot',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MDPilot — Ship better .md files, faster',
    description: 'Generate advanced AI instruction files, optimize tokens, convert anything to markdown.',
  },
};

const FOOTER_COLS: { heading: string; links: [string, string][] }[] = [
  {
    heading: 'Flight deck',
    links: [
      ['Task', '/task'],
      ['Hangar — Labs', '/labs'],
      ['Generate', '/generate'],
      ['Convert', '/convert'],
      ['Explain', '/explain'],
      ['Image → Prompt', '/image-to-prompt'],
      ['Interview Primer', '/interview-primer'],
    ],
  },
  {
    heading: 'Field manual',
    links: [
      ['Docs', '/docs'],
      ['MCP server', '/docs/mcp'],
      ['AGENTS.md spec', '/docs/files'],
      ['CLAUDE.md guide', '/docs/generate'],
      ['Token optimization', '/docs/token-optimizer'],
      ['Logbook — Blog', '/blog'],
    ],
  },
  {
    heading: 'Company',
    links: [
      ['GitHub', 'https://github.com/get-mdpilot'],
      ['Feedback', 'https://github.com/get-mdpilot/Feedback/issues/new/choose'],
      ['Report a bug', 'https://github.com/get-mdpilot/Feedback/issues/new/choose'],
      ['Privacy Policy', '/privacy'],
      ['Terms of Service', '/terms'],
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} ${b612.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[var(--md-bg)] text-[var(--md-text)] antialiased">
        <Nav />
        <main>{children}</main>

        {/* Footer — the logbook */}
        <footer className="border-t border-[var(--md-border)] bg-[var(--md-surface)]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-12 mb-14">
              {/* Brand */}
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <img src="/mdpilot-logo.webp" alt="MDPilot" width={36} height={36} className="w-9 h-9 object-contain" />
                  <span className="font-brand text-[16px] font-bold text-[var(--md-text)]">MDPilot</span>
                </div>
                <p className="text-sm text-[var(--md-text-secondary)] leading-relaxed max-w-[220px]">
                  A flight deck for markdown. Brief your AI agent properly, every time.
                </p>
                <p className="mt-5 font-mono text-[11px] text-[var(--md-text-tertiary)] leading-relaxed">
                  Bengaluru, India
                  <br />
                  12.97° N · 77.59° E
                </p>
              </div>

              {FOOTER_COLS.map(col => (
                <div key={col.heading}>
                  <p className="font-mono text-[11px] font-medium text-[var(--md-text-tertiary)] uppercase tracking-[0.14em] mb-4">
                    {col.heading}
                  </p>
                  <ul className="space-y-2.5">
                    {col.links.map(([label, href]) => (
                      <li key={label + href}>
                        <a
                          href={href}
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-accent)] transition-colors duration-200"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--md-border)] pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="font-mono text-[11px] text-[var(--md-text-tertiary)]">
                © 2026 Viveon Gizit Pvt Ltd · MIT license
              </p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-go)]" />
                <span className="font-mono text-[11px] text-[var(--md-text-tertiary)]">Cleared for takeoff — all systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

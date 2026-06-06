import type { Metadata } from 'next';
import { Space_Grotesk, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import GlowCursor from '@/components/GlowCursor';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: true,
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} ${dmMono.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[var(--md-dark)] text-white antialiased">
        <GlowCursor />
        <Nav />
        <main>{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/6 bg-[var(--md-dark-2)]">
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
              {/* Brand */}
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4FACFF] to-[#A855F7] flex items-center justify-center shadow-lg">
                    <span className="text-[#07070f] text-xs font-bold font-[Space_Grotesk]">MD</span>
                  </div>
                  <span className="font-[Space_Grotesk] font-semibold text-white">MDPilot</span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed max-w-[200px]">
                  Markdown intelligence platform for AI-native development teams.
                </p>
              </div>

              {/* Product */}
              <div>
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Product</p>
                <ul className="space-y-2.5">
                  {[['Generate', '/generate'], ['Token Optimizer', '/generate'], ['How It Works', '/#how-it-works']].map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-sm text-white/50 hover:text-white transition-colors">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Resources</p>
                <ul className="space-y-2.5">
                  {[['AGENTS.md spec', '#'], ['CLAUDE.md guide', '#'], ['Token optimization', '#']].map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-sm text-white/50 hover:text-white transition-colors">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Company</p>
                <ul className="space-y-2.5">
                  {[['GitHub', 'https://github.com'], ['Twitter / X', '#'], ['mdpilot.in', 'https://mdpilot.in']].map(([label, href]) => (
                    <li key={label}>
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-white/6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/25">
                © 2026 MDPilot. Ship better markdown files, faster.
                <span className="mx-2 text-white/15">·</span>
                <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
              </p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-green)] animate-pulse" />
                <span className="text-xs text-white/25">All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

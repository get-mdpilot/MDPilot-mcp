import type { Metadata } from "next";
import "./globals.css";

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
    description:
      'Generate advanced AI instruction files, optimize tokens, convert anything to markdown.',
    url: 'https://mdpilot.in',
    siteName: 'MDPilot',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MDPilot — Ship better .md files, faster',
    description:
      'Generate advanced AI instruction files, optimize tokens, convert anything to markdown.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--md-surface)]">
        {/* Nav */}
        <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/8 glass-light dark:glass px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white text-xs font-bold tracking-tight">MD</span>
            </div>
            <span className="text-base font-semibold tracking-tight">MDPilot</span>
            <span className="text-[10px] text-[var(--md-text-tertiary)] border border-[var(--md-border)] rounded-full px-2 py-0.5 ml-0.5">
              v1
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/generate"
              className="text-sm text-[var(--md-text-secondary)] hover:text-[var(--md-text)] transition-colors hidden sm:block"
            >
              Generate
            </a>
            <a
              href="https://mdpilot.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-1.5 rounded-full border border-[var(--md-border)] text-[var(--md-text-secondary)] hover:text-[var(--md-text)] hover:border-[var(--md-blue)]/40 transition-all"
            >
              mdpilot.in ↗
            </a>
          </div>
        </nav>

        {/* Page content */}
        <main className="pt-16">{children}</main>

        {/* Footer */}
        <footer className="border-t border-[var(--md-border)] px-6 py-8 text-center">
          <p className="text-xs text-[var(--md-text-tertiary)]">
            MDPilot — Ship better markdown files, faster. Built for AI-native teams.
          </p>
        </footer>
      </body>
    </html>
  );
}

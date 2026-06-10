import type { ReactNode } from 'react';
import Link from 'next/link';

interface SidebarLink {
  label: string;
  href: string;
  soon?: boolean;
  accent?: boolean;
}

interface SidebarSection {
  group: string | null;
  links: SidebarLink[];
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    group: 'Start',
    links: [
      { label: 'Overview', href: '/docs' },
      { label: 'Getting started', href: '/docs/getting-started' },
    ],
  },
  {
    group: 'Core',
    links: [
      { label: 'Task mode', href: '/docs/task', accent: true },
      { label: 'MCP server', href: '/docs/mcp', accent: true },
    ],
  },
  {
    group: 'Concepts',
    links: [
      { label: 'Files reference', href: '/docs/files' },
      { label: 'Token optimizer', href: '/docs/token-optimizer' },
      { label: 'Drift detection', href: '/docs/drift' },
    ],
  },
  {
    group: 'Labs',
    links: [
      { label: 'Generate mode', href: '/docs/generate' },
      { label: 'Explain mode', href: '/docs/explain' },
      { label: 'Convert mode', href: '/docs/convert' },
      { label: 'Image → Prompt', href: '/docs/image-to-prompt' },
      { label: 'Interview primer', href: '/docs/interview-primer' },
    ],
  },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--md-dark)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sidebar */}
          <aside className="lg:w-52 shrink-0">
            <nav aria-label="Documentation navigation">
              {/* Mobile: compact horizontal scroll */}
              <div className="lg:hidden flex gap-1 overflow-x-auto pb-3 mb-6 border-b border-white/[0.06] scrollbar-none">
                {SIDEBAR_SECTIONS.flatMap(s => s.links).map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap ${
                      link.accent
                        ? 'text-[#4FACFF]/80 bg-[#4FACFF]/[0.08] border border-[#4FACFF]/20 hover:text-[#4FACFF]'
                        : 'text-white/45 bg-white/[0.04] border border-white/[0.07] hover:text-white/80'
                    } ${link.soon ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Desktop: vertical sidebar */}
              <div className="hidden lg:block sticky top-24 space-y-5">
                {SIDEBAR_SECTIONS.map((section, i) => (
                  <div key={i}>
                    {section.group && (
                      <p className="text-[10px] font-mono font-semibold text-white/25 uppercase tracking-[0.12em] mb-2 px-2">
                        {section.group}
                      </p>
                    )}
                    <ul className="space-y-0.5">
                      {section.links.map(link => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[13px] transition-colors group ${
                              link.accent
                                ? 'text-[#4FACFF]/80 hover:text-[#4FACFF] hover:bg-[#4FACFF]/[0.06]'
                                : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
                            } ${link.soon ? 'opacity-40 pointer-events-none' : ''}`}
                          >
                            {link.label}
                            {link.soon && (
                              <span className="text-[9px] font-mono text-white/20 group-hover:text-white/30">soon</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}

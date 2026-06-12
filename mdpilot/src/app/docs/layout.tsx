'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--md-bg)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sidebar */}
          <aside className="lg:w-52 shrink-0">
            <nav aria-label="Documentation navigation">
              {/* Mobile: compact horizontal scroll */}
              <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-3 mb-6 border-b border-[var(--md-border)] scrollbar-none">
                {SIDEBAR_SECTIONS.flatMap(s => s.links).map(link => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={`shrink-0 px-3 py-1.5 rounded-[6px] text-[12px] font-medium border transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                        active
                          ? 'text-[var(--md-accent)] border-[var(--md-accent)] bg-[var(--md-accent-dim)]'
                          : 'text-[var(--md-text-secondary)] bg-[var(--md-surface)] border-[var(--md-border)] hover:text-[var(--md-text)] hover:border-[var(--md-border-strong)]'
                      } ${link.soon ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Desktop: vertical sidebar — field-manual index */}
              <div className="hidden lg:block sticky top-24 space-y-6 border-l border-[var(--md-border)]">
                {SIDEBAR_SECTIONS.map((section, i) => (
                  <div key={i}>
                    {section.group && (
                      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--md-text-tertiary)] mb-2 pl-4">
                        {section.group}
                      </p>
                    )}
                    <ul className="space-y-0.5">
                      {section.links.map(link => {
                        const active = pathname === link.href;
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              aria-current={active ? 'page' : undefined}
                              className={`flex items-center justify-between -ml-px py-1.5 pl-4 pr-2 border-l-2 text-[13px] transition-colors duration-150 group cursor-pointer ${
                                active
                                  ? 'border-[var(--md-accent)] text-[var(--md-accent)] font-medium'
                                  : 'border-transparent text-[var(--md-text-secondary)] hover:text-[var(--md-text)] hover:border-[var(--md-border-strong)]'
                              } ${link.soon ? 'opacity-40 pointer-events-none' : ''}`}
                            >
                              {link.label}
                              {link.soon && (
                                <span className="text-[9px] font-mono text-[var(--md-text-tertiary)]">soon</span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
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

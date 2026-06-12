'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MenuIcon, XIcon, ExternalLink } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import ZuluClock from '@/components/fx/ZuluClock';

/* Aviation naming — the product is a pilot, the nav is its panel.
   Each destination keeps its route but flies under a callsign. */
const LINKS = [
  { href: '/task', label: 'Flight Deck', sub: 'Task', primary: true },
  { href: '/labs', label: 'Hangar', sub: 'Labs', primary: false },
  { href: '/docs', label: 'Field Manual', sub: 'Docs', primary: false },
  { href: '/blog', label: 'Logbook', sub: 'Blog', primary: false },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
          scrolled ? 'nav-glass' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-[64px]">

            {/* Brand */}
            <Link href="/" className="group flex items-center gap-3 shrink-0">
              <img
                src="/mdpilot-logo.webp"
                alt="MDPilot"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
              <span className="flex flex-col leading-none">
                <span className="font-brand text-[16px] font-bold text-[var(--md-text)]">
                  MDPilot
                </span>
                <span className="hidden sm:block font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--md-text-tertiary)] mt-1">
                  Flight deck for markdown
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList className="gap-1">
                {LINKS.map(link => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink
                      href={link.href}
                      className={`group/link !flex !flex-col !items-start gap-0 px-3.5 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-[var(--md-surface-2)] ${
                        link.primary ? 'text-[var(--md-text)]' : 'text-[var(--md-text-secondary)]'
                      } hover:text-[var(--md-text)]`}
                    >
                      <span className="text-[13.5px] font-medium leading-tight">{link.label}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--md-text-tertiary)] leading-tight group-hover/link:text-[var(--md-accent)] transition-colors">
                        {link.sub}
                      </span>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                <NavigationMenuItem>
                  <a
                    href="https://github.com/get-mdpilot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-[13.5px] font-medium text-[var(--md-text-secondary)] hover:text-[var(--md-text)] cursor-pointer rounded-md hover:bg-[var(--md-surface-2)] transition-colors"
                  >
                    GitHub
                    <ExternalLink size={11} className="opacity-40 shrink-0" />
                  </a>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right side — desktop */}
            <div className="hidden md:flex items-center gap-4">
              <span className="hidden lg:inline-flex" title="Zulu time — aviation standard">
                <ZuluClock />
              </span>
              <Link href="/task" className="nav-cta takeoff-group">
                File a flight plan
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Mobile — Sheet trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-md hover:bg-[var(--md-surface-2)] transition-colors cursor-pointer"
                  aria-label="Open menu"
                >
                  <MenuIcon className="size-5 text-[var(--md-text-secondary)]" />
                </button>
              </SheetTrigger>

              <SheetContent
                className="bg-[var(--md-bg)] border-l border-[var(--md-border)] w-full gap-0"
                showClose={false}
                side="right"
              >
                {/* Mobile header */}
                <div className="flex h-16 items-center justify-between border-b border-[var(--md-border)] px-5">
                  <Link href="/" className="flex items-center gap-2.5">
                    <img
                      src="/mdpilot-logo.webp"
                      alt="MDPilot"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-brand text-[15px] font-bold text-[var(--md-text)]">
                      MDPilot
                    </span>
                  </Link>
                  <SheetClose asChild>
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-[var(--md-surface-2)] transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <XIcon className="size-5 text-[var(--md-text-secondary)]" />
                    </button>
                  </SheetClose>
                </div>

                {/* Scrollable content */}
                <div className="flex flex-col h-[calc(100%-64px)] overflow-y-auto">
                  <div className="px-5 pt-3 pb-4 flex-1">
                    <div>
                      {LINKS.map(link => (
                        <SheetClose asChild key={link.href}>
                          <Link
                            href={link.href}
                            className="flex items-baseline justify-between py-4 border-b border-[var(--md-border)] transition-colors group"
                          >
                            <span className={`text-[15px] font-medium ${link.primary ? 'text-[var(--md-text)]' : 'text-[var(--md-text-secondary)]'} group-hover:text-[var(--md-text)]`}>
                              {link.label}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--md-text-tertiary)]">
                              {link.sub}
                            </span>
                          </Link>
                        </SheetClose>
                      ))}

                      <a
                        href="https://github.com/get-mdpilot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between py-4 text-[15px] font-medium text-[var(--md-text-secondary)] hover:text-[var(--md-text)] transition-colors"
                      >
                        GitHub
                        <ExternalLink size={13} className="opacity-40" />
                      </a>
                    </div>
                  </div>

                  {/* Sticky CTA */}
                  <div className="p-5 border-t border-[var(--md-border)]">
                    <SheetClose asChild>
                      <Link
                        href="/task"
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[10px] bg-[var(--md-accent)] text-[var(--md-accent-ink)] text-sm font-semibold transition-transform active:scale-[0.98]"
                      >
                        File a flight plan
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[64px]" />
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  ListTodo,
  FileInput,
  ImageIcon,
  Brain,
  Layers,
  MenuIcon,
  XIcon,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavGridCard,
  NavSmallItem,
  NavItemMobile,
  type NavItemType,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const toolLinks: NavItemType[] = [
  {
    title: 'Generate',
    href: '/generate',
    description: 'README, AGENTS & CLAUDE.md in seconds',
    icon: FileText as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  },
  {
    title: 'Task',
    href: '/task',
    description: 'Turn any ticket into a structured TASK.md',
    icon: ListTodo as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  },
  {
    title: 'Convert',
    href: '/convert',
    description: 'Any file or paste → clean Markdown',
    icon: FileInput as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  },
  {
    title: 'Image→Prompt',
    href: '/image-to-prompt',
    description: 'Extract AI prompts from screenshots',
    icon: ImageIcon as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  },
  {
    title: 'Interview Primer',
    href: '/interview-primer',
    description: 'Instant prep docs for any role',
    icon: Brain as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  },
];

const comingSoonLinks: NavItemType[] = [
  {
    title: 'Explain',
    href: '/explain',
    description: 'Understand any codebase instantly',
    icon: Layers as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 20);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(7,7,15,0.88)] backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]'
            : 'bg-transparent'
        }`}
      >
        {/* Scroll-progress line */}
        <div
          className="absolute top-0 left-0 h-[2px] z-50 bg-gradient-to-r from-[#4FACFF] via-[#a855f7] to-[#2DD4BF] transition-[width] duration-100 pointer-events-none"
          style={{ width: `${progress * 100}%` }}
        />

        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-[60px]">

            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2.5 shrink-0">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#4FACFF] to-[#A855F7] opacity-90 group-hover:opacity-100 transition-opacity shadow-[0_0_16px_rgba(79,172,255,0.4)]" />
                <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                  <span
                    className="text-[#07070f] text-[11px] font-black tracking-tighter"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    MD
                  </span>
                </div>
              </div>
              <span
                className="font-bold text-[15px] text-white tracking-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                MDPilot
              </span>
              <span className="hidden sm:inline text-[10px] font-mono text-[#4FACFF] border border-[#4FACFF]/30 bg-[#4FACFF]/[0.08] rounded-full px-2 py-0.5">
                v2
              </span>
            </Link>

            {/* Desktop NavigationMenu */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>

                {/* Tools dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white/60 hover:text-white data-[state=open]:text-white text-[13.5px] font-medium h-auto py-2">
                    Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-full md:w-[580px] md:grid-cols-[1fr_.32fr]">
                      {/* Primary tool grid */}
                      <ul className="grid grow gap-3 p-4 md:grid-cols-2 md:border-r border-white/[0.07]">
                        {toolLinks.slice(0, 4).map((link) => (
                          <li key={link.href}>
                            <NavGridCard link={link} />
                          </li>
                        ))}
                      </ul>
                      {/* Side: extra tools + coming soon */}
                      <ul className="p-4 space-y-1 flex flex-col">
                        {toolLinks.slice(4).map((link) => (
                          <li key={link.href}>
                            <NavSmallItem
                              item={link}
                              href={link.href}
                              className="text-white/60 hover:text-white"
                            />
                          </li>
                        ))}
                        <li className="mt-auto pt-4 border-t border-white/[0.06]">
                          <p className="text-[10px] text-white/25 font-mono uppercase tracking-widest px-2 mb-1">
                            Coming soon
                          </p>
                          {comingSoonLinks.map((link) => (
                            <NavSmallItem
                              key={link.href}
                              item={link}
                              href={link.href}
                              className="opacity-40 pointer-events-none text-white/40"
                            />
                          ))}
                        </li>
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Simple links */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/#features"
                    className="px-4 py-2 text-[13.5px] font-medium text-white/60 hover:text-white cursor-pointer rounded-md hover:bg-white/[0.04] transition-colors"
                  >
                    Features
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <a
                    href="/#demo"
                    className="flex flex-row items-center gap-1.5 px-4 py-2 text-[13.5px] font-medium text-white/60 hover:text-white cursor-pointer rounded-md hover:bg-white/[0.04] transition-colors"
                  >
                    <Sparkles size={12} className="opacity-60 shrink-0" />
                    Demo
                  </a>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <a
                    href="https://github.com/mohanreddyt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row items-center gap-1.5 px-4 py-2 text-[13.5px] font-medium text-white/60 hover:text-white cursor-pointer rounded-md hover:bg-white/[0.04] transition-colors"
                  >
                    GitHub
                    <ExternalLink size={11} className="opacity-40 shrink-0" />
                  </a>
                </NavigationMenuItem>

              </NavigationMenuList>
            </NavigationMenu>

            {/* Right side — desktop */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 text-[12px] text-white/30">
                <span className="relative flex h-2 w-2">
                  <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-[#34D399]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
                </span>
                <span className="hidden lg:inline">All systems go</span>
              </div>

              <Link
                href="/generate"
                className="btn-shine relative inline-flex items-center gap-1.5 px-5 py-[9px] rounded-full text-[13px] font-bold text-[#07070f] bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] hover:from-[#6FBFFF] hover:to-[#5FEAD9] shadow-[0_0_20px_rgba(79,172,255,0.28)] hover:shadow-[0_0_30px_rgba(79,172,255,0.45)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Get started free
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Mobile — Sheet trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-white/[0.06] transition-colors"
                  aria-label="Open menu"
                >
                  <MenuIcon className="size-5 text-white/70" />
                </button>
              </SheetTrigger>

              <SheetContent
                className="bg-[rgba(7,7,15,0.97)] border-l border-white/[0.06] w-full backdrop-blur-xl gap-0"
                showClose={false}
                side="right"
              >
                {/* Mobile header */}
                <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-5">
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="relative w-7 h-7">
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#4FACFF] to-[#A855F7]" />
                      <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                        <span className="text-[#07070f] text-[10px] font-black">MD</span>
                      </div>
                    </div>
                    <span
                      className="font-bold text-[15px] text-white"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      MDPilot
                    </span>
                  </Link>
                  <SheetClose asChild>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors"
                      aria-label="Close menu"
                    >
                      <XIcon className="size-5 text-white/70" />
                    </button>
                  </SheetClose>
                </div>

                {/* Scrollable content */}
                <div className="flex flex-col h-[calc(100%-56px)] overflow-y-auto">
                  <div className="px-5 pt-4 pb-4 flex-1">
                    <Accordion type="single" collapsible defaultValue="tools">
                      <AccordionItem
                        value="tools"
                        className="border-white/[0.08]"
                      >
                        <AccordionTrigger className="text-white/70 hover:text-white hover:no-underline text-sm font-medium py-3">
                          Tools
                        </AccordionTrigger>
                        <AccordionContent className="pt-0 pb-2">
                          <ul className="grid gap-1">
                            {toolLinks.map((link) => (
                              <li key={link.href}>
                                <SheetClose asChild>
                                  <NavItemMobile item={link} href={link.href} />
                                </SheetClose>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="mt-2 space-y-0">
                      <a
                        href="/#features"
                        className="flex items-center py-3 text-sm text-white/60 hover:text-white border-b border-white/[0.04] transition-colors"
                      >
                        Features
                      </a>
                      <SheetClose asChild>
                        <a
                          href="/#demo"
                          className="flex flex-row items-center gap-2 py-3 text-sm text-white/60 hover:text-white border-b border-white/[0.04] transition-colors"
                        >
                          <Sparkles size={13} className="opacity-50 shrink-0" />
                          Demo
                        </a>
                      </SheetClose>
                      <a
                        href="https://github.com/mohanreddyt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between py-3 text-sm text-white/60 hover:text-white transition-colors"
                      >
                        GitHub
                        <ExternalLink size={13} className="opacity-30" />
                      </a>
                    </div>
                  </div>

                  {/* Sticky CTA */}
                  <div className="p-5 border-t border-white/[0.06] bg-[rgba(7,7,15,0.97)]">
                    <SheetClose asChild>
                      <Link
                        href="/generate"
                        className="btn-shine flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] text-[#07070f] text-sm font-bold shadow-[0_0_20px_rgba(79,172,255,0.3)] transition-transform active:scale-[0.98]"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        Get started free →
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
      <div className="h-[60px]" />
    </>
  );
}

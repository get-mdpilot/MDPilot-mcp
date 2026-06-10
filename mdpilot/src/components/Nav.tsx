'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MenuIcon,
  XIcon,
  ExternalLink,
  FlaskConical,
} from 'lucide-react';
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

                {/* Task — primary emphasis */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/task"
                    className="px-4 py-2 text-[13.5px] font-semibold text-white/80 hover:text-white cursor-pointer rounded-md hover:bg-white/[0.04] transition-colors"
                  >
                    Task
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Labs */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/labs"
                    className="flex items-center gap-1.5 px-4 py-2 text-[13.5px] font-medium text-white/55 hover:text-white cursor-pointer rounded-md hover:bg-white/[0.04] transition-colors"
                  >
                    <FlaskConical size={13} className="opacity-50 shrink-0" />
                    Labs
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Docs */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/docs"
                    className="px-4 py-2 text-[13.5px] font-medium text-white/50 hover:text-white cursor-pointer rounded-md hover:bg-white/[0.04] transition-colors"
                  >
                    Docs
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Blog */}
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/blog"
                    className="px-4 py-2 text-[13.5px] font-medium text-white/50 hover:text-white cursor-pointer rounded-md hover:bg-white/[0.04] transition-colors"
                  >
                    Blog
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <a
                    href="https://github.com/get-mdpilot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row items-center gap-1.5 px-4 py-2 text-[13.5px] font-medium text-white/45 hover:text-white cursor-pointer rounded-md hover:bg-white/[0.04] transition-colors"
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
                href="/task"
                className="btn-shine relative inline-flex items-center gap-1.5 px-5 py-[9px] rounded-full text-[13px] font-bold text-[#07070f] bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] hover:from-[#6FBFFF] hover:to-[#5FEAD9] shadow-[0_0_20px_rgba(79,172,255,0.28)] hover:shadow-[0_0_30px_rgba(79,172,255,0.45)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Start for free
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
                    <div className="space-y-0">
                      {/* Task — primary */}
                      <SheetClose asChild>
                        <Link
                          href="/task"
                          className="flex items-center py-3.5 text-[15px] font-semibold text-white/85 hover:text-white border-b border-white/[0.05] transition-colors"
                        >
                          Task
                        </Link>
                      </SheetClose>

                      {/* Labs */}
                      <SheetClose asChild>
                        <Link
                          href="/labs"
                          className="flex items-center gap-2 py-3.5 text-[14px] font-medium text-white/55 hover:text-white border-b border-white/[0.05] transition-colors"
                        >
                          <FlaskConical size={14} className="opacity-50 shrink-0" />
                          Labs
                        </Link>
                      </SheetClose>

                      {/* Docs */}
                      <SheetClose asChild>
                        <Link
                          href="/docs"
                          className="flex items-center py-3.5 text-[14px] font-medium text-white/50 hover:text-white border-b border-white/[0.05] transition-colors"
                        >
                          Docs
                        </Link>
                      </SheetClose>

                      {/* Blog */}
                      <SheetClose asChild>
                        <Link
                          href="/blog"
                          className="flex items-center py-3.5 text-[14px] font-medium text-white/50 hover:text-white border-b border-white/[0.05] transition-colors"
                        >
                          Blog
                        </Link>
                      </SheetClose>

                      <a
                        href="https://github.com/get-mdpilot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between py-3.5 text-[14px] text-white/40 hover:text-white transition-colors"
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
                        href="/task"
                        className="btn-shine flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] text-[#07070f] text-sm font-bold shadow-[0_0_20px_rgba(79,172,255,0.3)] transition-transform active:scale-[0.98]"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        Start for free →
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Generate',     href: '/generate' },
  { label: 'Task',         href: '/task' },
  { label: 'Features',     href: '/#features' },
  { label: 'GitHub',       href: 'https://github.com', external: true },
];

export default function Nav() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
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
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-[60px]">

            {/* ── Logo ──────────────────────────────────────────────────── */}
            <Link href="/" className="group flex items-center gap-2.5 shrink-0">
              {/* Animated gradient logo mark */}
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#4FACFF] to-[#A855F7] opacity-90 group-hover:opacity-100 transition-opacity shadow-[0_0_16px_rgba(79,172,255,0.4)]" />
                <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                  <span className="text-[#07070f] text-[11px] font-black tracking-tighter" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>MD</span>
                </div>
              </div>
              <span className="font-bold text-[15px] text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                MDPilot
              </span>
              <span className="hidden sm:inline text-[10px] font-mono text-[#4FACFF] border border-[#4FACFF]/30 bg-[#4FACFF]/[0.08] rounded-full px-2 py-0.5">
                v2
              </span>
            </Link>

            {/* ── Center nav — desktop ───────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="nav-link-slide relative px-4 py-2 text-[13.5px] font-medium text-white/55 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors duration-150"
                >
                  {link.label}
                  {link.external && <span className="ml-0.5 text-[11px] opacity-40">↗</span>}
                </a>
              ))}
            </nav>

            {/* ── Right CTAs — desktop ───────────────────────────────── */}
            <div className="hidden md:flex items-center gap-3">
              {/* Status indicator */}
              <div className="flex items-center gap-2 text-[12px] text-white/30">
                <span className="relative flex h-2 w-2">
                  <span className="pulse-green absolute inline-flex h-full w-full rounded-full bg-[#34D399]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
                </span>
                <span className="hidden lg:inline">All systems go</span>
              </div>

              {/* Primary CTA — Magic MCP quality: shine + glow */}
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

            {/* ── Hamburger — mobile ─────────────────────────────────── */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <span className={`block w-[18px] h-0.5 bg-white/70 rounded-full transition-all duration-200 origin-center ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block w-[18px] h-0.5 bg-white/70 rounded-full transition-all duration-200 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block w-[18px] h-0.5 bg-white/70 rounded-full transition-all duration-200 origin-center ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Mobile menu ─────────────────────────────────────────────── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-[rgba(7,7,15,0.95)] backdrop-blur-xl border-t border-white/[0.05] px-5 py-3 space-y-0.5">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-3 text-sm text-white/60 hover:text-white border-b border-white/[0.04] last:border-0 transition-colors"
              >
                <span>{link.label}</span>
                {link.external && <span className="text-white/20 text-xs">↗</span>}
              </a>
            ))}
            <div className="pt-3 pb-1">
              <Link
                href="/generate"
                onClick={() => setMobileOpen(false)}
                className="btn-shine flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] text-[#07070f] text-sm font-bold shadow-[0_0_20px_rgba(79,172,255,0.3)] transition-transform active:scale-[0.98]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Get started free →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[60px]" />
    </>
  );
}

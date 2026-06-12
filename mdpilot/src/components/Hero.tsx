import Link from 'next/link';
import FlipWord from '@/components/fx/FlipWord';

/* Hero — "Night Approach"
   Editorial, but alive: the headline flaps in like a departures board tile,
   the input source flips split-flap style, and the TASK.md flight plan
   types itself line by line before getting stamped. */
export default function Hero() {
  return (
    <section className="relative border-b border-[var(--md-border)] grid-bg overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-16 lg:pt-24 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-12 items-center">

          {/* ── Left: editorial copy ── */}
          <div>
            <p className="section-label mb-7 fade-up">Pre-flight briefing</p>

            <h1 className="has-perspective fade-up fade-up-1 font-display text-[clamp(2.7rem,6.2vw,4.6rem)] font-semibold text-[var(--md-text)] leading-[1.04] tracking-[-0.02em] mb-5">
              Your agent flies better
              <br />
              with a <em className="em-wonk flap-in text-[var(--md-accent)] font-medium">flight&nbsp;plan</em>.
            </h1>

            {/* Departures-board readout */}
            <p className="fade-up fade-up-2 font-mono text-[12px] uppercase tracking-[0.16em] text-[var(--md-text-tertiary)] mb-6">
              Filed from{' '}
              <FlipWord
                words={['a Jira ticket', 'a Slack thread', 'a half-written spec', 'a bug report', 'your real repo']}
                className="text-[var(--md-accent)] normal-case tracking-normal"
              />
            </p>

            <p className="fade-up fade-up-2 text-[var(--md-text-secondary)] text-[16.5px] leading-relaxed max-w-[34rem] mb-9">
              Most AI coding sessions go wrong in the first message — vague, no constraints,
              no acceptance criteria. MDPilot turns whatever you have into a precise,
              gap-checked TASK.md before your agent ever takes off.
            </p>

            <div className="fade-up fade-up-3 flex flex-wrap items-center gap-4 mb-8">
              <Link
                href="/task"
                className="takeoff-group inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-[var(--md-accent)] text-[var(--md-accent-ink)] text-[14.5px] font-semibold hover:bg-[var(--md-accent-strong)] hover:-translate-y-px transition-all duration-200 shadow-[var(--shadow-sm)]"
              >
                File a flight plan
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link href="/docs/mcp" className="btn-ghost">
                Or run it inside your IDE
              </Link>
            </div>

            <p className="fade-up fade-up-3 font-mono text-[11px] text-[var(--md-text-tertiary)] tracking-wide mb-10">
              No account · no credit card · nothing stored
            </p>

            {/* Runway centerline */}
            <div className="fade-up fade-up-3 runway-line max-w-[34rem]" aria-hidden />
          </div>

          {/* ── Right: the flight plan, typing itself ── */}
          <div className="relative">
            {/* Offset paper sheet behind, like a stack on a clipboard */}
            <div
              aria-hidden
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-[14px] border border-[var(--md-border)] bg-[var(--md-surface-2)]"
            />
            <div className="flightplan-card relative">
              {/* Document header strip */}
              <div className="flex items-center justify-between px-5 py-3 bg-[var(--md-surface-2)] border-b border-[var(--md-border)]">
                <span className="font-mono text-[11px] font-medium text-[var(--md-text-secondary)] tracking-wide">
                  TASK.md
                </span>
                <span className="font-mono text-[10px] text-[var(--md-text-tertiary)] uppercase tracking-[0.16em]">
                  Flight plan · MDP-2847
                </span>
              </div>

              {/* Document body — lines type in, staggered */}
              <div className="fp-anim px-5 sm:px-6 py-5 font-mono text-[12px] leading-relaxed">
                <p className="text-[var(--md-accent)] font-semibold text-[13px] mb-3">
                  # Fix OAuth post-auth redirect loop
                </p>

                <p className="text-[var(--md-text-tertiary)] mb-0.5">## Goal</p>
                <p className="text-[var(--md-text-secondary)] text-[11.5px] mb-3">
                  Authenticated users land on /login after OAuth instead of /dashboard.
                  Regression from v3.1.0.
                </p>

                <p className="text-[var(--md-text-tertiary)] mb-0.5">## Acceptance criteria</p>
                <p className="text-[var(--md-go)] text-[11.5px]">- [ ] /auth/callback → /dashboard (first OAuth)</p>
                <p className="text-[var(--md-go)] text-[11.5px]">- [ ] /auth/callback → /dashboard (returning)</p>
                <p className="text-[var(--md-go)] text-[11.5px] mb-3">- [ ] /login never renders when authenticated</p>

                <p className="text-[var(--md-text-tertiary)] mb-0.5">## Watch-outs</p>
                <p className="text-[var(--md-text-secondary)] text-[11.5px]">- middleware.ts may contain a redirect loop</p>
                <p className="text-[var(--md-text-secondary)] text-[11.5px]">
                  - verify session cookie set before redirect fires
                  <span className="cursor text-[var(--md-accent)]">▍</span>
                </p>

                <div className="flightplan-rule mt-4 pt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10.5px] text-[var(--md-text-tertiary)] mb-2">
                      src: jira ticket + slack thread
                      <br />
                      optimized: 1,184 → 762 tokens (−36%)
                    </p>
                    <div className="barcode" aria-hidden />
                  </div>
                  <span className="stamp shrink-0">Gap-checked ✓</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

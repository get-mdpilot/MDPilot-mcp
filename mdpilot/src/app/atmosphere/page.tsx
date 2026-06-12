import Link from 'next/link';

interface Section {
  index: string;
  kicker: string;
  title: string;
  body: string;
  tech: string;
}

const SECTIONS: Section[] = [
  {
    index: 'I',  kicker: 'Surfaces',
    title: 'Ink that leans warm, not blue.',
    body: 'Most dark interfaces sit on blue-black — the default of every template. Ours is warm ink, the colour of a cockpit at night or a page under a desk lamp. Surfaces step up in three quiet layers; nothing glows.',
    tech: '#12100D · #181510 · #201B14',
  },
  {
    index: 'II', kicker: 'One Accent',
    title: 'A single amber instrument light.',
    body: 'One accent, used the way an instrument panel uses amber: to mark the thing that needs your hand right now. Success is a muted olive, caution a soft clay. No gradients, no neon, no competing hues.',
    tech: 'amber #E6A23C · olive #9DB87C · clay #CC6B5A',
  },
  {
    index: 'III', kicker: 'Type',
    title: 'A serif with opinions, a sans that works.',
    body: 'Headlines are set in Fraunces — warm, editorial, a little old-fashioned on purpose. Interface and prose run on IBM Plex Sans; labels and readouts on IBM Plex Mono. It reads like a well-kept field manual, because that is what it is.',
    tech: 'Fraunces · IBM Plex Sans · IBM Plex Mono',
  },
  {
    index: 'IV', kicker: 'Lines',
    title: 'Depth from hairlines, not shadows.',
    body: 'Structure comes from one-pixel rules and dashed dividers, like a chart or a logbook page. Where a shadow exists at all, it is the soft lift of paper — never a coloured glow.',
    tech: 'hairline borders · chart-paper rules',
  },
  {
    index: 'V', kicker: 'Motion',
    title: 'Instruments move. Chrome doesn’t.',
    body: 'Every animation is a cockpit instrument: a split-flap departures board, a radar sweep, sequenced approach strobes, an altimeter that descends as you scroll, a flight plan typing itself. The interface around them holds perfectly still — that contrast is the effect.',
    tech: 'split-flap · radar · approach lights · altimeter',
  },
  {
    index: 'VI', kicker: 'Voice',
    title: 'The pilot metaphor, taken seriously.',
    body: 'The product is called MDPilot, so the interface flies the theme honestly: tasks are filed as flight plans on the Flight Deck, experiments live in the Hangar, docs are the Field Manual, the blog is the Logbook. Cleared for takeoff.',
    tech: 'flight deck · hangar · field manual · logbook',
  },
];

export default function AtmospherePage() {
  return (
    <div className="min-h-screen bg-[var(--md-bg)] grid-bg">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20">

        {/* Header */}
        <div className="mb-14">
          <p className="section-label mb-6">Flight notes — design study</p>
          <h1 className="font-display font-semibold text-[clamp(2.2rem,6vw,3.5rem)] leading-[1.1] tracking-[-0.015em] text-[var(--md-text)] mb-5">
            Notes on the <em className="not-italic font-display italic text-[var(--md-accent)]">night approach.</em>
          </h1>
          <p className="text-[15px] text-[var(--md-text-secondary)] max-w-md leading-relaxed">
            Six decisions behind MDPilot&apos;s design system — why it looks hand-made, not generated.
          </p>
        </div>

        {/* Technique sections */}
        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <section key={s.index} className="rounded-[var(--md-radius-lg)] border border-[var(--md-border)] bg-[var(--md-surface)] p-6">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-sm font-mono font-medium text-[var(--md-accent)]">{s.index}</span>
                <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--md-text-tertiary)]">
                  {s.kicker}
                </span>
              </div>
              <h2 className="font-display font-semibold text-[1.35rem] leading-snug tracking-[-0.015em] text-[var(--md-text)] mb-3">
                {s.title}
              </h2>
              <p className="text-[15px] text-[var(--md-text-secondary)] leading-relaxed mb-4">{s.body}</p>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--md-text-tertiary)]">{s.tech}</p>
            </section>
          ))}
        </div>

        {/* Outro / CTA */}
        <div className="mt-16 pt-10 border-t border-[var(--md-border)] text-center">
          <h2 className="font-display font-semibold text-[clamp(1.6rem,4vw,2.4rem)] leading-tight tracking-[-0.015em] text-[var(--md-text)] mb-4">
            Built with the same care as your <em className="not-italic font-display italic text-[var(--md-accent)]">.md files.</em>
          </h2>
          <p className="text-[var(--md-text-secondary)] max-w-md mx-auto mb-8 leading-relaxed">
            This is MDPilot&apos;s craft, made visible. The same attention goes into every prompt, every optimizer pass, every generated file.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/generate"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[10px] bg-[var(--md-accent)] text-[var(--md-accent-ink)] font-semibold hover:bg-[var(--md-accent-strong)] hover:-translate-y-px transition-all duration-200 shadow-[var(--shadow-sm)] cursor-pointer">
              Generate your files
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link href="/"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[10px] border border-[var(--md-border-strong)] text-[var(--md-text-secondary)] font-medium hover:text-[var(--md-text)] hover:border-[var(--md-accent)] transition-colors duration-200 cursor-pointer">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

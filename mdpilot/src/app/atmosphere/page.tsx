'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { MoodStop } from '@/components/MountainBackground';

const MountainBackground = dynamic(() => import('@/components/MountainBackground'), { ssr: false });

// Two hex colors per band = the emotion that section carries through the 3D scene.
const MOODS: MoodStop[] = [
  { at: 0.0,  colorA: '#0a1230', colorB: '#4FACFF', fog: '#070b1e' }, // Arrival — cold clarity
  { at: 0.2,  colorA: '#0c1838', colorB: '#5fb0ff', fog: '#080d22' }, // Light — blue atmosphere
  { at: 0.4,  colorA: '#08231f', colorB: '#2dd4bf', fog: '#04130f' }, // Momentum — teal velocity
  { at: 0.6,  colorA: '#161033', colorB: '#a855f7', fog: '#0c0820' }, // Breath — violet drift
  { at: 0.8,  colorA: '#1a1430', colorB: '#c4b5fd', fog: '#0d0a1c' }, // Depth — soft focus
  { at: 1.0,  colorA: '#2a1018', colorB: '#ff6b6b', fog: '#140a10' }, // Emotion — warm release
];

interface Section {
  index: string;
  kicker: string;
  title: string;
  body: string;
  tech: string;
  accent: string;
}

const SECTIONS: Section[] = [
  {
    index: 'I',  kicker: 'WebGL', accent: '#4FACFF',
    title: 'A mountain range,\nrendered live.',
    body: 'Zero video. Every peak is generated this instant on your GPU — a 256×256 mesh displaced by ridged noise. Refresh and the range is reborn, never the same frame twice.',
    tech: 'WebGL · 65k-vertex procedural terrain',
  },
  {
    index: 'II', kicker: 'GLSL Shaders', accent: '#5fb0ff',
    title: 'Blue light, woven\nbetween the peaks.',
    body: 'Atmospheric shafts drawn in a fragment shader — additive light that rises between ridgelines and is occluded by the rock in front of it. Pure math, no textures.',
    tech: 'GLSL · additive volumetric shafts',
  },
  {
    index: 'III', kicker: 'Lenis.js', accent: '#2dd4bf',
    title: 'Your scroll has\nweight now.',
    body: 'Lenis smooths the wheel into momentum, and that velocity physically moves the camera — sway, parallax, a dolly through the valley. Fling the page and the world leans with you.',
    tech: 'Lenis · scroll velocity → camera',
  },
  {
    index: 'IV', kicker: 'requestAnimationFrame', accent: '#a855f7',
    title: 'Fog and light\nbreathe every frame.',
    body: 'On every animation frame, fog density and shaft intensity respond to how fast you are moving. Stop, and the air settles. Rush, and the atmosphere thickens.',
    tech: 'rAF · per-frame fog + light',
  },
  {
    index: 'V', kicker: 'Depth of Field', accent: '#c4b5fd',
    title: 'Distance blurs,\nlike a real lens.',
    body: 'A bokeh pass focuses a single band of the range; the far peaks fall soft and out of focus. As you scroll, the focal plane travels deeper into the scene.',
    tech: 'WebGL · post-process bokeh DOF',
  },
  {
    index: 'VI', kicker: 'Two Hex Colors', accent: '#ff6b6b',
    title: 'Every emotion,\nfrom two colors.',
    body: 'The whole mood — terrain, light, horizon — is driven by just two hex values per section, blended as you scroll. Cold blue clarity melts into warm release. The scene feels what the page says.',
    tech: '#070b1e → #ff6b6b · scroll-blended',
  },
];

export default function AtmospherePage() {
  const [progress, setProgress] = useState(0);

  // Lightweight scroll progress for the UI indicator (Lenis drives the 3D itself)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeIdx = Math.min(SECTIONS.length - 1, Math.floor(progress * SECTIONS.length + 0.15));

  return (
    <>
      <MountainBackground moods={MOODS} />

      {/* Top scroll-progress line */}
      <div className="fixed top-0 left-0 h-[2px] z-40 bg-gradient-to-r from-[#4FACFF] via-[#a855f7] to-[#ff6b6b] transition-[width] duration-150"
        style={{ width: `${progress * 100}%` }} />

      {/* Section dots — right rail */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col gap-3" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <a key={s.index} href={`#sec-${i}`}
            className="group flex items-center gap-2 justify-end"
            title={s.kicker}>
            <span className={`text-[10px] font-mono transition-all duration-200 ${
              activeIdx === i ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
            }`} style={{ color: s.accent }}>{s.kicker}</span>
            <span className="rounded-full transition-all duration-300"
              style={{
                width: activeIdx === i ? 10 : 6,
                height: activeIdx === i ? 10 : 6,
                background: activeIdx === i ? s.accent : 'rgba(255,255,255,0.3)',
                boxShadow: activeIdx === i ? `0 0 12px ${s.accent}` : 'none',
              }} />
          </a>
        ))}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs text-white/60">
          <span className="w-2 h-2 rounded-full bg-[#4FACFF] animate-pulse" />
          Live WebGL — rendered on your GPU, right now
        </div>
        <h1 className="text-[clamp(2.8rem,9vw,7rem)] font-black tracking-[-0.04em] leading-[0.95] mb-6"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="text-white">The air between</span><br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4FACFF] to-[#a855f7]">the mountains.</span>
        </h1>
        <p className="text-lg text-white/50 max-w-md mx-auto leading-relaxed mb-10">
          Six rendering techniques, one continuous scene. Scroll slowly — the world is listening to your velocity.
        </p>
        <div className="flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-[11px] tracking-[0.2em] uppercase">Scroll</span>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </section>

      {/* ── Technique sections ───────────────────────────────────────────── */}
      {SECTIONS.map((s, i) => (
        <section key={s.index} id={`sec-${i}`} className="relative z-10 min-h-screen flex items-center px-6 sm:px-12">
          <div className={`max-w-xl ${i % 2 === 1 ? 'ml-auto text-right' : ''}`}>
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="text-sm font-mono font-bold" style={{ color: s.accent }}>{s.index}</span>
              <span className="text-[11px] font-mono uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border"
                style={{ color: s.accent, borderColor: `${s.accent}40`, background: `${s.accent}12` }}>
                {s.kicker}
              </span>
            </div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.03em] leading-[1.05] mb-5 whitespace-pre-line text-white"
              style={{ fontFamily: 'Space Grotesk, sans-serif', textShadow: '0 2px 40px rgba(0,0,0,0.5)' }}>
              {s.title}
            </h2>
            <div className={`rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10 p-6 ${i % 2 === 1 ? 'ml-auto' : ''}`}
              style={{ maxWidth: 460 }}>
              <p className="text-[15px] text-white/70 leading-relaxed mb-4">{s.body}</p>
              <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: s.accent }}>{s.tech}</p>
            </div>
          </div>
        </section>
      ))}

      {/* ── Outro / CTA ──────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-[clamp(2.4rem,6vw,4.5rem)] font-black tracking-[-0.04em] leading-[1] mb-6 text-white"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Built with the same care<br />as your <span className="text-[#ff6b6b]">.md files.</span>
        </h2>
        <p className="text-white/50 max-w-md mx-auto mb-10 leading-relaxed">
          This is MDPilot&apos;s craft, made visible. The same attention goes into every prompt, every optimizer pass, every generated file.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/generate"
            className="btn-shine inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#4FACFF] to-[#38D9A9] text-[#07070f] font-bold hover:scale-[1.03] transition-transform"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Generate your files
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-xl text-white/70 font-medium hover:text-white transition-colors">
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}

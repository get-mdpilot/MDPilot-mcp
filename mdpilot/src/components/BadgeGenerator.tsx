'use client';

import { useState } from 'react';

interface BadgeGeneratorProps {
  onInsert: (markdown: string) => void;
}

const BADGE_TEMPLATES = [
  {
    category: 'Build',
    badges: [
      { label: 'Build',    template: '![Build Status](https://img.shields.io/badge/build-passing-brightgreen)' },
      { label: 'Tests',    template: '![Tests](https://img.shields.io/badge/tests-passing-brightgreen)' },
      { label: 'Coverage', template: '![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)' },
    ],
  },
  {
    category: 'Meta',
    badges: [
      { label: 'License MIT',    template: '![License](https://img.shields.io/badge/license-MIT-blue)' },
      { label: 'License Apache', template: '![License](https://img.shields.io/badge/license-Apache%202.0-blue)' },
      { label: 'Version',        template: '![Version](https://img.shields.io/badge/version-1.0.0-blue)' },
    ],
  },
  {
    category: 'Tech',
    badges: [
      { label: 'TypeScript', template: '![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)' },
      { label: 'React',      template: '![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)' },
      { label: 'Next.js',    template: '![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)' },
      { label: 'Python',     template: '![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)' },
      { label: 'Node.js',    template: '![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)' },
      { label: 'Tailwind',   template: '![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)' },
    ],
  },
  {
    category: 'Status',
    badges: [
      { label: 'PRs Welcome', template: '![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)' },
      { label: 'Maintained',  template: '![Maintained](https://img.shields.io/badge/maintained-yes-green)' },
      { label: 'Stars',       template: '![Stars](https://img.shields.io/github/stars/YOUR_USER/YOUR_REPO)' },
    ],
  },
];

const COLORS = ['brightgreen', 'blue', 'red', 'yellow', 'purple', 'orange'];

function badgeUrl(tpl: string): string {
  // Extract the URL inside ![...](URL)
  const m = tpl.match(/\((https:\/\/[^)]+)\)/);
  return m ? m[1] : '';
}

export default function BadgeGenerator({ onInsert }: BadgeGeneratorProps) {
  const [open, setOpen]       = useState(false);
  const [added, setAdded]     = useState<string | null>(null);
  const [label, setLabel]     = useState('');
  const [value, setValue]     = useState('');
  const [color, setColor]     = useState('blue');

  const insert = (markdown: string, key: string) => {
    onInsert(markdown);
    setAdded(key);
    setTimeout(() => setAdded(null), 1500);
  };

  const addCustom = () => {
    if (!label.trim() || !value.trim()) return;
    const enc = (s: string) => s.trim().replace(/-/g, '--').replace(/ /g, '%20');
    const md = `![${label.trim()}](https://img.shields.io/badge/${enc(label)}-${enc(value)}-${color})`;
    insert(md, 'custom');
    setLabel(''); setValue('');
  };

  return (
    <div className="mt-3 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium">🏷️ Add badges</span>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          className={`text-[var(--md-text-tertiary)] transition-transform ${open ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--md-border)] space-y-4">
          {BADGE_TEMPLATES.map(group => (
            <div key={group.category}>
              <p className="text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-2">{group.category}</p>
              <div className="flex flex-wrap gap-2">
                {group.badges.map(b => (
                  <button
                    key={b.label}
                    onClick={() => insert(b.template, b.label)}
                    title={`Insert ${b.label} badge`}
                    className="rounded-md border border-[var(--md-border)] bg-white/[0.02] px-2 py-1.5 hover:border-[#4FACFF]/40 hover:bg-white/[0.05] transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={badgeUrl(b.template)} alt={b.label} className="h-[18px]" />
                    {added === b.label && <span className="block text-[9px] text-[var(--md-teal)] mt-0.5">Added!</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Custom badge builder */}
          <div className="pt-3 border-t border-[var(--md-border)]">
            <p className="text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-2">Custom badge</p>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={label} onChange={e => setLabel(e.target.value)} placeholder="Label"
                className="flex-1 min-w-[90px] rounded-lg border border-[var(--md-border)] bg-white/[0.03] px-3 py-1.5 text-xs focus:outline-none focus:border-[#4FACFF]/50"
              />
              <input
                value={value} onChange={e => setValue(e.target.value)} placeholder="Value"
                className="flex-1 min-w-[90px] rounded-lg border border-[var(--md-border)] bg-white/[0.03] px-3 py-1.5 text-xs focus:outline-none focus:border-[#4FACFF]/50"
              />
              <select
                value={color} onChange={e => setColor(e.target.value)}
                className="rounded-lg border border-[var(--md-border)] bg-[var(--md-surface)] px-3 py-1.5 text-xs focus:outline-none focus:border-[#4FACFF]/50"
              >
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={addCustom}
                disabled={!label.trim() || !value.trim()}
                className="px-3 py-1.5 rounded-lg bg-[#4FACFF] text-[#07070f] text-xs font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {added === 'custom' ? 'Added!' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

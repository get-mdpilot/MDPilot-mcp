'use client';

import React from 'react';
import type { AIProvider } from '@/lib/ai-client';

interface ModelSelectorProps {
  selected:  AIProvider;
  onChange:  (provider: AIProvider) => void;
  available: AIProvider[];
}

const CLAUDE_STAR = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C10 7 7 10 2 12C7 14 10 17 12 22C14 17 17 14 22 12C17 10 14 7 12 2Z"/>
  </svg>
);

const PROVIDER_INFO: Record<AIProvider, { label: string; icon: React.ReactNode; color: string; desc: string; model: string }> = {
  nvidia:  { label: 'Nemotron', icon: '⬡', color: '#76B900', desc: 'NVIDIA NIM', model: 'nvidia/nemotron-3-ultra-550b-a55b' },
  claude:  { label: 'Claude',   icon: CLAUDE_STAR, color: '#D97706', desc: 'Anthropic', model: 'claude-sonnet-4-6' },
  gpt:     { label: 'GPT-4o',  icon: '◉', color: '#10A37F', desc: 'OpenAI',    model: 'gpt-4o' },
  gemini:  { label: 'Gemini',  icon: '✧', color: '#4285F4', desc: 'Google',    model: 'gemini-2.0-flash' },
  groq:    { label: 'Llama',   icon: '⚡', color: '#F55036', desc: 'Groq',      model: 'llama-3.3-70b-versatile' },
};

const ORDER: AIProvider[] = ['groq', 'claude', 'nvidia', 'gpt', 'gemini'];

export default function ModelSelector({ selected, onChange, available }: ModelSelectorProps) {
  const info = PROVIDER_INFO[selected];

  return (
    <div>
      <p className="section-label mb-2.5">Model</p>
      <div className="flex flex-wrap gap-2">
        {ORDER.map(id => {
          const p          = PROVIDER_INFO[id];
          const isAvailable = available.includes(id);
          const isSelected  = selected === id;
          return (
            <button
              key={id}
              onClick={() => isAvailable && onChange(id)}
              disabled={!isAvailable}
              title={isAvailable ? `${p.label} · ${p.desc}` : `Set up the ${p.desc} API key to use ${p.label}`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-sm font-medium border transition-all duration-200 ${
                !isAvailable
                  ? 'opacity-35 cursor-not-allowed border-[var(--md-border)] text-[var(--md-text-tertiary)]'
                  : isSelected
                  ? 'border-[var(--md-accent)] bg-[var(--md-accent-dim)] text-[var(--md-accent)] cursor-pointer'
                  : 'border-[var(--md-border-strong)] text-[var(--md-text-secondary)] hover:text-[var(--md-text)] hover:border-[var(--md-accent)] cursor-pointer'
              }`}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-[var(--md-text-secondary)] mt-2.5">
        Using <span className="font-mono">{info.model}</span> · {info.desc}
      </p>
    </div>
  );
}

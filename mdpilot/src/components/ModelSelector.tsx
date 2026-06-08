'use client';

import type { AIProvider } from '@/lib/ai-client';

interface ModelSelectorProps {
  selected:  AIProvider;
  onChange:  (provider: AIProvider) => void;
  available: AIProvider[];
}

const PROVIDER_INFO: Record<AIProvider, { label: string; icon: string; color: string; desc: string; model: string }> = {
  claude:  { label: 'Claude',    icon: '✦', color: '#D97706', desc: 'Anthropic', model: 'claude-sonnet-4-6' },
  gpt:     { label: 'GPT-4o',   icon: '◉', color: '#10A37F', desc: 'OpenAI',    model: 'gpt-4o' },
  gemini:  { label: 'Gemini',   icon: '✧', color: '#4285F4', desc: 'Google',    model: 'gemini-2.0-flash' },
  groq:    { label: 'Llama',    icon: '⚡', color: '#F55036', desc: 'Groq',      model: 'llama-3.3-70b-versatile' },
  nvidia:  { label: 'Llama 3.3', icon: '◈', color: '#76B900', desc: 'NVIDIA NIM', model: 'meta/llama-3.3-70b-instruct' },
};

const ORDER: AIProvider[] = ['claude', 'gpt', 'gemini', 'groq', 'nvidia'];

export default function ModelSelector({ selected, onChange, available }: ModelSelectorProps) {
  const info = PROVIDER_INFO[selected];

  return (
    <div>
      <p className="text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-2">Model</p>
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                !isAvailable
                  ? 'opacity-35 cursor-not-allowed border-white/[0.06] text-[var(--md-text-tertiary)]'
                  : isSelected
                  ? 'text-white border-transparent'
                  : 'border-white/[0.10] text-[var(--md-text-secondary)] hover:text-[var(--md-text)] hover:border-white/[0.2]'
              }`}
              style={isSelected && isAvailable ? { background: p.color, boxShadow: `0 0 16px ${p.color}55` } : undefined}
            >
              <span style={!isSelected && isAvailable ? { color: p.color } : undefined}>{p.icon}</span>
              {p.label}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-[var(--md-text-tertiary)] mt-2">
        Using <span className="font-mono">{info.model}</span> · {info.desc}
      </p>
    </div>
  );
}

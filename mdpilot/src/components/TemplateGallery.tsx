'use client';

import type { ProjectType, Audience, AITool, MDFileType } from '@/types';

export interface Template {
  id: string;
  name: string;
  desc: string;
  stack: string[];
  projectType: ProjectType;
  audience: Audience;
  aiTools: AITool[];
  files: MDFileType[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'nextjs-saas', name: 'Next.js SaaS Starter',
    desc: 'Full-stack SaaS with auth, payments, and dashboard',
    stack: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase', 'Stripe', 'Clerk'],
    projectType: 'webapp', audience: 'public', aiTools: ['claude', 'cursor'],
    files: ['readme', 'agents', 'claude', 'contributing'],
  },
  {
    id: 'python-api', name: 'Python FastAPI',
    desc: 'REST API with auth, database, and docs',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Pytest'],
    projectType: 'api', audience: 'team', aiTools: ['copilot'],
    files: ['readme', 'agents', 'contributing', 'security'],
  },
  {
    id: 'react-library', name: 'React Component Library',
    desc: 'Publishable UI components with Storybook',
    stack: ['React', 'TypeScript', 'Tailwind', 'Storybook', 'Vitest'],
    projectType: 'library', audience: 'public', aiTools: ['claude'],
    files: ['readme', 'agents', 'claude', 'contributing', 'design'],
  },
  {
    id: 'mobile-flutter', name: 'Flutter Mobile App',
    desc: 'Cross-platform mobile app with state management',
    stack: ['Flutter', 'Dart', 'Firebase', 'Riverpod'],
    projectType: 'mobile', audience: 'team', aiTools: ['cursor'],
    files: ['readme', 'agents'],
  },
  {
    id: 'design-system', name: 'Design System',
    desc: 'Component library with tokens and documentation',
    stack: ['React', 'TypeScript', 'Tailwind', 'Figma'],
    projectType: 'design', audience: 'team', aiTools: ['claude', 'cursor'],
    files: ['readme', 'agents', 'design', 'contributing'],
  },
  {
    id: 'solo-project', name: 'Solo Side Project',
    desc: 'Quick personal project with AI coding assistant',
    stack: ['Next.js', 'TypeScript', 'Tailwind'],
    projectType: 'webapp', audience: 'me', aiTools: ['claude'],
    files: ['readme', 'claude', 'context'],
  },
];

interface TemplateGalleryProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
}

export default function TemplateGallery({ onSelect, onClose }: TemplateGalleryProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-auto rounded-2xl border border-white/[0.10] bg-[var(--md-dark-2)] p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Start from a template</h2>
            <p className="text-sm text-[var(--md-text-secondary)] mt-0.5">
              Pre-fills the wizard. Edit anything before generating.
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--md-text-tertiary)] hover:text-[var(--md-text)] text-xl leading-none shrink-0">×</button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="text-left rounded-[10px] border border-[var(--md-border)] bg-[var(--md-surface)] p-4 hover:border-[var(--md-accent)] hover:bg-[var(--md-surface-2)] hover:-translate-y-[1px] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[var(--md-text)]">{t.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--md-surface-2)] text-[var(--md-text-tertiary)] shrink-0">
                  {t.files.length} files
                </span>
              </div>
              <p className="text-xs text-[var(--md-text-secondary)] mb-3 leading-relaxed">{t.desc}</p>
              <div className="flex flex-wrap gap-1">
                {t.stack.map(s => (
                  <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-[var(--md-text-tertiary)]">{s}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

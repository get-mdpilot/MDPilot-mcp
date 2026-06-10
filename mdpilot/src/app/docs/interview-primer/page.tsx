import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Interview primer — MDPilot docs',
  description:
    'How to use MDPilot Interview Primer: enter a role and experience level, optionally paste a job description, and get a ready-to-paste AI interview coach prompt.',
};

const LEVELS = [
  { id: 'junior', label: 'Junior (0–2 yrs)', desc: 'Focuses on fundamentals, learning velocity, and mentorship fit.' },
  { id: 'mid', label: 'Mid (2–5 yrs)', desc: 'Covers ownership, system design basics, and debugging depth.' },
  { id: 'senior', label: 'Senior (5–10 yrs)', desc: 'Architecture, cross-team influence, and trade-off reasoning.' },
  { id: 'staff', label: 'Staff / Principal', desc: 'Org-level impact, navigating ambiguity, and technical strategy.' },
];

export default function InterviewPrimerDocsPage() {
  return (
    <div className="max-w-2xl">

      <div className="mb-8">
        <div className="section-label mb-4 w-fit">Labs</div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-black text-white tracking-[-0.04em] mb-3 leading-tight">
          Interview primer
        </h1>
        <p className="text-white/45 text-[15px] leading-relaxed">
          Enter a role and experience level — optionally paste a job description — and get a
          ready-to-paste AI interview coach prompt tailored to that role and seniority.
        </p>
      </div>

      {/* When to use */}
      <div className="mb-8 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
        <h2 className="text-[13px] font-semibold text-white/70 mb-2">When to use it</h2>
        <ul className="space-y-1.5">
          {[
            'Preparing for an upcoming technical interview and want a realistic mock session with an AI coach',
            'Brushing up on a specific role or level before a panel round',
            'Helping a candidate on your team prepare — generate a primer and share it with them',
            'Running a structured self-assessment against a job description you\'re targeting',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-[#2DD4BF]/60 mt-2 shrink-0" />
              <span className="text-[12px] text-white/45 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* How to */}
      <div className="mb-8">
        <h2 className="text-[15px] font-bold text-white mb-4">How to use it</h2>
        <div className="space-y-3">
          {[
            {
              n: '1',
              title: 'Enter the role',
              desc: 'Type the role title — e.g. "Senior Backend Engineer", "Product Manager", "Staff ML Engineer". At least 3 characters.',
            },
            {
              n: '2',
              title: 'Select the experience level',
              desc: 'Choose from Junior (0–2 yrs), Mid (2–5 yrs), Senior (5–10 yrs), or Staff / Principal. This changes the focus areas and depth of the generated prompt significantly.',
            },
            {
              n: '3',
              title: 'Optionally paste a job description',
              desc: 'Adding the actual JD grounds the prompt in the specific role requirements — technologies, responsibilities, and what the hiring team cares about.',
            },
            {
              n: '4',
              title: 'Generate and paste into your AI tool',
              desc: 'Copy the generated prompt and paste it into Claude, ChatGPT, or any AI assistant. It sets the AI up as an interview coach for that specific role — start the conversation with "Let\'s begin."',
            },
          ].map(step => (
            <div key={step.n} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/18 flex items-center justify-center text-[10px] font-mono font-bold text-[#2DD4BF]/55 mt-0.5">
                {step.n}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-white/70 mb-0.5">{step.title}</p>
                <p className="text-[12px] text-white/40 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Levels */}
      <div className="mb-8">
        <h2 className="text-[15px] font-bold text-white mb-3">Experience levels</h2>
        <div className="space-y-2">
          {LEVELS.map(l => (
            <div key={l.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <code className="text-[11px] font-mono font-bold text-[#2DD4BF]/60 shrink-0 w-20 mt-0.5">{l.id}</code>
              <div>
                <p className="text-[12px] font-semibold text-white/65 mb-0.5">{l.label}</p>
                <p className="text-[12px] text-white/40">{l.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-white/[0.05]">
        <Link href="/docs/image-to-prompt" className="text-[12px] font-mono text-white/25 hover:text-white/50 transition-colors">
          ← Image → Prompt
        </Link>
      </div>

    </div>
  );
}

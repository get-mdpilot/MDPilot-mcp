'use client';

const STACK_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /next|nextjs|next\.js/i,        label: 'Next.js' },
  { re: /react/i,                        label: 'React' },
  { re: /vue/i,                          label: 'Vue' },
  { re: /svelte/i,                       label: 'Svelte' },
  { re: /angular/i,                      label: 'Angular' },
  { re: /tailwind/i,                     label: 'Tailwind' },
  { re: /typescript|"typescript"/i,      label: 'TypeScript' },
  { re: /fastapi/i,                      label: 'FastAPI' },
  { re: /django/i,                       label: 'Django' },
  { re: /flask/i,                        label: 'Flask' },
  { re: /python|django|flask|fastapi/i,  label: 'Python' },
  { re: /node|express/i,                 label: 'Node.js' },
  { re: /supabase/i,                     label: 'Supabase' },
  { re: /firebase/i,                     label: 'Firebase' },
  { re: /postgres/i,                     label: 'PostgreSQL' },
  { re: /mongo/i,                        label: 'MongoDB' },
  { re: /prisma/i,                       label: 'Prisma' },
  { re: /flutter|dart/i,                 label: 'Flutter' },
  { re: /swift/i,                        label: 'Swift' },
  { re: /kotlin/i,                       label: 'Kotlin' },
  { re: /rust|cargo/i,                   label: 'Rust' },
  { re: /go\b|golang/i,                  label: 'Go' },
  { re: /docker/i,                       label: 'Docker' },
  { re: /aws|lambda|s3\b/i,              label: 'AWS' },
  { re: /vercel/i,                       label: 'Vercel' },
  { re: /stripe/i,                       label: 'Stripe' },
  { re: /clerk/i,                        label: 'Clerk' },
];

export function detectStack(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const { re, label } of STACK_PATTERNS) {
    if (re.test(raw) && !seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  return out;
}

interface StackInputProps {
  value: string;
  onChange: (value: string) => void;
  detectedStack: string[];
  onDetect: (stack: string[]) => void;
}

export default function StackInput({ value, onChange, detectedStack, onDetect }: StackInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    onChange(v);
    onDetect(detectStack(v));
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={'e.g. Next.js + Supabase + Tailwind\nor paste your package.json here…'}
        rows={5}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm font-mono resize-none focus:outline-none focus:border-[#4FACFF]/50 transition-colors text-[var(--md-text)] placeholder:text-white/20"
      />
      {detectedStack.length > 0 && (
        <div className="mt-2.5">
          <p className="text-[11px] text-[var(--md-text-tertiary)] mb-2">Detected:</p>
          <div className="flex flex-wrap gap-1.5">
            {detectedStack.map(label => (
              <span key={label}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#2DD4BF]/[0.10] text-[#2DD4BF]">
                <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="mt-2.5 text-[11px] text-[var(--md-text-tertiary)] italic">
        Tip: even "I use React and a Python backend" works fine.
      </p>
    </div>
  );
}

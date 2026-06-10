import Link from 'next/link';

interface LabsBreadcrumbProps {
  page: string;
}

export function LabsBreadcrumb({ page }: LabsBreadcrumbProps) {
  return (
    <div className="flex items-center gap-1.5 px-5 sm:px-8 pt-5 pb-1 max-w-6xl mx-auto">
      <Link
        href="/labs"
        className="text-[11px] font-mono text-white/30 hover:text-[#4FACFF]/80 transition-colors"
      >
        Labs
      </Link>
      <svg width="5" height="9" viewBox="0 0 5 9" fill="none" aria-hidden className="opacity-20">
        <path d="M1 1l3 3.5L1 8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-[11px] font-mono text-white/45">{page}</span>
    </div>
  );
}

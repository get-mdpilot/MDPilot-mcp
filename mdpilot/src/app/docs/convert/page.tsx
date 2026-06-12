import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Convert mode — MDPilot docs',
  description:
    'How to use MDPilot Convert mode: drop any file (PDF, DOCX, PPTX, XLSX, HTML, CSV, images, and more) and get clean, structured markdown via MarkItDown.',
};

const SUPPORTED = ['.pdf', '.docx', '.pptx', '.xlsx', '.csv', '.html', '.htm', '.txt', '.rtf', '.md', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.json', '.xml', '.zip', '.epub'];

export default function ConvertDocsPage() {
  return (
    <div className="max-w-2xl">

      <div className="mb-8">
        <div className="section-label mb-4 w-fit">Labs</div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-3 leading-tight">
          Convert mode
        </h1>
        <p className="text-[var(--md-text-secondary)] text-[15px] leading-relaxed">
          Drop any file and get clean, structured markdown. Uses Microsoft MarkItDown under the hood —
          tables, headings, and lists are preserved.
        </p>
      </div>

      {/* When to use */}
      <div className="mb-8 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
        <h2 className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-2">When to use it</h2>
        <ul className="space-y-1.5">
          {[
            'Convert a PDF spec or design doc into markdown to paste into your AI agent',
            'Turn a spreadsheet (XLSX/CSV) into a markdown table for a prompt',
            'Convert a PPTX deck into structured text for summarisation',
            'Extract text from an HTML page into clean markdown',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--md-accent)]/60 mt-2 shrink-0" />
              <span className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* How to */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-4">How to use it</h2>
        <div className="space-y-3">
          {[
            { n: '1', title: 'Drop or pick a file', desc: 'Drag a file onto the drop zone or click to browse. Any supported format works — see the list below.' },
            { n: '2', title: 'Convert', desc: 'MDPilot sends the file to MarkItDown on the server and returns the markdown. For most files this takes under 5 seconds.' },
            { n: '3', title: 'Copy, download, or pipe to Task/Generate', desc: 'Use the output directly, or click "Use in Task mode" / "Use in Generate mode" to pipe the converted text into the next step.' },
          ].map(step => (
            <div key={step.n} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--md-accent)]/10 border border-[var(--md-accent)]/18 flex items-center justify-center text-[10px] font-mono font-bold text-[var(--md-accent)]/80 mt-0.5">
                {step.n}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-0.5">{step.title}</p>
                <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supported formats */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Supported formats</h2>
        <div className="flex flex-wrap gap-1.5">
          {SUPPORTED.map(f => (
            <code key={f} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--md-surface-2)] border border-[var(--md-border)] text-[var(--md-text-tertiary)]">
              {f}
            </code>
          ))}
        </div>
      </div>

      {/* Setup note */}
      <div className="mb-6 p-4 rounded-xl border border-[var(--md-accent)]/[0.18] bg-[var(--md-accent)]/[0.03]">
        <h3 className="text-[13px] font-semibold text-[var(--md-accent)]/70 mb-2">Server setup required</h3>
        <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed mb-2">
          Convert mode requires the <strong className="text-[var(--md-text-secondary)]">MarkItDown CLI</strong> installed on the server
          (not via npm). If it&apos;s not installed, Convert mode shows a setup banner with instructions.
        </p>
        <div className="rounded-lg bg-[var(--md-bg)] border border-[var(--md-border)] px-3 py-2 font-mono text-[11.5px] text-[var(--md-text-secondary)]">
          pipx install &apos;markitdown[all]&apos;
        </div>
        <p className="text-[11px] text-[var(--md-text-tertiary)] mt-2">
          Requires Python and pipx. Not available on Vercel Edge — uses the Node.js runtime.
        </p>
      </div>

      {/* Caveats */}
      <div className="mb-6 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
        <h3 className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-2">Caveats</h3>
        <ul className="space-y-1.5">
          {[
            'Scanned PDFs (no text layer) won\'t extract well — MarkItDown needs selectable text',
            'Complex multi-column layouts may be simplified or reordered',
            'Images within documents are not extracted as image files',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--md-text-tertiary)] mt-2 shrink-0" />
              <span className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6 border-t border-[var(--md-border)] flex items-center gap-4">
        <Link href="/docs/explain" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          ← Explain mode
        </Link>
        <Link href="/docs/image-to-prompt" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          Image → Prompt →
        </Link>
      </div>

    </div>
  );
}

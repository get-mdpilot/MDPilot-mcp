import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Image → Prompt — MDPilot docs',
  description:
    'How to use MDPilot Image → Prompt: upload any image and get a detailed recreation prompt for FLUX, Stable Diffusion, Midjourney, DALL-E, and Gemini — plus a negative prompt and tag list.',
};

const OUTPUTS = [
  { label: 'FLUX', desc: 'Detailed scene description optimised for FLUX\'s natural-language style.' },
  { label: 'Stable Diffusion', desc: 'Comma-separated prompt with style keywords and quality tags typical for SD.' },
  { label: 'Midjourney', desc: 'Natural-language prompt with --style and --ar parameters.' },
  { label: 'DALL-E', desc: 'Descriptive prompt following OpenAI\'s content and style guidance.' },
  { label: 'Gemini', desc: 'Structured prompt formatted for Gemini Imagen.' },
];

const ANALYSIS_FIELDS = ['Subject', 'Composition', 'Lighting', 'Colors', 'Style', 'Camera', 'Medium', 'Mood', 'Technical', 'Text elements', 'Saturation', 'Contrast'];

export default function ImageToPromptDocsPage() {
  return (
    <div className="max-w-2xl">

      <div className="mb-8">
        <div className="section-label mb-4 w-fit">Labs</div>
        <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-3 leading-tight">
          Image → Prompt
        </h1>
        <p className="text-[var(--md-text-secondary)] text-[15px] leading-relaxed">
          Upload any image and get a detailed recreation prompt formatted for five different image
          generation tools, plus a negative prompt and a tag list.
        </p>
      </div>

      {/* When to use */}
      <div className="mb-8 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)]">
        <h2 className="text-[13px] font-semibold text-[var(--md-text-secondary)] mb-2">When to use it</h2>
        <ul className="space-y-1.5">
          {[
            'Recreate a visual style or scene you\'ve seen and want to reproduce',
            'Understand why an image generation prompt produces a specific look',
            'Get a starting prompt for similar images without writing from scratch',
            'Extract structured visual attributes (lighting, composition, medium) from a reference image',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--md-info)]/60 mt-2 shrink-0" />
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
            { n: '1', title: 'Upload an image', desc: 'Click to upload or drag and drop. Supported: JPEG, PNG, GIF, WebP. The image is analysed by a vision model (Gemini or Groq Llama 4 Scout depending on which key you have configured).' },
            { n: '2', title: 'Review the analysis', desc: 'The tool breaks the image down into structured attributes — subject, composition, lighting, colors, style, camera, medium, mood, and more. Review these before copying the prompts.' },
            { n: '3', title: 'Copy the prompt for your target tool', desc: 'Switch between tabs for FLUX, Stable Diffusion, Midjourney, DALL-E, and Gemini. Each is formatted for that specific tool\'s prompt conventions. The negative prompt and tag list are in separate sections.' },
          ].map(step => (
            <div key={step.n} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--md-info)]/10 border border-[var(--md-info)]/18 flex items-center justify-center text-[10px] font-mono font-bold text-[var(--md-info)]/80 mt-0.5">
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

      {/* Output formats */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Output formats</h2>
        <div className="space-y-2">
          {OUTPUTS.map(o => (
            <div key={o.label} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--md-border)] bg-[var(--md-surface)]">
              <code className="text-[11px] font-mono font-bold text-[var(--md-info)]/65 shrink-0 mt-0.5 w-28">{o.label}</code>
              <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">{o.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-[var(--md-text-tertiary)] mt-2">
          A negative prompt and a flat tag list are also generated — useful for style-mixing and LoRA workflows.
        </p>
      </div>

      {/* Analysis fields */}
      <div className="mb-8">
        <h2 className="text-[15px] font-semibold text-[var(--md-text)] mb-3">Analysis attributes</h2>
        <div className="flex flex-wrap gap-1.5">
          {ANALYSIS_FIELDS.map(f => (
            <span key={f} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--md-surface-2)] border border-[var(--md-border)] text-[var(--md-text-tertiary)]">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* MCP */}
      <div className="p-4 rounded-xl border border-[var(--md-go)]/[0.15] bg-[var(--md-go)]/[0.03] mb-6">
        <p className="text-[12px] text-[var(--md-text-tertiary)] leading-relaxed">
          <span className="text-[var(--md-go)]/70 font-semibold">Via MCP:</span> Use the{' '}
          <code className="text-[11px] font-mono bg-[var(--md-surface-2)] px-1 rounded text-[var(--md-text-secondary)]">image_to_prompt</code> tool
          and pass a local image path. The server reads the file directly — no upload needed.{' '}
          <Link href="/docs/mcp" className="text-[var(--md-accent)]/60 hover:text-[var(--md-accent)] transition-colors">MCP setup →</Link>
        </p>
      </div>

      <div className="pt-6 border-t border-[var(--md-border)] flex items-center gap-4">
        <Link href="/docs/convert" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          ← Convert mode
        </Link>
        <Link href="/docs/interview-primer" className="text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors">
          Interview primer →
        </Link>
      </div>

    </div>
  );
}

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getAllSeoPages, getSeoPage, SEO_STACKS, type SeoContent } from '@/lib/seo-matrix';
import { CopyButton } from '@/components/CopyButton';

// ── Static generation ─────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllSeoPages().map(p => ({
    fileType: p.fileTypeSlug,
    stack:    p.stackSlug,
  }));
}

// ── Load pre-generated content ────────────────────────────────────────────────

function loadContent(fileType: string, stack: string): SeoContent | null {
  try {
    const raw = readFileSync(
      join(process.cwd(), 'src/content/seo', `${fileType}-${stack}.json`),
      'utf-8',
    );
    return JSON.parse(raw) as SeoContent;
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ fileType: string; stack: string }> },
): Promise<Metadata> {
  const { fileType, stack } = await params;
  const page = getSeoPage(fileType, stack);
  if (!page) return {};
  const { fileType: ft, stack: st } = page;

  const title = `${ft.name} for ${st.name} — Example & Generator | MDPilot`;
  const description = `A complete ${ft.name} example for ${st.name} projects, plus a free generator. ${ft.intent} done right, token-optimized for AI coding agents.`;
  const url = `https://mdpilot.in/${fileType}/for/${stack}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'MDPilot', type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
    keywords: [
      `${ft.name} ${st.name}`,
      `${ft.name} example`,
      `${st.name} ${ft.intent}`,
      `${st.name} AI agent instructions`,
      'AI instruction file generator',
      'MDPilot',
    ],
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SeoPage(
  { params }: { params: Promise<{ fileType: string; stack: string }> },
) {
  const { fileType, stack } = await params;
  const page = getSeoPage(fileType, stack);
  if (!page) notFound();

  const content = loadContent(fileType, stack);
  if (!content) notFound();

  const { fileType: ft, stack: st } = page;

  // Related pages: same file type, different stacks (up to 6)
  const related = SEO_STACKS
    .filter(s => s.slug !== stack)
    .slice(0, 6);

  // JSON-LD: TechArticle + FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: `${ft.name} for ${st.name}`,
        description: `Complete ${ft.name} example and generator for ${st.name} projects. ${ft.intent}.`,
        author: { '@type': 'Organization', name: 'MDPilot', url: 'https://mdpilot.in' },
        publisher: { '@type': 'Organization', name: 'MDPilot', url: 'https://mdpilot.in' },
        datePublished: content.generatedAt.slice(0, 10),
        dateModified: content.generatedAt.slice(0, 10),
        url: `https://mdpilot.in/${fileType}/for/${stack}`,
        about: { '@type': 'SoftwareApplication', name: st.name, applicationCategory: 'DeveloperApplication' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: content.faqItems.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };

  return (
    <>
      {/* Structured data — in raw HTML, visible before any JS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="seo-article">

        {/* ── Hero ── */}
        <header className="seo-hero">
          <p className="seo-breadcrumb">
            <a href="/">MDPilot</a>
            <span aria-hidden="true"> › </span>
            <a href={`/${fileType}/for/nextjs`}>{ft.name}</a>
            <span aria-hidden="true"> › </span>
            {st.name}
          </p>
          <h1>{ft.name} for {st.name}</h1>
          <p className="seo-lead">
            A complete, production-ready {ft.name} example for {st.name} projects —
            token-optimized to {content.tokenCount} tokens, ready to drop into your repo.
            Plus a free generator that tailors it to your exact stack in 3 questions.
          </p>
        </header>

        {/* ── What is it ── */}
        <section className="seo-section">
          <h2>What is {ft.name}?</h2>
          <p>{ft.description}</p>
        </section>

        {/* ── The example — core value, visible without JS ── */}
        <section className="seo-section">
          <h2>{ft.name} example for {st.name}</h2>
          <p>
            Here is a complete {ft.name} for a {st.name} project, optimized
            to {content.tokenCount} tokens using MDPilot&apos;s 5-pass optimizer:
          </p>
          <div className="seo-code-wrapper">
            <div className="seo-code-header">
              <span>{ft.name}</span>
              {/* CopyButton: progressive enhancement — page is fully readable without it */}
              <CopyButton text={content.example} />
            </div>
            <pre className="seo-pre"><code>{content.example}</code></pre>
          </div>
        </section>

        {/* ── Why this stack needs this file — unique per page ── */}
        <section className="seo-section">
          <h2>Why {st.name} projects need {ft.name}</h2>
          <p>{content.whySection}</p>
        </section>

        {/* ── CTA — real <a> link, works without JS ── */}
        <section className="seo-cta">
          <h2>Generate your own {ft.name} for {st.name}</h2>
          <p>
            Answer 3 questions about your project and MDPilot generates a{' '}
            {ft.name} grounded in your exact stack — real commands, real paths,
            no hallucinated scripts.
          </p>
          <a
            href={`/generate?stack=${stack}&file=${fileType}`}
            className="seo-cta-btn"
          >
            Generate {ft.name} free →
          </a>
        </section>

        {/* ── FAQ — matches JSON-LD, unique per page ── */}
        <section className="seo-section">
          <h2>Frequently asked questions</h2>
          {content.faqItems.map((item, i) => (
            <div key={i} className="seo-faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </section>

        {/* ── Related pages — crawlable internal links ── */}
        <nav aria-label="Related pages" className="seo-related">
          <h2>{ft.name} for other stacks</h2>
          <ul>
            {related.map(s => (
              <li key={s.slug}>
                <a href={`/${fileType}/for/${s.slug}`}>
                  {ft.name} for {s.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

      </article>
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { posts, type BlogBlock } from '@/content/blog/posts';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find(p => p.slug === slug);
  if (!post) return { title: 'Post not found — MDPilot' };
  return {
    title: `${post.title} — MDPilot`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      url: `https://mdpilot.in/blog/${post.slug}`,
      images: [{ url: `https://mdpilot.in${post.hero}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [`https://mdpilot.in${post.hero}`],
    },
  };
}

/* Inline formatter — supports `code` spans and **bold**. */
function inline(text: string): React.ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="font-mono text-[0.92em] text-[var(--md-accent)]/90 bg-[var(--md-surface-2)] border border-[var(--md-border)] px-1.5 py-0.5 rounded-[5px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[var(--md-text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 className="font-display text-[1.45rem] font-semibold text-[var(--md-text)] tracking-[-0.01em] mt-12 mb-4 leading-snug">
          {block.text}
        </h2>
      );
    case 'p':
      return (
        <p className="text-[15px] text-[var(--md-text-secondary)] leading-[1.75] mb-5">
          {inline(block.text)}
        </p>
      );
    case 'list':
      return (
        <ul className="space-y-2.5 mb-6 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] text-[var(--md-text-secondary)] leading-[1.7]">
              <span className="shrink-0 mt-[11px] w-[5px] h-[5px] rounded-full bg-[var(--md-accent)]/60" aria-hidden />
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <pre className="mb-6 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] overflow-x-auto">
          <code className="font-mono text-[12.5px] leading-[1.7] text-[var(--md-text-secondary)] whitespace-pre">
            {block.code}
          </code>
        </pre>
      );
    case 'image':
      return (
        <figure className="my-8">
          <img
            src={block.src}
            alt={block.alt}
            width={1200}
            height={630}
            loading="lazy"
            className="w-full rounded-xl border border-[var(--md-border)]"
          />
          {block.caption && (
            <figcaption className="mt-3 text-center text-[11px] font-mono text-[var(--md-text-tertiary)] tracking-wide">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'callout':
      return (
        <aside className="mb-6 px-5 py-4 rounded-xl border border-[var(--md-accent)]/20 bg-[var(--md-accent)]/[0.05] border-l-2 border-l-[var(--md-accent)]/70">
          <p className="text-[14px] text-[var(--md-text-secondary)] leading-[1.7]">{inline(block.text)}</p>
        </aside>
      );
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find(p => p.slug === slug);
  if (!post) notFound();

  const others = posts.filter(p => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--md-dark)]">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-20">

        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[12px] font-mono text-[var(--md-text-tertiary)] hover:text-[var(--md-text-secondary)] transition-colors mb-10"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Logbook
        </Link>

        {/* Meta */}
        <div className="mb-8">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-[var(--md-accent)]/80 bg-[var(--md-accent)]/[0.07] border border-[var(--md-accent)]/[0.15] px-2 py-0.5 rounded-[5px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-[12px] font-mono text-[var(--md-text-tertiary)]">
            <time>{post.date}</time>
            <span>·</span>
            <span>{post.readingTime}</span>
            <span>·</span>
            <span>{post.author}</span>
          </div>
        </div>

        {/* Hero */}
        <img
          src={post.hero}
          alt={post.title}
          width={1200}
          height={630}
          className="w-full rounded-xl border border-[var(--md-border)] mb-10"
        />

        {/* Body */}
        <article>
          {post.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </article>

        {/* More posts */}
        {others.length > 0 && (
          <div className="mt-14 pt-8 border-t border-[var(--md-border)]">
            <p className="text-[11px] font-mono text-[var(--md-text-tertiary)] uppercase tracking-wider mb-4">
              More from the Logbook
            </p>
            <div className="space-y-2">
              {others.map(p => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] hover:bg-[var(--md-surface-2)] transition-all duration-150"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--md-text-secondary)] group-hover:text-[var(--md-text)] transition-colors mb-0.5 leading-snug">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-[var(--md-text-tertiary)] line-clamp-1">{p.description}</p>
                  </div>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    className="text-[var(--md-text-tertiary)] group-hover:text-[var(--md-text-secondary)] transition-colors shrink-0" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { posts } from '@/content/blog/posts';

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
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find(p => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[var(--md-dark)]">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-20">

        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[12px] font-mono text-white/25 hover:text-white/50 transition-colors mb-10"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Blog
        </Link>

        {/* Meta */}
        <div className="mb-8">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-[#4FACFF]/50 bg-[#4FACFF]/[0.07] border border-[#4FACFF]/[0.15] px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-black text-white tracking-[-0.04em] mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-[12px] font-mono text-white/30">
            <time>{post.date}</time>
            <span className="text-white/15">·</span>
            <span>{post.readingTime}</span>
            <span className="text-white/15">·</span>
            <span>{post.author}</span>
          </div>
        </div>

        {/* Content placeholder — replace with MDX or typed content per post */}
        <div className="prose-placeholder py-16 text-center border border-white/[0.06] rounded-xl bg-white/[0.01]">
          <p className="text-[13px] font-mono text-white/20">content coming soon</p>
        </div>

      </div>
    </div>
  );
}

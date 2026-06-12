import type { Metadata } from 'next';
import Link from 'next/link';
import { posts } from '@/content/blog/posts';

export const metadata: Metadata = {
  title: 'Blog — MDPilot',
  description:
    'Writing on AI-native development, markdown craft, agent context files, and the tools that help AI agents do their best work.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[var(--md-dark)]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20">

        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-4 mb-5">
            <img src="/mdpilot-logo.webp" alt="MDPilot" width={52} height={52} className="w-13 h-13 object-contain" />
            <div className="section-label w-fit">Blog</div>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold text-[var(--md-text)] tracking-[-0.015em] mb-4 leading-tight">
            Writing
          </h1>
          <p className="text-[var(--md-text-secondary)] text-[15px] leading-relaxed max-w-md">
            On AI-native development, context files, markdown craft, and the small decisions
            that make AI agents dramatically more useful.
          </p>
        </div>

        {/* Post list or empty state */}
        {posts.length === 0 ? (
          <div className="py-20 text-center border border-[var(--md-border)] rounded-2xl bg-[var(--md-surface)]">
            <p className="text-[13px] font-mono text-[var(--md-text-tertiary)] mb-3">no posts yet</p>
            <p className="text-[var(--md-text-secondary)] text-[14px] max-w-sm mx-auto leading-relaxed">
              First posts are in draft. Check back soon — or{' '}
              <a
                href="https://github.com/get-mdpilot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--md-accent)]/60 hover:text-[var(--md-accent)] transition-colors"
              >
                follow on GitHub
              </a>{' '}
              for updates.
            </p>
          </div>
        ) : (
          <ul className="space-y-6">
            {posts.map((post, i) => {
              const reversed = i % 2 === 1;
              return (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={`group flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} rounded-2xl border border-[var(--md-border)] bg-[var(--md-surface)] hover:bg-[var(--md-surface-2)] overflow-hidden transition-all duration-150 hover:-translate-y-px`}
                  >
                    {/* Artwork half */}
                    <div className={`md:w-1/2 shrink-0 bg-[var(--md-bg)] ${reversed ? 'md:border-l' : 'md:border-r'} border-b md:border-b-0 border-[var(--md-border)]`}>
                      <img
                        src={post.hero}
                        alt=""
                        width={1200}
                        height={630}
                        loading="lazy"
                        aria-hidden
                        className="w-full h-full aspect-[1200/630] object-cover"
                      />
                    </div>

                    {/* Content half */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center p-6 sm:p-8">
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
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
                      <p className="font-display text-[18px] sm:text-[20px] font-semibold text-[var(--md-text)] group-hover:text-[var(--md-accent)] transition-colors mb-2 leading-snug tracking-[-0.01em]">
                        {post.title}
                      </p>
                      <p className="text-[13px] text-[var(--md-text-secondary)] leading-relaxed line-clamp-3 mb-4">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-2.5 text-[11px] font-mono text-[var(--md-text-tertiary)]">
                        <time>{post.date}</time>
                        <span>·</span>
                        <span>{post.readingTime}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

      </div>
    </div>
  );
}

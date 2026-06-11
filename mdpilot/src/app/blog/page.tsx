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
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">

        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-4 mb-5">
            <img src="/mdpilot-logo.svg" alt="MDPilot" width={52} height={52} className="w-13 h-13 object-contain drop-shadow-[0_0_10px_rgba(79,172,255,0.28)]" />
            <div className="section-label w-fit">Blog</div>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-black text-white tracking-[-0.04em] mb-4 leading-tight">
            Writing
          </h1>
          <p className="text-white/40 text-[15px] leading-relaxed max-w-md">
            On AI-native development, context files, markdown craft, and the small decisions
            that make AI agents dramatically more useful.
          </p>
        </div>

        {/* Post list or empty state */}
        {posts.length === 0 ? (
          <div className="py-20 text-center border border-white/[0.06] rounded-2xl bg-white/[0.01]">
            <p className="text-[13px] font-mono text-white/20 mb-3">no posts yet</p>
            <p className="text-white/35 text-[14px] max-w-sm mx-auto leading-relaxed">
              First posts are in draft. Check back soon — or{' '}
              <a
                href="https://github.com/get-mdpilot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4FACFF]/60 hover:text-[#4FACFF] transition-colors"
              >
                follow on GitHub
              </a>{' '}
              for updates.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {posts.map(post => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-6 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.09] transition-all duration-150"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white/80 group-hover:text-white transition-colors mb-1 leading-snug">
                      {post.title}
                    </p>
                    <p className="text-[12px] text-white/35 leading-relaxed line-clamp-2">
                      {post.description}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono text-white/25 bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <time className="text-[11px] font-mono text-white/25">{post.date}</time>
                    <p className="text-[10px] font-mono text-white/18 mt-0.5">{post.readingTime}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
}

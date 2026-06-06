import type { MetadataRoute } from 'next';
import { getAllSeoPages } from '@/lib/seo-matrix';

const BASE = 'https://mdpilot.in';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: now, priority: 1.0, changeFrequency: 'weekly' },
    { url: `${BASE}/generate`,    lastModified: now, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE}/task`,        lastModified: now, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/convert`,     lastModified: now, priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/privacy`,     lastModified: now, priority: 0.3, changeFrequency: 'yearly' },
  ];

  const seoPages: MetadataRoute.Sitemap = getAllSeoPages().map(p => ({
    url: `${BASE}/${p.fileTypeSlug}/for/${p.stackSlug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...seoPages];
}

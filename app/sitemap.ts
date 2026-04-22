import type { MetadataRoute } from 'next'
import { getAbsoluteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: getAbsoluteUrl('/login'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: getAbsoluteUrl('/register'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]
}

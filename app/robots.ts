import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/features', '/about', '/login', '/register'],
        disallow: [
          '/api/',
          '/dashboard',
          '/income',
          '/categories',
          '/budgets',
          '/family',
          '/onboarding',
          '/auth/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/features', '/about', '/login', '/register'],
        disallow: [
          '/api/',
          '/dashboard',
          '/income',
          '/categories',
          '/budgets',
          '/family',
          '/onboarding',
          '/auth/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}

import { content } from '@/lib/content'
import { getAbsoluteUrl, getSiteUrl } from '@/lib/seo'

export function StructuredData() {
  const siteUrl = getSiteUrl()
  const featureList = [
    'Master budget templates for recurring planning',
    'Monthly budget snapshots with copy workflow',
    'Monthly income planning and copy support',
    'Family member allocation and ownership views',
    'Dashboard coverage and category insights',
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: content.meta.title,
        url: siteUrl,
        logo: getAbsoluteUrl('/icon.png'),
      },
      {
        '@type': 'WebSite',
        name: content.meta.title,
        url: siteUrl,
        description: content.meta.description,
        inLanguage: 'en-US',
      },
      {
        '@type': 'WebPage',
        name: 'DoomSaver',
        url: getAbsoluteUrl('/'),
        description: content.meta.description,
        isPartOf: {
          '@type': 'WebSite',
          url: siteUrl,
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: content.meta.title,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        description: content.meta.description,
        url: siteUrl,
        featureList,
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        screenshot: [getAbsoluteUrl('/opengraph-image')],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

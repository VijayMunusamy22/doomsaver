import { content } from '@/lib/content'
import { getAbsoluteUrl, getSiteUrl } from '@/lib/seo'

export function StructuredData() {
  const siteUrl = getSiteUrl()

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
      },
      {
        '@type': 'SoftwareApplication',
        name: content.meta.title,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        description: content.meta.description,
        url: siteUrl,
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

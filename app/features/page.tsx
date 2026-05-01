import type { Metadata } from 'next'
import Link from 'next/link'
import { content } from '@/lib/content'
import { getAbsoluteUrl } from '@/lib/seo'
import { BrandLogo } from '@/components/brand/brand-logo'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: `${content.featuresPage.title} | ${content.meta.title}`,
  description: content.featuresPage.subtitle,
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    type: 'website',
    url: getAbsoluteUrl('/features'),
    title: `${content.featuresPage.title} | ${content.meta.title}`,
    description: content.featuresPage.subtitle,
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${content.featuresPage.title} | ${content.meta.title}`,
    description: content.featuresPage.subtitle,
    images: ['/twitter-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

function Section({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <article className="glass-card p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map(item => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function FeaturesPage() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 page-enter">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        <header className="glass-card px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <BrandLogo compact withTagline={false} />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg border border-border/55 bg-white/55 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/72 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {content.landing.ctaSecondary}
            </Link>
          </div>
        </header>

        <section className="glass-card p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {content.featuresPage.title}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-3xl">
            {content.featuresPage.subtitle}
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <Section
            title={content.featuresPage.sections.planningTitle}
            items={[
              content.featuresPage.sections.planningItems.one,
              content.featuresPage.sections.planningItems.two,
              content.featuresPage.sections.planningItems.three,
            ]}
          />
          <Section
            title={content.featuresPage.sections.incomeTitle}
            items={[
              content.featuresPage.sections.incomeItems.one,
              content.featuresPage.sections.incomeItems.two,
              content.featuresPage.sections.incomeItems.three,
            ]}
          />
          <Section
            title={content.featuresPage.sections.dashboardTitle}
            items={[
              content.featuresPage.sections.dashboardItems.one,
              content.featuresPage.sections.dashboardItems.two,
              content.featuresPage.sections.dashboardItems.three,
            ]}
          />
        </section>

        <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{content.featuresPage.ctaTitle}</h2>
            <p className="text-sm text-muted-foreground mt-1">{content.featuresPage.ctaBody}</p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {content.landing.ctaSecondary}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </main>
  )
}

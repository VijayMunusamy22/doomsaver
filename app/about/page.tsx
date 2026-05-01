import type { Metadata } from 'next'
import Link from 'next/link'
import { content } from '@/lib/content'
import { getAbsoluteUrl } from '@/lib/seo'
import { BrandLogo } from '@/components/brand/brand-logo'
import { ArrowRight, Target, Repeat2, Handshake } from 'lucide-react'

export const metadata: Metadata = {
  title: `${content.aboutPage.title} | ${content.meta.title}`,
  description: content.aboutPage.subtitle,
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    type: 'website',
    url: getAbsoluteUrl('/about'),
    title: `${content.aboutPage.title} | ${content.meta.title}`,
    description: content.aboutPage.subtitle,
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${content.aboutPage.title} | ${content.meta.title}`,
    description: content.aboutPage.subtitle,
    images: ['/twitter-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

function Principle({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <article className="glass-soft rounded-xl p-4">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground mt-2">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{body}</p>
    </article>
  )
}

export default function AboutPage() {
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
              href="/features"
              className="inline-flex items-center rounded-lg border border-border/55 bg-white/55 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/72 transition-colors"
            >
              Features
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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{content.aboutPage.title}</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-3xl">
            {content.aboutPage.subtitle}
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <article className="glass-card p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-foreground">{content.aboutPage.missionTitle}</h2>
            <p className="text-sm text-muted-foreground mt-2">{content.aboutPage.missionBody}</p>
          </article>
          <article className="glass-card p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-foreground">{content.aboutPage.whoTitle}</h2>
            <p className="text-sm text-muted-foreground mt-2">{content.aboutPage.whoBody}</p>
          </article>
        </section>

        <section className="glass-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-foreground">{content.aboutPage.principlesTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <Principle
              icon={<Target className="h-4 w-4" />}
              title={content.aboutPage.principles.oneTitle}
              body={content.aboutPage.principles.oneBody}
            />
            <Principle
              icon={<Repeat2 className="h-4 w-4" />}
              title={content.aboutPage.principles.twoTitle}
              body={content.aboutPage.principles.twoBody}
            />
            <Principle
              icon={<Handshake className="h-4 w-4" />}
              title={content.aboutPage.principles.threeTitle}
              body={content.aboutPage.principles.threeBody}
            />
          </div>
        </section>

        <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">{content.aboutPage.ctaTitle}</h2>
            <p className="text-sm text-muted-foreground mt-1">{content.aboutPage.ctaBody}</p>
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

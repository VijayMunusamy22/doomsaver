import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand/brand-logo'
import { content } from '@/lib/content'
import {
  ArrowRight,
  UsersRound,
  LayoutDashboard,
  Wallet,
  FolderKanban,
  BarChart3,
  CopyPlus,
} from 'lucide-react'
import { getAbsoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'DoomSaver | Family Budget Planner',
  description: content.meta.description,
  keywords: [
    'family budget planner',
    'household budgeting app',
    'monthly budget tracker',
    'income planning for families',
    'shared budget app',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: getAbsoluteUrl('/'),
    title: 'DoomSaver | Family Budget Planner',
    description: content.meta.description,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'DoomSaver landing page preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DoomSaver | Family Budget Planner',
    description: content.meta.description,
    images: ['/twitter-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  if (session) {
    if (!session.user.familyId) redirect('/onboarding')
    redirect('/dashboard')
  }

  return (
    <main className="relative min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 page-enter overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 -right-20 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-white/35 blur-3xl" />

      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8 relative">
        <header className="glass-card px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <BrandLogo compact withTagline={false} />
          <div className="flex items-center gap-2">
            <Link
              href="/features"
              className="hidden sm:inline-flex items-center justify-center rounded-lg border border-border/45 bg-white/35 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/62 transition-colors"
            >
              {content.landing.topLinks.features}
            </Link>
            <Link
              href="/about"
              className="hidden sm:inline-flex items-center justify-center rounded-lg border border-border/45 bg-white/35 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/62 transition-colors"
            >
              {content.landing.topLinks.about}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border/55 bg-white/50 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/70 transition-colors"
            >
              {content.landing.ctaPrimary}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.32)] hover:bg-primary/90 transition-colors"
            >
              {content.landing.ctaSecondary}
            </Link>
          </div>
        </header>

        <section className="glass-card p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-10">
          <div>
            <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-primary">
              {content.landing.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight max-w-4xl">
              {content.landing.title}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-3xl">
              {content.landing.subtitle}
            </p>
            <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.34)] hover:bg-primary/90 transition-colors"
              >
                {content.landing.ctaSecondary}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-border/55 bg-white/55 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/72 transition-colors"
              >
                {content.landing.ctaPrimary}
              </Link>
              <a
                href="/features"
                className="inline-flex items-center rounded-lg border border-border/45 bg-white/40 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/62 transition-colors"
              >
                {content.landing.ctaTertiary}
              </a>
            </div>
          </div>

          <div className="glass-soft rounded-2xl p-4 sm:p-5">
            <HeroGraphic />
          </div>
        </section>

        <section className="glass-card p-5 sm:p-6 lg:p-7 space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              {content.landing.factsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {content.landing.factsSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <FactCard
              value={content.landing.factsItems.layersValue}
              title={content.landing.factsItems.layersTitle}
              body={content.landing.factsItems.layersBody}
            />
            <FactCard
              value={content.landing.factsItems.copyValue}
              title={content.landing.factsItems.copyTitle}
              body={content.landing.factsItems.copyBody}
            />
            <FactCard
              value={content.landing.factsItems.workspacesValue}
              title={content.landing.factsItems.workspacesTitle}
              body={content.landing.factsItems.workspacesBody}
            />
            <FactCard
              value={content.landing.factsItems.sharedValue}
              title={content.landing.factsItems.sharedTitle}
              body={content.landing.factsItems.sharedBody}
            />
          </div>
        </section>

        <section id="features" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <div className="glass-card p-5 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              {content.landing.featureUsageTitle}
            </h2>
            <div className="space-y-3">
              <article className="glass-soft rounded-xl p-3.5">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <UsersRound className="h-3.5 w-3.5" />
                </div>
                <p className="font-semibold text-sm text-foreground">
                  {content.landing.usageItems.step1Title}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {content.landing.usageItems.step1Body}
                </p>
              </article>
              <article className="glass-soft rounded-xl p-3.5">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <FolderKanban className="h-3.5 w-3.5" />
                </div>
                <p className="font-semibold text-sm text-foreground">
                  {content.landing.usageItems.step2Title}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {content.landing.usageItems.step2Body}
                </p>
              </article>
              <article className="glass-soft rounded-xl p-3.5">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CopyPlus className="h-3.5 w-3.5" />
                </div>
                <p className="font-semibold text-sm text-foreground">
                  {content.landing.usageItems.step3Title}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {content.landing.usageItems.step3Body}
                </p>
              </article>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-5 sm:p-6 space-y-2">
              <p className="text-xs tracking-[0.12em] uppercase text-primary font-semibold">
                {content.landing.featureShowcaseTitle}
              </p>
              <p className="text-sm text-muted-foreground">
                {content.landing.featureShowcaseSubtitle}
              </p>
              <div className="glass-soft rounded-xl p-3.5">
                <MiniBoardGraphic />
              </div>
            </div>

            <div className="glass-card p-5 sm:p-6">
              <p className="text-sm font-semibold text-foreground">{content.landing.mottoTitle}</p>
              <p className="text-base sm:text-lg text-muted-foreground mt-2">{content.landing.motto}</p>
            </div>

            <div className="glass-card p-5 sm:p-6 space-y-3.5">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {content.landing.benefitsTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <article className="glass-soft rounded-xl p-3">
                  <LayoutDashboard className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold mt-2">{content.landing.benefitsItems.onePlanTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {content.landing.benefitsItems.onePlanBody}
                  </p>
                </article>
                <article className="glass-soft rounded-xl p-3">
                  <Wallet className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold mt-2">
                    {content.landing.benefitsItems.monthlyRhythmTitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {content.landing.benefitsItems.monthlyRhythmBody}
                  </p>
                </article>
                <article className="glass-soft rounded-xl p-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold mt-2">
                    {content.landing.benefitsItems.balancedDecisionsTitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {content.landing.benefitsItems.balancedDecisionsBody}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card p-6 sm:p-8 lg:p-9">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                {content.landing.finalCtaTitle}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
                {content.landing.finalCtaBody}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.34)] hover:bg-primary/90 transition-colors"
              >
                {content.landing.ctaSecondary}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-border/55 bg-white/55 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/72 transition-colors"
              >
                {content.landing.ctaPrimary}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function FactCard({ value, title, body }: { value: string; title: string; body: string }) {
  return (
    <article className="glass-soft rounded-xl p-3.5">
      <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-xs sm:text-sm font-semibold text-foreground mt-2">{title}</p>
      <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{body}</p>
    </article>
  )
}

function HeroGraphic() {
  return (
    <div className="rounded-xl border border-white/30 bg-white/44 p-3 sm:p-4">
      <svg viewBox="0 0 520 320" className="w-full h-auto" aria-hidden>
        <defs>
          <linearGradient id="heroRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E8B84B" />
            <stop offset="100%" stopColor="#C9922B" />
          </linearGradient>
          <linearGradient id="heroBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F2D086" />
            <stop offset="100%" stopColor="#C9922B" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="520" height="320" rx="18" fill="rgba(255,255,255,0.56)" />
        <rect x="18" y="18" width="484" height="284" rx="14" fill="rgba(255,255,255,0.45)" />

        <rect x="38" y="40" width="190" height="118" rx="12" fill="rgba(255,255,255,0.7)" />
        <circle cx="92" cy="100" r="34" fill="none" stroke="#E5C170" strokeWidth="10" />
        <circle
          cx="92"
          cy="100"
          r="34"
          fill="none"
          stroke="url(#heroRing)"
          strokeWidth="10"
          strokeDasharray="160 55"
          transform="rotate(-90 92 100)"
        />
        <text x="92" y="106" textAnchor="middle" fontSize="17" fill="#1A1B22" fontWeight="700">
          74%
        </text>
        <rect x="138" y="72" width="70" height="8" rx="4" fill="#E8B84B" />
        <rect x="138" y="90" width="52" height="8" rx="4" fill="#C9922B" />
        <rect x="138" y="108" width="40" height="8" rx="4" fill="#1A1B22" opacity="0.7" />

        <rect x="244" y="40" width="238" height="118" rx="12" fill="rgba(255,255,255,0.7)" />
        <rect x="266" y="126" width="24" height="18" rx="4" fill="url(#heroBar)" />
        <rect x="300" y="105" width="24" height="39" rx="4" fill="url(#heroBar)" />
        <rect x="334" y="86" width="24" height="58" rx="4" fill="url(#heroBar)" />
        <rect x="368" y="66" width="24" height="78" rx="4" fill="url(#heroBar)" />
        <rect x="402" y="95" width="24" height="49" rx="4" fill="url(#heroBar)" />
        <rect x="436" y="78" width="24" height="66" rx="4" fill="#1A1B22" opacity="0.85" />

        <rect x="38" y="176" width="444" height="104" rx="12" fill="rgba(255,255,255,0.66)" />
        <rect x="58" y="195" width="148" height="66" rx="10" fill="rgba(255,255,255,0.86)" />
        <rect x="74" y="210" width="60" height="8" rx="4" fill="#1A1B22" opacity="0.22" />
        <rect x="74" y="226" width="92" height="10" rx="5" fill="#C9922B" />
        <rect x="74" y="244" width="54" height="7" rx="4" fill="#1A1B22" opacity="0.2" />

        <rect x="224" y="195" width="116" height="66" rx="10" fill="rgba(255,255,255,0.86)" />
        <rect x="240" y="210" width="54" height="8" rx="4" fill="#1A1B22" opacity="0.22" />
        <rect x="240" y="226" width="80" height="10" rx="5" fill="#E8B84B" />
        <rect x="240" y="244" width="46" height="7" rx="4" fill="#1A1B22" opacity="0.2" />

        <rect x="356" y="195" width="106" height="66" rx="10" fill="rgba(255,255,255,0.86)" />
        <rect x="372" y="210" width="52" height="8" rx="4" fill="#1A1B22" opacity="0.22" />
        <rect x="372" y="226" width="66" height="10" rx="5" fill="#C9922B" />
        <rect x="372" y="244" width="40" height="7" rx="4" fill="#1A1B22" opacity="0.2" />
      </svg>
    </div>
  )
}

function MiniBoardGraphic() {
  return (
    <svg viewBox="0 0 540 180" className="w-full h-auto" aria-hidden>
      <rect x="0" y="0" width="540" height="180" rx="14" fill="rgba(255,255,255,0.62)" />
      <rect x="16" y="16" width="248" height="148" rx="12" fill="rgba(255,255,255,0.84)" />
      <rect x="30" y="32" width="104" height="10" rx="5" fill="#1A1B22" opacity="0.2" />
      <rect x="30" y="53" width="212" height="8" rx="4" fill="#E8B84B" />
      <rect x="30" y="67" width="188" height="8" rx="4" fill="#C9922B" />
      <rect x="30" y="81" width="162" height="8" rx="4" fill="#1A1B22" opacity="0.28" />
      <rect x="30" y="95" width="196" height="8" rx="4" fill="#E8B84B" />
      <rect x="30" y="109" width="172" height="8" rx="4" fill="#C9922B" />
      <rect x="30" y="123" width="148" height="8" rx="4" fill="#1A1B22" opacity="0.28" />

      <rect x="280" y="16" width="244" height="148" rx="12" fill="rgba(255,255,255,0.84)" />
      <circle cx="354" cy="91" r="50" fill="none" stroke="#E8B84B" strokeWidth="14" />
      <circle
        cx="354"
        cy="91"
        r="50"
        fill="none"
        stroke="#C9922B"
        strokeWidth="14"
        strokeDasharray="206 108"
        transform="rotate(-92 354 91)"
      />
      <text x="354" y="96" textAnchor="middle" fontSize="19" fill="#1A1B22" fontWeight="700">
        Ready
      </text>
      <rect x="428" y="56" width="70" height="10" rx="5" fill="#1A1B22" opacity="0.2" />
      <rect x="428" y="76" width="54" height="8" rx="4" fill="#E8B84B" />
      <rect x="428" y="92" width="62" height="8" rx="4" fill="#C9922B" />
      <rect x="428" y="108" width="47" height="8" rx="4" fill="#1A1B22" opacity="0.26" />
    </svg>
  )
}

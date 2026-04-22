import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { cn } from '@/lib/utils'
import { content } from '@/lib/content'
import { RouteProgress } from '@/components/nav/route-progress'
import { StructuredData } from '@/components/seo/structured-data'
import { getSiteUrl } from '@/lib/seo'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' })
const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: content.meta.title,
    template: `%s | ${content.meta.title}`,
  },
  description: content.meta.description,
  applicationName: content.meta.title,
  authors: [{ name: content.meta.title }],
  creator: content.meta.title,
  publisher: content.meta.title,
  referrer: 'origin-when-cross-origin',
  category: 'personal finance',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'family budget app',
    'budget planner',
    'household expense tracker',
    'income and expense management',
    'shared family finances',
    'DoomSaver',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: content.meta.title,
    title: content.meta.title,
    description: content.meta.description,
    url: siteUrl,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${content.meta.title} preview`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: content.meta.title,
    description: content.meta.description,
    images: ['/twitter-image'],
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/icon.png?v=2', type: 'image/png', sizes: '48x48' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: [{ url: '/apple-icon.png?v=2', sizes: '180x180', type: 'image/png' }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A1B22',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', dmSans.variable, playfair.variable)}>
      <head>
        <meta name="google-site-verification" content="TqT4atSMHLIu6ItqWLDYRrtl1ybuLfdF5rj2XaVpdFQ" />
      </head>
      <body className={dmSans.className}>
        <StructuredData />
        <RouteProgress />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

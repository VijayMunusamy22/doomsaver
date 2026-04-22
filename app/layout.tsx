import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { cn } from '@/lib/utils'
import { content } from '@/lib/content'
import { RouteProgress } from '@/components/nav/route-progress'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' })

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/icon.png?v=2', type: 'image/png', sizes: '48x48' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: [{ url: '/apple-icon.png?v=2', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', dmSans.variable, playfair.variable)}>
      <body className={dmSans.className}>
        <RouteProgress />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

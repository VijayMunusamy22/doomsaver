import type { Metadata } from 'next'
import { content } from '@/lib/content'

export const metadata: Metadata = {
  title: content.auth.login.title,
  description: content.auth.login.subtitle,
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export { default } from '@/app/auth/login/page'

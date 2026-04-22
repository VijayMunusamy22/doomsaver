import type { Metadata } from 'next'
import { content } from '@/lib/content'

export const metadata: Metadata = {
  title: content.auth.register.title,
  description: content.auth.register.subtitle,
  alternates: {
    canonical: '/register',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export { default } from '@/app/auth/register/page'

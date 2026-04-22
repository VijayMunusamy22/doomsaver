import type { Metadata } from 'next'
import { content } from '@/lib/content'

export const metadata: Metadata = {
  title: content.onboarding.title,
  description: content.onboarding.subtitle,
  robots: {
    index: false,
    follow: false,
  },
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children
}

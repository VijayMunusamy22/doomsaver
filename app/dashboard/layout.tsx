import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/nav/sidebar'
import { Suspense } from 'react'
import { DashboardContentLoader } from '@/components/ui/loaders'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (!session.user.familyId) redirect('/onboarding')

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-transparent">
      <Sidebar user={session.user} />
      <main className="min-w-0 flex-1 overflow-y-auto pt-14 lg:pt-0">
        <Suspense fallback={<DashboardContentLoader />}>{children}</Suspense>
      </main>
    </div>
  )
}

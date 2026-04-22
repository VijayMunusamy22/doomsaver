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
    <div className="flex h-screen bg-background">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<DashboardContentLoader />}>{children}</Suspense>
      </main>
    </div>
  )
}

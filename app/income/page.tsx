import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IncomeManager } from '@/components/income/income-manager'
import { DashboardLayout } from '@/components/nav/dashboard-layout'
import { content } from '@/lib/content'

export const metadata: Metadata = {
  title: content.income.pageTitle,
  description: content.income.pageSubtitle,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function IncomePage() {
  const session = await getServerSession(authOptions)
  const familyId = session!.user.familyId!

  const [incomes, members] = await Promise.all([
    prisma.income.findMany({
      where: { familyId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.findMany({
      where: { familyId },
      select: { id: true, name: true, email: true },
      orderBy: [{ name: 'asc' }, { createdAt: 'asc' }],
    }),
  ])

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 page-enter">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{content.income.pageTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{content.income.pageSubtitle}</p>
        </div>
        <IncomeManager initialIncomes={incomes} members={members} />
      </div>
    </DashboardLayout>
  )
}

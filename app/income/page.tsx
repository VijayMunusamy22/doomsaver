import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IncomeManager } from '@/components/income/income-manager'
import { DashboardLayout } from '@/components/nav/dashboard-layout'
import { content } from '@/lib/content'
import {
  MASTER_PERIOD_KEY,
  getAllowedTargetPeriodKeys,
  getCurrentPeriodKey,
  isMonthlyPeriodKey,
} from '@/lib/budgets'

export const metadata: Metadata = {
  title: content.income.pageTitle,
  description: content.income.pageSubtitle,
  robots: {
    index: false,
    follow: false,
  },
}

interface Props {
  searchParams?: { period?: string | string[] }
}

export default async function IncomePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const familyId = session!.user.familyId!

  const selectedPeriodParam = Array.isArray(searchParams?.period)
    ? searchParams?.period[0]
    : searchParams?.period

  const requestedPeriodKey =
    selectedPeriodParam === MASTER_PERIOD_KEY ||
    (typeof selectedPeriodParam === 'string' && isMonthlyPeriodKey(selectedPeriodParam))
      ? selectedPeriodParam
      : null

  const selectedPeriodKey = requestedPeriodKey ?? getCurrentPeriodKey()

  const [periodRows, members] = await Promise.all([
    prisma.income.findMany({
      where: { familyId },
      select: { periodKey: true },
      distinct: ['periodKey'],
    }),
    prisma.user.findMany({
      where: { familyId },
      select: { id: true, name: true, email: true },
      orderBy: [{ name: 'asc' }, { createdAt: 'asc' }],
    }),
  ])

  const periodOptionsSet = new Set<string>([
    MASTER_PERIOD_KEY,
    ...periodRows.map(row => row.periodKey),
    selectedPeriodKey,
    ...getAllowedTargetPeriodKeys(),
  ])

  const periodOptions = Array.from(periodOptionsSet).sort((a, b) => {
    if (a === MASTER_PERIOD_KEY) return -1
    if (b === MASTER_PERIOD_KEY) return 1
    return a < b ? 1 : -1
  })

  const incomes = await prisma.income.findMany({
    where: { familyId, periodKey: selectedPeriodKey },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 page-enter">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{content.income.pageTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{content.income.pageSubtitle}</p>
        </div>
        <IncomeManager
          initialIncomes={incomes}
          members={members}
          selectedPeriodKey={selectedPeriodKey}
          periodOptions={periodOptions}
          allowedTargetPeriods={getAllowedTargetPeriodKeys()}
        />
      </div>
    </DashboardLayout>
  )
}

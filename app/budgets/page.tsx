import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardLayout } from '@/components/nav/dashboard-layout'
import { BudgetManager } from '@/components/budgets/budget-manager'
import { content } from '@/lib/content'
import { MASTER_PERIOD_KEY, getAllowedTargetPeriodKeys, getBudgetDisplayName } from '@/lib/budgets'

export const metadata: Metadata = {
  title: content.budgets.pageTitle,
  description: content.budgets.pageSubtitle,
  robots: {
    index: false,
    follow: false,
  },
}

interface Props {
  searchParams?: { budget?: string | string[] }
}

export default async function BudgetsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const familyId = session!.user.familyId!

  let masterBudget = await prisma.budget.findUnique({
    where: { familyId_periodKey: { familyId, periodKey: MASTER_PERIOD_KEY } },
  })

  if (!masterBudget) {
    masterBudget = await prisma.budget.create({
      data: {
        familyId,
        name: 'Master Budget',
        kind: 'MASTER',
        periodKey: MASTER_PERIOD_KEY,
      },
    })
  }

  const [budgets, members] = await Promise.all([
    prisma.budget.findMany({
      where: { familyId },
      orderBy: [{ createdAt: 'asc' }],
    }),
    prisma.user.findMany({
      where: { familyId },
      select: { id: true, name: true, email: true },
      orderBy: [{ name: 'asc' }, { createdAt: 'asc' }],
    }),
  ])

  const sortedBudgets = budgets
    .slice()
    .sort((a, b) => {
      if (a.periodKey === MASTER_PERIOD_KEY) return -1
      if (b.periodKey === MASTER_PERIOD_KEY) return 1
      return a.periodKey < b.periodKey ? 1 : -1
    })

  const selectedBudgetParam = Array.isArray(searchParams?.budget)
    ? searchParams?.budget[0]
    : searchParams?.budget

  const selectedBudget =
    sortedBudgets.find(budget => budget.id === selectedBudgetParam) ?? masterBudget

  const categories = await prisma.category.findMany({
    where: {
      familyId,
      budgetId: selectedBudget.id,
    },
    include: {
      subCategories: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 page-enter">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{content.budgets.pageTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{content.budgets.pageSubtitle}</p>
        </div>

        <BudgetManager
          budgets={sortedBudgets.map(budget => ({
            id: budget.id,
            name: budget.name,
            periodKey: budget.periodKey,
            kind: budget.kind,
            displayName: getBudgetDisplayName(budget),
          }))}
          selectedBudgetId={selectedBudget.id}
          initialCategories={categories}
          members={members}
          allowedTargetPeriods={getAllowedTargetPeriodKeys()}
        />
      </div>
    </DashboardLayout>
  )
}

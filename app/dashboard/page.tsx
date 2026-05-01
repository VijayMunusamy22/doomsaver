import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OverviewCards } from '@/components/dashboard/overview-cards'
import { IncomeChart } from '@/components/dashboard/income-chart'
import { CategoryDonutChart } from '@/components/dashboard/category-donut-chart'
import { BudgetWarning } from '@/components/dashboard/budget-warning'
import { MemberExpenseChart } from '@/components/dashboard/member-expense-chart'
import { MemberCategoryExpenseChart } from '@/components/dashboard/member-category-expense-chart'
import { content } from '@/lib/content'
import {
  MASTER_PERIOD_KEY,
  getBudgetDisplayName,
  getCurrentPeriodKey,
} from '@/lib/budgets'
import { DashboardBudgetSelector } from '@/components/dashboard/budget-selector'

export const metadata: Metadata = {
  title: content.dashboard.title,
  description: content.dashboard.subtitle,
  robots: {
    index: false,
    follow: false,
  },
}

interface Props {
  searchParams?: { budget?: string | string[] }
}

export default async function DashboardPage({ searchParams }: Props) {
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
      orderBy: { createdAt: 'asc' },
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

  const currentMonthlyBudget = sortedBudgets.find(
    budget => budget.kind === 'MONTHLY' && budget.periodKey === getCurrentPeriodKey(),
  )

  const selectedBudgetParam = Array.isArray(searchParams?.budget)
    ? searchParams?.budget[0]
    : searchParams?.budget

  const selectedBudget =
    sortedBudgets.find(budget => budget.id === selectedBudgetParam) ??
    currentMonthlyBudget ??
    masterBudget

  const incomePeriodKey =
    selectedBudget.periodKey === MASTER_PERIOD_KEY
      ? MASTER_PERIOD_KEY
      : selectedBudget.periodKey

  let incomes = await prisma.income.findMany({
    where: { familyId, periodKey: incomePeriodKey },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })

  if (incomePeriodKey !== MASTER_PERIOD_KEY && incomes.length === 0) {
    incomes = await prisma.income.findMany({
      where: { familyId, periodKey: MASTER_PERIOD_KEY },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    })
  }

  const categories = await prisma.category.findMany({
    where: { familyId, budgetId: selectedBudget.id },
    include: { subCategories: true },
    orderBy: { createdAt: 'asc' },
  })

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalAllocated = categories.reduce(
    (s, cat) => s + cat.subCategories.reduce((ss, sub) => ss + sub.budgetAmount, 0),
    0,
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{content.dashboard.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{content.dashboard.subtitle}</p>
        </div>
        <DashboardBudgetSelector
          budgets={sortedBudgets.map(budget => ({
            id: budget.id,
            displayName: getBudgetDisplayName(budget),
          }))}
          selectedBudgetId={selectedBudget.id}
        />
      </div>

      <BudgetWarning totalIncome={totalIncome} totalAllocated={totalAllocated} />

      <OverviewCards totalIncome={totalIncome} totalAllocated={totalAllocated} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeChart incomes={incomes} />
        <CategoryDonutChart categories={categories} totalIncome={totalIncome} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MemberExpenseChart categories={categories} members={members} />
        <div className="lg:col-span-2">
          <MemberCategoryExpenseChart categories={categories} members={members} />
        </div>
      </div>
    </div>
  )
}

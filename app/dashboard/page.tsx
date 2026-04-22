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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const familyId = session!.user.familyId!

  const [incomes, categories, members] = await Promise.all([
    prisma.income.findMany({
      where: { familyId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.category.findMany({
      where: { familyId },
      include: { subCategories: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.findMany({
      where: { familyId },
      select: { id: true, name: true, email: true },
      orderBy: [{ name: 'asc' }, { createdAt: 'asc' }],
    }),
  ])

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalAllocated = categories.reduce(
    (s, cat) => s + cat.subCategories.reduce((ss, sub) => ss + sub.budgetAmount, 0),
    0,
  )

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{content.dashboard.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{content.dashboard.subtitle}</p>
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

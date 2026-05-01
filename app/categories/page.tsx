import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CategoryManager } from '@/components/categories/category-manager'
import { DashboardLayout } from '@/components/nav/dashboard-layout'
import { content } from '@/lib/content'
import { MASTER_PERIOD_KEY } from '@/lib/budgets'

export const metadata: Metadata = {
  title: content.categories.pageTitle,
  description: content.categories.pageSubtitle,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions)
  const familyId = session!.user.familyId!

  let masterBudget = await prisma.budget.findUnique({
    where: {
      familyId_periodKey: { familyId, periodKey: MASTER_PERIOD_KEY },
    },
    select: { id: true },
  })

  if (!masterBudget) {
    masterBudget = await prisma.budget.create({
      data: {
        name: 'Master Budget',
        kind: 'MASTER',
        periodKey: MASTER_PERIOD_KEY,
        familyId,
      },
      select: { id: true },
    })
  }

  const categories = await prisma.category.findMany({
    where: { familyId, budgetId: masterBudget.id },
    include: { subCategories: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 page-enter">
        <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{content.categories.pageTitle}</h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              {content.categories.pageSubtitle}
            </p>
          </div>
          <CategoryManager initialCategories={categories} budgetId={masterBudget.id} />
        </div>
      </div>
    </DashboardLayout>
  )
}

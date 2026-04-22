import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CategoryManager } from '@/components/categories/category-manager'
import { DashboardLayout } from '@/components/nav/dashboard-layout'
import { content } from '@/lib/content'

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

  const [categories, members] = await Promise.all([
    prisma.category.findMany({
      where: { familyId },
      include: { subCategories: { orderBy: { createdAt: 'asc' } } },
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{content.categories.pageTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{content.categories.pageSubtitle}</p>
        </div>
        <CategoryManager initialCategories={categories} members={members} />
      </div>
    </DashboardLayout>
  )
}

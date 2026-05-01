import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { MASTER_PERIOD_KEY } from '@/lib/budgets'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  })
  if (!user?.familyId) return NextResponse.json([])

  const url = new URL(req.url)
  const budgetId = url.searchParams.get('budgetId')

  const categories = await prisma.category.findMany({
    where: {
      familyId: user.familyId,
      ...(budgetId ? { budgetId } : {}),
    },
    include: { subCategories: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  })
  if (!user?.familyId)
    return NextResponse.json({ error: 'No family' }, { status: 400 })

  const { name, color, budgetId } = await req.json()
  if (!name?.trim())
    return NextResponse.json({ error: 'Name required' }, { status: 400 })

  let resolvedBudgetId = typeof budgetId === 'string' ? budgetId : ''

  if (resolvedBudgetId) {
    const budget = await prisma.budget.findUnique({
      where: { id: resolvedBudgetId },
      select: { familyId: true },
    })
    if (!budget || budget.familyId !== user.familyId) {
      return NextResponse.json({ error: 'Invalid budget' }, { status: 400 })
    }
  } else {
    const masterBudget = await prisma.budget.findUnique({
      where: {
        familyId_periodKey: {
          familyId: user.familyId,
          periodKey: MASTER_PERIOD_KEY,
        },
      },
      select: { id: true },
    })
    if (!masterBudget) {
      return NextResponse.json({ error: 'Master budget not found' }, { status: 400 })
    }
    resolvedBudgetId = masterBudget.id
  }

  const category = await prisma.category.create({
    data: {
      name,
      color: color ?? '#C9922B',
      familyId: user.familyId,
      budgetId: resolvedBudgetId,
    },
    include: { subCategories: true },
  })
  revalidatePath('/dashboard')
  revalidatePath('/categories')
  revalidatePath('/budgets')
  return NextResponse.json(category)
}

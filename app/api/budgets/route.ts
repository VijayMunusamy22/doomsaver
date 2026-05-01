import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  MASTER_PERIOD_KEY,
  getAllowedTargetPeriodKeys,
  getBudgetDisplayName,
  getMonthlyBudgetName,
} from '@/lib/budgets'

const createBudgetSchema = z.object({
  kind: z.enum(['MASTER', 'MONTHLY']),
  sourceBudgetId: z.string().optional(),
  targetPeriodKey: z.string().optional(),
})

async function getFamilyId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { familyId: true },
  })
  return user?.familyId ?? null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const familyId = await getFamilyId(session.user.id)
  if (!familyId) return NextResponse.json([])

  const budgets = await prisma.budget.findMany({
    where: { familyId },
    include: {
      _count: {
        select: {
          categories: true,
        },
      },
    },
    orderBy: [{ periodKey: 'asc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json(
    budgets.map(budget => ({
      id: budget.id,
      kind: budget.kind,
      periodKey: budget.periodKey,
      name: budget.name,
      displayName: getBudgetDisplayName(budget),
      categoryCount: budget._count.categories,
    })),
  )
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const familyId = await getFamilyId(session.user.id)
  if (!familyId) {
    return NextResponse.json({ error: 'No family' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = createBudgetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  if (parsed.data.kind === 'MASTER') {
    const existingMaster = await prisma.budget.findUnique({
      where: { familyId_periodKey: { familyId, periodKey: MASTER_PERIOD_KEY } },
    })

    if (existingMaster) {
      return NextResponse.json(existingMaster)
    }

    const createdMaster = await prisma.budget.create({
      data: {
        name: 'Master Budget',
        kind: 'MASTER',
        periodKey: MASTER_PERIOD_KEY,
        familyId,
      },
    })

    revalidatePath('/budgets')
    revalidatePath('/dashboard')
    revalidatePath('/categories')
    return NextResponse.json(createdMaster)
  }

  const { sourceBudgetId, targetPeriodKey } = parsed.data
  if (!sourceBudgetId || !targetPeriodKey) {
    return NextResponse.json(
      { error: 'sourceBudgetId and targetPeriodKey are required' },
      { status: 400 },
    )
  }

  const allowedTargetPeriods = getAllowedTargetPeriodKeys()
  if (!allowedTargetPeriods.includes(targetPeriodKey)) {
    return NextResponse.json(
      { error: 'Target period must be current or next month' },
      { status: 400 },
    )
  }

  const sourceBudget = await prisma.budget.findUnique({
    where: { id: sourceBudgetId },
    select: { id: true, familyId: true, periodKey: true },
  })

  if (!sourceBudget || sourceBudget.familyId !== familyId) {
    return NextResponse.json({ error: 'Invalid source budget' }, { status: 400 })
  }

  const existingTarget = await prisma.budget.findUnique({
    where: { familyId_periodKey: { familyId, periodKey: targetPeriodKey } },
    select: { id: true },
  })

  if (existingTarget?.id === sourceBudget.id) {
    return NextResponse.json(
      { error: 'Source and target budgets cannot be the same' },
      { status: 400 },
    )
  }

  const copied = await prisma.$transaction(async tx => {
    const targetBudget = existingTarget
      ? await tx.budget.update({
          where: { id: existingTarget.id },
          data: {
            name: getMonthlyBudgetName(targetPeriodKey),
            kind: 'MONTHLY',
            sourceBudgetId: sourceBudget.id,
          },
        })
      : await tx.budget.create({
          data: {
            name: getMonthlyBudgetName(targetPeriodKey),
            kind: 'MONTHLY',
            periodKey: targetPeriodKey,
            familyId,
            sourceBudgetId: sourceBudget.id,
          },
        })

    if (existingTarget) {
      await tx.category.deleteMany({
        where: { budgetId: targetBudget.id },
      })
    }

    const sourceCategories = await tx.category.findMany({
      where: { budgetId: sourceBudget.id },
      include: {
        subCategories: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    for (const category of sourceCategories) {
      await tx.category.create({
        data: {
          name: category.name,
          color: category.color,
          icon: category.icon,
          familyId,
          budgetId: targetBudget.id,
          subCategories: {
            create: category.subCategories.map(sub => ({
              name: sub.name,
              budgetAmount: sub.budgetAmount,
              managerId: sub.managerId,
              note: sub.note,
            })),
          },
        },
      })
    }

    return targetBudget
  })

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
  return NextResponse.json(copied)
}

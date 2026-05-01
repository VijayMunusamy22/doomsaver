import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  MASTER_PERIOD_KEY,
  getAllowedTargetPeriodKeys,
  isMonthlyPeriodKey,
} from '@/lib/budgets'

const schema = z.object({
  sourcePeriodKey: z.string().min(1),
  targetPeriodKey: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  })
  if (!user?.familyId) {
    return NextResponse.json({ error: 'No family' }, { status: 400 })
  }
  const familyId = user.familyId

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const sourcePeriodKey = parsed.data.sourcePeriodKey.trim()
  const targetPeriodKey = parsed.data.targetPeriodKey.trim()

  const validSource =
    sourcePeriodKey === MASTER_PERIOD_KEY || isMonthlyPeriodKey(sourcePeriodKey)
  const validTarget = getAllowedTargetPeriodKeys().includes(targetPeriodKey)

  if (!validSource || !validTarget) {
    return NextResponse.json({ error: 'Invalid period selection' }, { status: 400 })
  }
  if (sourcePeriodKey === targetPeriodKey) {
    return NextResponse.json(
      { error: 'Source and target periods cannot be the same' },
      { status: 400 },
    )
  }

  const copiedCount = await prisma.$transaction(async tx => {
    const sourceIncomes = await tx.income.findMany({
      where: { familyId, periodKey: sourcePeriodKey },
      orderBy: { createdAt: 'asc' },
    })

    await tx.income.deleteMany({
      where: { familyId, periodKey: targetPeriodKey },
    })

    if (sourceIncomes.length === 0) return 0

    await tx.income.createMany({
      data: sourceIncomes.map(income => ({
        label: income.label,
        amount: income.amount,
        type: income.type,
        familyId: income.familyId,
        userId: income.userId,
        periodKey: targetPeriodKey,
      })),
    })

    return sourceIncomes.length
  })

  revalidatePath('/income')
  revalidatePath('/dashboard')

  return NextResponse.json({ copiedCount, targetPeriodKey })
}

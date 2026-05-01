import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { MASTER_PERIOD_KEY, isMonthlyPeriodKey } from '@/lib/budgets'

const schema = z.object({
  label: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(['PRIMARY', 'SECONDARY', 'SIDE']),
  userId: z.string().min(1),
  periodKey: z.string().optional(),
})

function resolvePeriodKey(rawPeriodKey: unknown) {
  if (typeof rawPeriodKey !== 'string' || !rawPeriodKey.trim()) return MASTER_PERIOD_KEY
  const periodKey = rawPeriodKey.trim()
  if (periodKey === MASTER_PERIOD_KEY || isMonthlyPeriodKey(periodKey)) return periodKey
  return null
}

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
  const periodKeyFilter = url.searchParams.get('periodKey')

  const incomes = await prisma.income.findMany({
    where: {
      familyId: user.familyId,
      ...(periodKeyFilter ? { periodKey: periodKeyFilter } : {}),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(incomes)
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

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const periodKey = resolvePeriodKey(parsed.data.periodKey)
  if (!periodKey)
    return NextResponse.json({ error: 'Invalid periodKey' }, { status: 400 })

  const member = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { familyId: true },
  })
  if (!member || member.familyId !== user.familyId)
    return NextResponse.json({ error: 'Invalid family member' }, { status: 400 })

  const income = await prisma.income.create({
    data: {
      label: parsed.data.label,
      amount: parsed.data.amount,
      type: parsed.data.type,
      userId: parsed.data.userId,
      periodKey,
      familyId: user.familyId,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  revalidatePath('/dashboard')
  revalidatePath('/income')
  return NextResponse.json(income)
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInviteCode } from '@/lib/utils'
import { z } from 'zod'
import { MASTER_PERIOD_KEY } from '@/lib/budgets'

const schema = z.object({
  name: z.string().min(1),
  mode: z.enum(['SOLO', 'COUPLE']),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  })
  if (user?.familyId)
    return NextResponse.json({ error: 'Already in a family' }, { status: 400 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  // Guarantee unique invite code
  let inviteCode = ''
  do { inviteCode = generateInviteCode() }
  while (await prisma.family.findUnique({ where: { inviteCode } }))

  const family = await prisma.family.create({
    data: {
      name: parsed.data.name,
      mode: parsed.data.mode,
      inviteCode,
      members: { connect: { id: session.user.id } },
    },
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: 'ADMIN', familyId: family.id },
  })

  await prisma.budget.create({
    data: {
      name: 'Master Budget',
      kind: 'MASTER',
      periodKey: MASTER_PERIOD_KEY,
      familyId: family.id,
    },
  })

  return NextResponse.json(family)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      family: {
        include: {
          members: { select: { id: true, name: true, email: true, image: true, role: true } },
          incomes: true,
          categories: { include: { subCategories: true } },
        },
      },
    },
  })

  return NextResponse.json(user?.family ?? null)
}

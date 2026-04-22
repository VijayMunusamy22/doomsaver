import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  label: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(['PRIMARY', 'SECONDARY', 'SIDE']),
  userId: z.string().min(1),
})

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  })
  if (!user?.familyId)
    return NextResponse.json({ error: 'No family' }, { status: 400 })

  const income = await prisma.income.findUnique({
    where: { id: params.id },
    select: { familyId: true },
  })
  if (!income)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (income.familyId !== user.familyId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const member = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { familyId: true },
  })
  if (!member || member.familyId !== user.familyId)
    return NextResponse.json({ error: 'Invalid family member' }, { status: 400 })

  const updated = await prisma.income.update({
    where: { id: params.id },
    data: parsed.data,
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  revalidatePath('/dashboard')
  revalidatePath('/income')
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  })
  if (!user?.familyId)
    return NextResponse.json({ error: 'No family' }, { status: 400 })

  const income = await prisma.income.findUnique({
    where: { id: params.id },
    select: { familyId: true },
  })
  if (!income)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (income.familyId !== user.familyId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.income.delete({ where: { id: params.id } })
  revalidatePath('/dashboard')
  revalidatePath('/income')
  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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

  const existing = await prisma.category.findUnique({
    where: { id: params.id },
    select: { familyId: true },
  })
  if (!existing)
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  if (existing.familyId !== user.familyId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, color } = await req.json()

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: { ...(name && { name }), ...(color && { color }) },
    include: { subCategories: true },
  })
  revalidatePath('/dashboard')
  revalidatePath('/categories')
  revalidatePath('/budgets')
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

  const existing = await prisma.category.findUnique({
    where: { id: params.id },
    select: { familyId: true },
  })
  if (!existing)
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  if (existing.familyId !== user.familyId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.category.delete({ where: { id: params.id } })
  revalidatePath('/dashboard')
  revalidatePath('/categories')
  revalidatePath('/budgets')
  return NextResponse.json({ success: true })
}

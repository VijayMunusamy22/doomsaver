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

  const existing = await prisma.subCategory.findUnique({
    where: { id: params.id },
    select: { category: { select: { familyId: true } } },
  })
  if (!existing)
    return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
  if (existing.category.familyId !== user.familyId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, budgetAmount, managerId, note } = await req.json()
  const hasName = name !== undefined
  const cleanedName = typeof name === 'string' ? name.trim() : ''
  const cleanedManagerId = typeof managerId === 'string' ? managerId : ''
  const cleanedNote = typeof note === 'string' ? note.trim() : ''

  if (hasName && !cleanedName)
    return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })

  if (cleanedManagerId) {
    const manager = await prisma.user.findUnique({
      where: { id: cleanedManagerId },
      select: { familyId: true },
    })
    if (!manager || manager.familyId !== user.familyId)
      return NextResponse.json({ error: 'Invalid manager' }, { status: 400 })
  }

  const updated = await prisma.subCategory.update({
    where: { id: params.id },
    data: {
      ...(hasName && { name: cleanedName }),
      ...(budgetAmount !== undefined && { budgetAmount: Number(budgetAmount) }),
      ...(managerId !== undefined && { managerId: cleanedManagerId || null }),
      ...(note !== undefined && { note: cleanedNote || null }),
    },
  })
  revalidatePath('/dashboard')
  revalidatePath('/categories')
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.subCategory.delete({ where: { id: params.id } })
  revalidatePath('/dashboard')
  revalidatePath('/categories')
  return NextResponse.json({ success: true })
}

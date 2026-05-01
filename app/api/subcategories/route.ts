import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, budgetAmount, categoryId, managerId, note } = await req.json()
  const cleanedName = typeof name === 'string' ? name.trim() : ''
  const cleanedManagerId = typeof managerId === 'string' ? managerId : ''
  const cleanedNote = typeof note === 'string' ? note.trim() : ''

  if (!cleanedName || !categoryId)
    return NextResponse.json({ error: 'name and categoryId required' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  })
  if (!user?.familyId)
    return NextResponse.json({ error: 'No family' }, { status: 400 })

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { familyId: true },
  })
  if (!category || category.familyId !== user.familyId)
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })

  if (cleanedManagerId) {
    const manager = await prisma.user.findUnique({
      where: { id: cleanedManagerId },
      select: { familyId: true },
    })
    if (!manager || manager.familyId !== user.familyId)
      return NextResponse.json({ error: 'Invalid manager' }, { status: 400 })
  }

  const sub = await prisma.subCategory.create({
    data: {
      name: cleanedName,
      budgetAmount: Number(budgetAmount ?? 0),
      categoryId,
      managerId: cleanedManagerId || null,
      note: cleanedNote || null,
    },
  })
  revalidatePath('/dashboard')
  revalidatePath('/categories')
  revalidatePath('/budgets')
  return NextResponse.json(sub)
}

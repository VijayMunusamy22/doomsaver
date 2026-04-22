import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  })
  if (!user?.familyId) return NextResponse.json([])

  const categories = await prisma.category.findMany({
    where: { familyId: user.familyId },
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

  const { name, color } = await req.json()
  if (!name?.trim())
    return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const category = await prisma.category.create({
    data: { name, color: color ?? '#C9922B', familyId: user.familyId },
    include: { subCategories: true },
  })
  revalidatePath('/dashboard')
  revalidatePath('/categories')
  return NextResponse.json(category)
}

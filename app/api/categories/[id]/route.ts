import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, color } = await req.json()

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: { ...(name && { name }), ...(color && { color }) },
    include: { subCategories: true },
  })
  revalidatePath('/dashboard')
  revalidatePath('/categories')
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.category.delete({ where: { id: params.id } })
  revalidatePath('/dashboard')
  revalidatePath('/categories')
  return NextResponse.json({ success: true })
}

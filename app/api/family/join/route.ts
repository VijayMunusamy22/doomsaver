import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inviteCode } = await req.json()
  if (!inviteCode)
    return NextResponse.json({ error: 'Invite code required' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { familyId: true },
  })
  if (user?.familyId)
    return NextResponse.json({ error: 'Already in a family' }, { status: 400 })

  const family = await prisma.family.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
    include: { members: true },
  })

  if (!family)
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
  if (family.mode === 'SOLO')
    return NextResponse.json({ error: 'This is a solo budget' }, { status: 400 })
  if (family.members.length >= 2)
    return NextResponse.json({ error: 'Family already has 2 members' }, { status: 400 })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { familyId: family.id },
  })

  return NextResponse.json({ success: true, familyName: family.name })
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FamilyPanel } from '@/components/family/family-panel'
import { DashboardLayout } from '@/components/nav/dashboard-layout'
import { content } from '@/lib/content'

export default async function FamilyPage() {
  const session = await getServerSession(authOptions)
  const familyId = session!.user.familyId!

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        select: { id: true, name: true, email: true, image: true, role: true },
      },
    },
  })

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{content.family.pageTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{content.family.pageSubtitle}</p>
        </div>
        {family && <FamilyPanel family={family} currentUserId={session!.user.id} />}
      </div>
    </DashboardLayout>
  )
}

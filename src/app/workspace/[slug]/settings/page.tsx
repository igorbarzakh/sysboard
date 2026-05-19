import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import type { WorkspaceRole } from '@entities/workspace/model'
import { WorkspaceSettingsPage } from '@pages/workspace-settings'
import { authOptions, prisma } from '@shared/lib/server'
import type { UserPlan } from '@shared/lib'

type PageProps = { params: Promise<{ slug: string }> }

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { slug } = await params

  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,
      members: { some: { userId: session.user.id } },
    },
    select: {
      name: true,
      description: true,
      image: true,
      slug: true,
      owner: { select: { plan: true } },
      members: {
        select: { userId: true, role: true },
      },
      invites: {
        where: { acceptedAt: null, expiresAt: { gt: new Date() } },
        select: { id: true },
      },
      _count: { select: { boards: true } },
    },
  })

  if (!workspace) redirect('/workspace')

  const currentMember = workspace.members.find(
    (member) => member.userId === session.user.id,
  )

  return (
    <WorkspaceSettingsPage
      workspace={{
        activeInviteCount: workspace.invites.length,
        boardCount: workspace._count.boards,
        currentUserRole: normalizeRole(currentMember?.role),
        description: workspace.description,
        image: workspace.image,
        memberCount: workspace.members.length,
        name: workspace.name,
        plan: workspace.owner.plan as UserPlan,
        slug: workspace.slug,
      }}
    />
  )
}

function normalizeRole(role: string | undefined): WorkspaceRole {
  if (role === 'owner' || role === 'admin') {
    return role
  }

  return 'member'
}

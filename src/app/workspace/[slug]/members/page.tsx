import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions, prisma } from '@shared/lib/server'
import type { UserPlan } from '@shared/lib'
import type { WorkspaceMember, WorkspaceRole } from '@entities/workspace/model'
import { WorkspaceMembersPage } from '@pages/workspace-members'
import styles from './page.module.scss'

type PageProps = { params: Promise<{ slug: string }> }

export const metadata: Metadata = {
  title: 'Members',
}

export default async function MembersPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { slug } = await params

  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,
      members: { some: { userId: session.user.id } },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      owner: { select: { plan: true } },
      members: {
        orderBy: [{ role: 'desc' }, { joinedAt: 'asc' }],
        select: {
          userId: true,
          role: true,
          joinedAt: true,
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      invites: {
        where: { acceptedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, token: true, createdAt: true, expiresAt: true },
      },
    },
  })

  if (!workspace) redirect('/workspace')

  const currentMember = workspace.members.find(
    (member) => member.userId === session.user.id,
  )
  const members: WorkspaceMember[] = workspace.members.map((member) => ({
    userId: member.userId,
    role: normalizeRole(member.role),
    joinedAt: member.joinedAt.toISOString(),
    user: member.user,
  }))

  const activeInvites = workspace.invites.map((invite) => ({
    id: invite.id,
    token: invite.token,
    createdAt: invite.createdAt.toISOString(),
    expiresAt: invite.expiresAt.toISOString(),
  }))

  return (
    <div className={styles.page}>
      <WorkspaceMembersPage
        activeInvites={activeInvites}
        canManageMembers={currentMember?.role === 'owner'}
        currentUserId={session.user.id}
        members={members}
        plan={workspace.owner.plan as UserPlan}
        workspaceSlug={workspace.slug}
      />
    </div>
  )
}

function normalizeRole(role: string): WorkspaceRole {
  return role === 'owner' ? 'owner' : 'member'
}

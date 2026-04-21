import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions, prisma } from '@shared/lib/server'
import { InviteAcceptPage } from '@pages/invite-accept'

type PageProps = { params: Promise<{ token: string }> }

export const metadata: Metadata = {
  title: 'Invite',
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params
  const session = await getServerSession(authOptions)
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    select: {
      acceptedAt: true,
      expiresAt: true,
      workspace: {
        select: {
          name: true,
          slug: true,
          members: session?.user?.id
            ? { where: { userId: session.user.id }, select: { userId: true } }
            : false,
        },
      },
    },
  })

  if (!invite) {
    return <InviteAcceptPage status="not_found" token={token} />
  }

  const currentUserIsMember = invite.workspace.members?.length > 0

  if (invite.acceptedAt || currentUserIsMember) {
    return (
      <InviteAcceptPage
        status="accepted"
        token={token}
        workspaceName={invite.workspace.name}
        workspaceSlug={invite.workspace.slug}
      />
    )
  }

  if (invite.expiresAt <= new Date()) {
    return (
      <InviteAcceptPage
        status="expired"
        token={token}
        workspaceName={invite.workspace.name}
      />
    )
  }

  if (!session?.user?.id) {
    return (
      <InviteAcceptPage
        status="unauthenticated"
        token={token}
        workspaceName={invite.workspace.name}
      />
    )
  }

  return (
    <InviteAcceptPage
      status="ready"
      token={token}
      workspaceName={invite.workspace.name}
    />
  )
}

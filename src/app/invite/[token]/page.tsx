import { getServerSession } from 'next-auth'
import { authOptions, prisma } from '@shared/lib'
import { AcceptWorkspaceInvitePage } from '@features/accept-workspace-invite/ui'

type PageProps = { params: Promise<{ token: string }> }

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
    return <AcceptWorkspaceInvitePage status="not_found" token={token} />
  }

  const currentUserIsMember = invite.workspace.members?.length > 0

  if (invite.acceptedAt || currentUserIsMember) {
    return (
      <AcceptWorkspaceInvitePage
        status="accepted"
        token={token}
        workspaceName={invite.workspace.name}
        workspaceSlug={invite.workspace.slug}
      />
    )
  }

  if (invite.expiresAt <= new Date()) {
    return (
      <AcceptWorkspaceInvitePage
        status="expired"
        token={token}
        workspaceName={invite.workspace.name}
      />
    )
  }

  if (!session?.user?.id) {
    return (
      <AcceptWorkspaceInvitePage
        status="unauthenticated"
        token={token}
        workspaceName={invite.workspace.name}
      />
    )
  }

  return (
    <AcceptWorkspaceInvitePage
      status="ready"
      token={token}
      workspaceName={invite.workspace.name}
    />
  )
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, prisma } from '@shared/lib'

type RouteContext = { params: Promise<{ slug: string; id: string }> }

export async function DELETE(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug, id } = await params

  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,
      members: { some: { userId: session.user.id } },
    },
    select: {
      id: true,
      members: { where: { userId: session.user.id }, select: { role: true } },
    },
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const callerRole = workspace.members[0]?.role
  if (callerRole !== 'owner') {
    return NextResponse.json({ error: 'Only workspace owners can revoke invites' }, { status: 403 })
  }

  const deleted = await prisma.workspaceInvite.deleteMany({
    where: { id, workspaceId: workspace.id, acceptedAt: null },
  })

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}

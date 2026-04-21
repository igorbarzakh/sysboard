import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { randomBytes } from 'crypto'
import { authOptions, PLAN_LIMITS, WORKSPACE_INVITE_TTL_MS, prisma } from '@shared/lib'
import type { UserPlan } from '@shared/lib'

type RouteContext = { params: Promise<{ slug: string }> }

async function requireWorkspaceMember(slug: string, userId: string) {
  return prisma.workspace.findFirst({
    where: {
      slug,
      members: { some: { userId } },
    },
    select: {
      id: true,
      ownerId: true,
      owner: { select: { plan: true } },
      invites: {
        where: {
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      },
      members: {
        select: {
          userId: true,
          role: true,
          joinedAt: true,
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  })
}

export async function GET(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const workspace = await requireWorkspaceMember(slug, session.user.id)
  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(workspace.members)
}

export async function POST(request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const workspace = await requireWorkspaceMember(slug, session.user.id)
  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const callerRole = workspace.members.find((m) => m.userId === session.user.id)?.role
  if (callerRole !== 'owner') {
    return NextResponse.json({ error: 'Only workspace owners can invite members' }, { status: 403 })
  }

  const plan = workspace.owner.plan as UserPlan
  if (plan === 'free') {
    return NextResponse.json(
      { error: 'Inviting members is available on Pro' },
      { status: 403 },
    )
  }

  const currentCount = workspace.members.length
  const memberCap = PLAN_LIMITS[plan].maxWorkspaceMembers
  if (currentCount + workspace.invites.length >= memberCap) {
    return NextResponse.json({ error: 'Workspace member limit reached' }, { status: 403 })
  }

  const expiresAt = new Date(Date.now() + WORKSPACE_INVITE_TTL_MS)
  const invite = await prisma.workspaceInvite.create({
    data: {
      workspaceId: workspace.id,
      token: createInviteToken(),
      role: 'member',
      expiresAt,
      invitedById: session.user.id,
    },
    select: { id: true, createdAt: true, expiresAt: true, token: true },
  })

  return NextResponse.json(
    {
      id: invite.id,
      token: invite.token,
      createdAt: invite.createdAt.toISOString(),
      expiresAt: invite.expiresAt.toISOString(),
      inviteUrl: createInviteUrl(request, invite.token),
    },
    { status: 201 },
  )
}

function createInviteToken(): string {
  return randomBytes(32).toString('base64url')
}

function createInviteUrl(request: Request, token: string): string {
  const origin = request.headers.get('origin')
  return origin ? `${origin}/invite/${token}` : `/invite/${token}`
}

export async function DELETE(request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const workspace = await requireWorkspaceMember(slug, session.user.id)
  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const callerRole = workspace.members.find((m) => m.userId === session.user.id)?.role
  if (callerRole !== 'owner') {
    return NextResponse.json({ error: 'Only workspace owners can remove members' }, { status: 403 })
  }

  const body: unknown = await request.json()
  if (
    typeof body !== 'object' ||
    body === null ||
    !('userId' in body) ||
    typeof (body as Record<string, unknown>).userId !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const targetUserId = (body as Record<string, unknown>).userId as string

  const targetMember = workspace.members.find((m) => m.userId === targetUserId)
  if (!targetMember) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  if (targetMember.role === 'owner') {
    return NextResponse.json({ error: 'Cannot remove the workspace owner' }, { status: 403 })
  }

  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: targetUserId } },
  })

  return new NextResponse(null, { status: 204 })
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, PLAN_LIMITS, prisma } from '@shared/lib'
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
      plan: true,
      ownerId: true,
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
  if (!callerRole || !['owner', 'admin'].includes(callerRole)) {
    return NextResponse.json({ error: 'Only owners and admins can invite members' }, { status: 403 })
  }

  const body: unknown = await request.json()
  if (
    typeof body !== 'object' ||
    body === null ||
    !('email' in body) ||
    typeof (body as Record<string, unknown>).email !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = ((body as Record<string, unknown>).email as string).trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const invitee = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, image: true },
  })
  if (!invitee) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const alreadyMember = workspace.members.some((m) => m.userId === invitee.id)
  if (alreadyMember) {
    return NextResponse.json({ error: 'User is already a member' }, { status: 409 })
  }

  const plan = workspace.plan as UserPlan
  const currentCount = workspace.members.length
  const maxBoards = PLAN_LIMITS[plan].maxBoardsPerWorkspace
  const memberCap = plan === 'free' ? maxBoards * 5 : 100
  if (currentCount >= memberCap) {
    return NextResponse.json({ error: 'Workspace member limit reached' }, { status: 403 })
  }

  const newMember = await prisma.workspaceMember.create({
    data: { workspaceId: workspace.id, userId: invitee.id, role: 'member' },
    select: {
      userId: true,
      role: true,
      joinedAt: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })

  const workspaceBoards = await prisma.board.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true },
  })

  if (workspaceBoards.length > 0) {
    await prisma.boardMember.createMany({
      data: workspaceBoards.map((b) => ({
        boardId: b.id,
        userId: invitee.id,
        role: 'editor',
      })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json(newMember, { status: 201 })
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
  if (!callerRole || !['owner', 'admin'].includes(callerRole)) {
    return NextResponse.json({ error: 'Only owners and admins can remove members' }, { status: 403 })
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

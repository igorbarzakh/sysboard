import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PLAN_LIMITS } from '@shared/lib'
import { authOptions, prisma } from '@shared/lib/server'
import type { UserPlan } from '@shared/lib'

type RouteContext = { params: Promise<{ token: string }> }

export async function POST(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await params
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    select: {
      id: true,
      acceptedAt: true,
      expiresAt: true,
      role: true,
      workspace: {
        select: {
          id: true,
          owner: { select: { plan: true } },
          slug: true,
          boards: { select: { id: true } },
          members: { select: { userId: true } },
        },
      },
    },
  })

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  if (invite.acceptedAt) {
    return NextResponse.json({ error: 'Invite has already been used' }, { status: 409 })
  }

  if (invite.expiresAt <= new Date()) {
    return NextResponse.json({ error: 'Invite has expired' }, { status: 410 })
  }

  const alreadyMember = invite.workspace.members.some((member) => member.userId === session.user.id)
  if (alreadyMember) {
    await prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    })

    return NextResponse.json({ workspaceSlug: invite.workspace.slug })
  }

  const plan = invite.workspace.owner.plan as UserPlan
  const memberCap = PLAN_LIMITS[plan].maxWorkspaceMembers
  if (invite.workspace.members.length >= memberCap) {
    return NextResponse.json({ error: 'Workspace member limit reached' }, { status: 403 })
  }

  try {
    await prisma.$transaction(async (tx) => {
      const claim = await tx.workspaceInvite.updateMany({
        where: { id: invite.id, acceptedAt: null },
        data: { acceptedAt: new Date() },
      })

      if (claim.count !== 1) {
        throw new Error('INVITE_ALREADY_USED')
      }

      await tx.workspaceMember.create({
        data: {
          workspaceId: invite.workspace.id,
          userId: session.user.id,
          role: invite.role,
        },
      })

      if (invite.workspace.boards.length > 0) {
        await tx.boardMember.createMany({
          data: invite.workspace.boards.map((board) => ({
            boardId: board.id,
            userId: session.user.id,
            role: 'editor',
          })),
          skipDuplicates: true,
        })
      }

    })
  } catch (error) {
    if (error instanceof Error && error.message === 'INVITE_ALREADY_USED') {
      return NextResponse.json({ error: 'Invite has already been used' }, { status: 409 })
    }

    throw error
  }

  return NextResponse.json({ workspaceSlug: invite.workspace.slug })
}

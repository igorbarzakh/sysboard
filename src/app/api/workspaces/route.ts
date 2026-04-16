import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, deriveSlug, PLAN_LIMITS, prisma } from '@shared/lib'
import type { UserPlan } from '@shared/lib'

const workspaceInclude = {
  members: { select: { userId: true } },
  _count: { select: { boards: true } },
} as const

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: workspaceInclude,
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(workspaces)
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const rawName =
    typeof body === 'object' &&
    body !== null &&
    'name' in body &&
    typeof (body as Record<string, unknown>).name === 'string'
      ? ((body as Record<string, unknown>).name as string).trim()
      : ''

  const name = rawName || `${session.user.name ?? 'My'}'s Workspace`
  if (name.length > 50) {
    return NextResponse.json({ error: 'Name must be 50 characters or fewer' }, { status: 400 })
  }

  const plan = (session.user.plan ?? 'free') as UserPlan
  const limit = PLAN_LIMITS[plan].maxWorkspaces

  const workspaceCount = await prisma.workspace.count({
    where: { ownerId: session.user.id },
  })

  if (workspaceCount >= limit) {
    return NextResponse.json(
      { error: `Workspace limit reached (max ${limit} on ${plan} plan)` },
      { status: 403 },
    )
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug: deriveSlug(),
      ownerId: session.user.id,
      plan: plan,
      members: {
        create: { userId: session.user.id, role: 'owner' },
      },
    },
    include: workspaceInclude,
  })

  return NextResponse.json(workspace, { status: 201 })
}

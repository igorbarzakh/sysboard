import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/db'

type RouteContext = { params: Promise<{ slug: string }> }

const workspaceInclude = {
  members: {
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  },
  _count: { select: { boards: true } },
} as const

async function requireWorkspaceMember(slug: string, userId: string) {
  return prisma.workspace.findFirst({
    where: {
      slug,
      members: { some: { userId } },
    },
    include: {
      ...workspaceInclude,
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
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

  return NextResponse.json(workspace)
}

export async function PATCH(request: Request, { params }: RouteContext): Promise<NextResponse> {
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
    return NextResponse.json({ error: 'Only workspace owners and admins can update' }, { status: 403 })
  }

  const body: unknown = await request.json()
  if (
    typeof body !== 'object' ||
    body === null ||
    !('name' in body) ||
    typeof (body as Record<string, unknown>).name !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = ((body as Record<string, unknown>).name as string).trim()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (name.length > 50) {
    return NextResponse.json({ error: 'Name must be 50 characters or fewer' }, { status: 400 })
  }

  const updated = await prisma.workspace.update({
    where: { slug },
    data: { name },
    include: workspaceInclude,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: RouteContext): Promise<NextResponse> {
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
    return NextResponse.json({ error: 'Only the workspace owner can delete it' }, { status: 403 })
  }

  await prisma.workspace.delete({ where: { slug } })
  return new NextResponse(null, { status: 204 })
}

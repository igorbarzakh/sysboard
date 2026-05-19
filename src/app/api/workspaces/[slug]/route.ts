import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import {
  deleteAvatarByUrl,
  deleteWorkspaceAvatars,
} from '@shared/lib/avatarStorage'
import { authOptions, prisma } from '@shared/lib/server'

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
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const patch = body as Record<string, unknown>
  const data: { description?: string | null; image?: string | null; name?: string } = {}

  if ('name' in patch) {
    if (typeof patch.name !== 'string') {
      return NextResponse.json({ error: 'Name must be a string' }, { status: 400 })
    }

    const name = patch.name.trim()
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (name.length > 70) {
      return NextResponse.json({ error: 'Name must be 70 characters or fewer' }, { status: 400 })
    }

    data.name = name
  }

  if ('image' in patch) {
    if (typeof patch.image !== 'string' && patch.image !== null) {
      return NextResponse.json({ error: 'Image must be a string or null' }, { status: 400 })
    }

    data.image = patch.image
  }

  if ('description' in patch) {
    if (typeof patch.description !== 'string' && patch.description !== null) {
      return NextResponse.json({ error: 'Description must be a string or null' }, { status: 400 })
    }

    const description =
      typeof patch.description === 'string' ? patch.description.trim() : null

    if (description && description.length > 280) {
      return NextResponse.json(
        { error: 'Description must be 280 characters or fewer' },
        { status: 400 },
      )
    }

    data.description = description || null
  }

  if (!('name' in data) && !('image' in data) && !('description' in data)) {
    return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
  }

  const updated = await prisma.workspace.update({
    where: { slug },
    data,
    include: workspaceInclude,
  })

  if ('image' in data && workspace.image && workspace.image !== data.image) {
    await deleteAvatarByUrl(workspace.image).catch(() => {})
  }

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
  await deleteWorkspaceAvatars(workspace.id).catch(() => {})

  return new NextResponse(null, { status: 204 })
}

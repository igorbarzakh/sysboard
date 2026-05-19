import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
  isAllowedAvatarSize,
  isAllowedAvatarType,
  uploadWorkspaceAvatar,
} from '@shared/lib/avatarStorage'
import { authOptions, prisma } from '@shared/lib/server'

type RouteContext = { params: Promise<{ slug: string }> }

export async function POST(request: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const workspace = await prisma.workspace.findFirst({
    where: {
      slug,
      members: { some: { userId: session.user.id, role: { in: ['owner', 'admin'] } } },
    },
    select: { id: true },
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const formData = await request.formData().catch(() => null)
  const file = formData?.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Workspace image file is required' }, { status: 400 })
  }

  if (!isAllowedAvatarType(file.type)) {
    return NextResponse.json(
      { error: 'Workspace image must be a JPEG, PNG, or WebP image' },
      { status: 400 },
    )
  }

  if (!isAllowedAvatarSize(file.size)) {
    return NextResponse.json(
      { error: 'Workspace image must be 2 MB or smaller' },
      { status: 400 },
    )
  }

  try {
    const image = await uploadWorkspaceAvatar({
      contentType: file.type,
      data: await file.arrayBuffer(),
      source: 'manual',
      workspaceId: workspace.id,
    })

    return NextResponse.json({ image })
  } catch {
    return NextResponse.json({ error: 'Workspace image upload failed' }, { status: 500 })
  }
}

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
  deleteAvatarByUrl,
  isAllowedBoardPreviewSize,
  uploadBoardPreview,
} from '@shared/lib/avatarStorage'
import { authOptions, prisma } from '@shared/lib/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(
  request: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const board = await prisma.board.findFirst({
    where: {
      id,
      OR: [
        { workspace: { members: { some: { userId: session.user.id } } } },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    select: {
      dataVersion: true,
      previewUrl: true,
      previewVersion: true,
      updatedAt: true,
    },
  })

  if (!board) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const formData = await request.formData().catch(() => null)
  const rawVersion = formData?.get('version')
  const version = typeof rawVersion === 'string' ? Number(rawVersion) : Number.NaN
  const isEmpty = formData?.get('empty') === 'true'
  const file = formData?.get('file')

  if (!Number.isSafeInteger(version) || version < 0) {
    return NextResponse.json({ error: 'Invalid preview version' }, { status: 400 })
  }

  if (version !== board.dataVersion) {
    return NextResponse.json({ error: 'Preview is stale' }, { status: 409 })
  }

  let previewUrl: string | null = null
  if (!isEmpty) {
    if (!(file instanceof File) || file.type !== 'image/png') {
      return NextResponse.json({ error: 'PNG preview is required' }, { status: 400 })
    }
    if (!isAllowedBoardPreviewSize(file.size)) {
      return NextResponse.json({ error: 'Preview is too large' }, { status: 400 })
    }

    try {
      previewUrl = await uploadBoardPreview({
        boardId: id,
        data: await file.arrayBuffer(),
        version,
      })
    } catch {
      return NextResponse.json({ error: 'Preview upload failed' }, { status: 500 })
    }
  }

  const updated = await prisma.board.updateMany({
    where: {
      id,
      dataVersion: version,
      OR: [
        { previewVersion: { lt: version } },
        { previewUrl: null },
      ],
    },
    data: {
      previewUrl,
      previewVersion: version,
      updatedAt: board.updatedAt,
    },
  })

  if (updated.count === 0) {
    if (previewUrl) await deleteAvatarByUrl(previewUrl).catch(() => {})

    const current = await prisma.board.findUnique({
      where: { id },
      select: { dataVersion: true, previewUrl: true, previewVersion: true },
    })
    if (
      current?.dataVersion === version &&
      current.previewVersion === version
    ) {
      return NextResponse.json({
        previewUrl: current.previewUrl,
        previewVersion: current.previewVersion,
      })
    }

    return NextResponse.json({ error: 'Preview is stale' }, { status: 409 })
  }

  if (board.previewUrl && board.previewUrl !== previewUrl) {
    await deleteAvatarByUrl(board.previewUrl).catch(() => {})
  }

  return NextResponse.json({ previewUrl, previewVersion: version })
}

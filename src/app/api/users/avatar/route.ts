import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
  isAllowedAvatarSize,
  isAllowedAvatarType,
  uploadUserAvatar,
} from '@shared/lib/avatarStorage'
import { authOptions, prisma } from '@shared/lib'

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData().catch(() => null)
  const file = formData?.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Avatar file is required' }, { status: 400 })
  }

  if (!isAllowedAvatarType(file.type)) {
    return NextResponse.json(
      { error: 'Avatar must be a JPEG, PNG, or WebP image' },
      { status: 400 },
    )
  }

  if (!isAllowedAvatarSize(file.size)) {
    return NextResponse.json(
      { error: 'Avatar must be 2 MB or smaller' },
      { status: 400 },
    )
  }

  try {
    const image = await uploadUserAvatar({
      contentType: file.type,
      data: await file.arrayBuffer(),
      source: 'manual',
      userId: session.user.id,
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
    })

    return NextResponse.json({ image })
  } catch {
    return NextResponse.json({ error: 'Avatar upload failed' }, { status: 500 })
  }
}

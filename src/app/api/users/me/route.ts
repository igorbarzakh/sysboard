import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { isProfileRole } from '@entities/user/model'
import {
  deleteAvatarByUrl,
  deleteUserAvatars,
  isOwnedAvatarUrl,
} from '@shared/lib/avatarStorage'
import { authOptions, prisma, validateName } from '@shared/lib'

function readBodyField(body: unknown, field: string) {
  if (typeof body !== 'object' || body === null || !(field in body)) {
    return undefined
  }

  return (body as Record<string, unknown>)[field]
}

function normalizeProfileRole(value: unknown) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (typeof value !== 'string') return undefined

  return isProfileRole(value) ? value : undefined
}

function normalizeImage(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value === 'string' && isOwnedAvatarUrl(value)) return value
  return undefined
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const rawName = readBodyField(body, 'name')
  const profileRole = normalizeProfileRole(readBodyField(body, 'profileRole'))
  const rawImage = readBodyField(body, 'image')
  const nextImage = normalizeImage(rawImage)

  let name: string | undefined
  if (rawName !== undefined) {
    if (typeof rawName !== 'string') {
      return NextResponse.json({ error: 'Name must be a string' }, { status: 400 })
    }
    const result = validateName(rawName)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    name = result.value
  }

  if (profileRole === undefined && readBodyField(body, 'profileRole') !== undefined) {
    return NextResponse.json({ error: 'Invalid profile role' }, { status: 400 })
  }

  if (rawImage !== undefined && nextImage === undefined) {
    return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
  }

  let oldImage: string | null | undefined
  if (nextImage !== undefined) {
    const current = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    })
    oldImage = current?.image
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(profileRole !== undefined ? { profileRole } : {}),
      ...(nextImage !== undefined ? { image: nextImage } : {}),
    },
    select: {
      id: true,
      email: true,
      image: true,
      name: true,
      profileRole: true,
    },
  })

  if (oldImage && oldImage !== nextImage) {
    await deleteAvatarByUrl(oldImage).catch(() => {})
  }

  return NextResponse.json({ user })
}

export async function DELETE(): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deleteUserAvatars(session.user.id)
    await prisma.user.delete({ where: { id: session.user.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Account deletion failed' }, { status: 500 })
  }
}

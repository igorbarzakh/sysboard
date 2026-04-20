import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { isProfileRole } from '@entities/user/model'
import { deleteUserAvatars } from '@shared/lib/avatarStorage'
import { authOptions, prisma } from '@shared/lib'

const MAX_NAME_LENGTH = 80

function readBodyField(body: unknown, field: string) {
  if (typeof body !== 'object' || body === null || !(field in body)) {
    return undefined
  }

  return (body as Record<string, unknown>)[field]
}

function normalizeName(value: unknown) {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'string') return undefined

  const name = value.trim()
  return name.length > 0 ? name : null
}

function normalizeProfileRole(value: unknown) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (typeof value !== 'string') return undefined

  return isProfileRole(value) ? value : undefined
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const name = normalizeName(readBodyField(body, 'name'))
  const profileRole = normalizeProfileRole(readBodyField(body, 'profileRole'))

  if (name === undefined && readBodyField(body, 'name') !== undefined) {
    return NextResponse.json({ error: 'Name must be a string or null' }, { status: 400 })
  }

  if (typeof name === 'string' && name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` },
      { status: 400 },
    )
  }

  if (profileRole === undefined && readBodyField(body, 'profileRole') !== undefined) {
    return NextResponse.json({ error: 'Invalid profile role' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(profileRole !== undefined ? { profileRole } : {}),
    },
    select: {
      id: true,
      email: true,
      image: true,
      name: true,
      profileRole: true,
    },
  })

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

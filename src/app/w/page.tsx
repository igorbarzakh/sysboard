import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { customAlphabet } from 'nanoid'
import { authOptions, prisma } from '@shared/lib'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4)

function deriveSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 46) +
    '-' +
    nanoid()
  )
}

export default async function WorkspaceRedirectPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId: session.user.id } } },
    orderBy: { createdAt: 'asc' },
    select: { slug: true },
  })

  if (workspace) {
    redirect(`/w/${workspace.slug}`)
  }

  const workspaceName = `${session.user.name ?? 'My'}'s Workspace`
  const created = await prisma.workspace.create({
    data: {
      name: workspaceName,
      slug: deriveSlug(workspaceName),
      ownerId: session.user.id,
      plan: session.user.plan ?? 'free',
      members: {
        create: { userId: session.user.id, role: 'owner' },
      },
    },
    select: { slug: true },
  })

  redirect(`/w/${created.slug}`)
}

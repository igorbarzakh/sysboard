import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions, deriveSlug, prisma } from '@shared/lib'

export default async function WorkspaceRedirectPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId: session.user.id } } },
    orderBy: { createdAt: 'asc' },
    select: { slug: true },
  })

  if (workspace) {
    redirect(`/workspace/${workspace.slug}`)
  }

  const workspaceName = `${session.user.name ?? 'My'}'s Workspace`
  const created = await prisma.workspace.create({
    data: {
      name: workspaceName,
      slug: deriveSlug(),
      ownerId: session.user.id,
      plan: session.user.plan ?? 'free',
      members: {
        create: { userId: session.user.id, role: 'owner' },
      },
    },
    select: { slug: true },
  })

  redirect(`/workspace/${created.slug}`)
}

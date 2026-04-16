import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions, prisma } from '@shared/lib'

export default async function WorkspaceRedirectPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId: session.user.id } } },
    orderBy: { createdAt: 'asc' },
    select: { slug: true },
  })

  if (!workspace) redirect('/')

  redirect(`/workspace/${workspace.slug}`)
}

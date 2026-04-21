import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions, prisma } from '@shared/lib'

export default async function WorkspaceRedirectPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const cookieStore = await cookies()
  const lastSlug = cookieStore.get('last-workspace')?.value

  if (lastSlug) {
    const last = await prisma.workspace.findFirst({
      where: { slug: lastSlug, members: { some: { userId: session.user.id } } },
      select: { slug: true },
    })
    if (last) redirect(`/workspace/${last.slug}`)
  }

  const workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId: session.user.id } } },
    orderBy: { createdAt: 'asc' },
    select: { slug: true },
  })

  if (!workspace) redirect('/')

  redirect(`/workspace/${workspace.slug}`)
}

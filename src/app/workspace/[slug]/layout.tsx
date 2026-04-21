import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions, prisma } from '@shared/lib/server'
import { AppHeader } from '@widgets/app-header/ui'
import { WorkspaceSidebar } from '@widgets/workspace-sidebar/ui'
import type { Workspace } from '@entities/workspace/model'
import styles from './layout.module.scss'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function WorkspaceLayout({ children, params }: LayoutProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { slug } = await params

  const raw = await prisma.workspace.findFirst({
    where: {
      slug,
      members: { some: { userId: session.user.id } },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      },
      _count: { select: { boards: true } },
    },
  })

  if (!raw) redirect('/workspace')

  const workspace: Workspace = {
    ...raw,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    members: raw.members.map((m) => ({
      userId: m.userId,
      role: m.role as Workspace['members'][number]['role'],
      joinedAt: m.joinedAt.toISOString(),
      user: m.user,
    })),
  }

  return (
    <div className={styles.root}>
      <WorkspaceSidebar workspace={workspace} />
      <div className={styles.app}>
        <AppHeader />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}

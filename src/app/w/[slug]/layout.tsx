import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/db'
import { DashboardHeader } from '@/widgets/dashboard-header'
import { WorkspaceSidebar } from '@/widgets/workspace-sidebar'
import { PLAN_LIMITS } from '@/shared/lib/constants'
import type { UserPlan } from '@/shared/lib/constants'
import type { Workspace } from '@/entities/workspace'

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

  if (!raw) redirect('/dashboard')

  const workspace: Workspace = {
    ...raw,
    plan: raw.plan as UserPlan,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    members: raw.members.map((m) => ({
      userId: m.userId,
      role: m.role as Workspace['members'][number]['role'],
      joinedAt: m.joinedAt.toISOString(),
      user: m.user,
    })),
  }

  const workspaceCount = await prisma.workspace.count({
    where: { ownerId: session.user.id },
  })
  const plan = (session.user.plan ?? 'free') as UserPlan
  const canCreateWorkspace = workspaceCount < PLAN_LIMITS[plan].maxWorkspaces

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-canvas">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar workspace={workspace} canCreateWorkspace={canCreateWorkspace} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

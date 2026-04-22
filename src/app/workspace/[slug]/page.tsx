import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { PLAN_LIMITS } from '@shared/lib'
import { authOptions, prisma } from '@shared/lib/server'
import type { UserPlan } from '@shared/lib'
import { WorkspaceOverviewPage } from '@pages/workspace-overview'

type PageProps = { params: Promise<{ slug: string }> }

export const metadata: Metadata = {
  title: 'Main',
}

export default async function WorkspacePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { slug } = await params
  const workspace = await prisma.workspace.findFirst({
    where: { slug, members: { some: { userId: session.user.id } } },
    select: { owner: { select: { plan: true } } },
  })

  if (!workspace) redirect('/workspace')

  const boardLimit =
    PLAN_LIMITS[workspace.owner.plan as UserPlan].maxBoardsPerWorkspace

  return (
    <WorkspaceOverviewPage
      boardLimit={boardLimit}
      currentUserId={session.user.id}
      workspaceSlug={slug}
    />
  )
}

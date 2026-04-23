import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { PLAN_LIMITS } from '@shared/lib'
import { authOptions, prisma } from '@shared/lib/server'
import type { UserPlan } from '@shared/lib'

type PageProps = { searchParams: Promise<{ workspace?: string }> }

export const metadata: Metadata = {
  title: 'New Board',
}

export default async function NewBoardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { workspace: slug } = await searchParams
  if (!slug) redirect('/')

  const workspace = await prisma.workspace.findFirst({
    where: { slug, members: { some: { userId: session.user.id } } },
    select: { id: true, owner: { select: { plan: true } }, slug: true },
  })
  if (!workspace) redirect('/')

  const plan = workspace.owner.plan as UserPlan
  const limit = PLAN_LIMITS[plan].maxBoardsPerWorkspace
  const boardCount = await prisma.board.count({ where: { workspaceId: workspace.id } })
  if (boardCount >= limit) redirect(`/workspace/${workspace.slug}`)

  const board = await prisma.board.create({
    data: {
      name: 'Untitled board',
      workspaceId: workspace.id,
      createdById: session.user.id,
      members: { create: { userId: session.user.id, role: 'editor' } },
    },
    select: { id: true },
  })

  redirect(`/board/${board.id}`)
}

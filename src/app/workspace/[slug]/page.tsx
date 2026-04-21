import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/server'
import { WorkspaceOverviewPage } from '@pages/workspace-overview'

type PageProps = { params: Promise<{ slug: string }> }

export const metadata: Metadata = {
  title: 'Main',
}

export default async function WorkspacePage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  const { slug } = await params

  return <WorkspaceOverviewPage currentUserId={session.user.id} workspaceSlug={slug} />
}

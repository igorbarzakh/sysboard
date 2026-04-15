'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { Workspace } from '../model'

interface UseCurrentWorkspaceResult {
  workspace: Workspace | null
  isLoading: boolean
}

export function useCurrentWorkspace(): UseCurrentWorkspaceResult {
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : null

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setWorkspace(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/workspaces/${slug}`)
        if (!res.ok) {
          if (!cancelled) setWorkspace(null)
          return
        }
        const data = (await res.json()) as Workspace
        if (!cancelled) setWorkspace(data)
      } catch {
        if (!cancelled) setWorkspace(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [slug])

  return { workspace, isLoading }
}

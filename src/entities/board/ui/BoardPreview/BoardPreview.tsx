'use client'

import { memo } from 'react'
import { TldrawImage } from 'tldraw'
import type { TLStoreSnapshot } from 'tldraw'

interface BoardPreviewProps {
  data: unknown
}

export const BoardPreview = memo(function BoardPreview({
  data,
}: BoardPreviewProps) {
  if (!data || typeof data !== 'object') return null

  return (
    <TldrawImage
      snapshot={data as TLStoreSnapshot}
      format="svg"
      background={true}
      padding={8}
      darkMode={false}
    />
  )
})

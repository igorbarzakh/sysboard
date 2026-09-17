'use client'

import Image from 'next/image'
import { memo, useEffect, useMemo, useRef } from 'react'
import { TldrawImage } from 'tldraw'
import type { TLStoreSnapshot } from 'tldraw'
import { uploadBoardPreview } from '../../api'
import { normalizeBoardPreview } from '../../lib'
import styles from './BoardPreview.module.scss'

interface BoardPreviewProps {
  boardId: string
  data: unknown
  dataVersion: number
  onPreviewReady: (
    boardId: string,
    previewUrl: string | null,
    previewVersion: number,
  ) => void
  previewUrl: string | null
  previewVersion: number
}

let previewUploadQueue: Promise<unknown> = Promise.resolve()

function enqueuePreviewUpload(
  boardId: string,
  dataVersion: number,
  file: Blob | null,
) {
  const upload = previewUploadQueue.then(() =>
    uploadBoardPreview(boardId, dataVersion, file),
  )
  previewUploadQueue = upload.catch(() => {})
  return upload
}

export const BoardPreview = memo(function BoardPreview({
  boardId,
  data,
  dataVersion,
  onPreviewReady,
  previewUrl,
  previewVersion,
}: BoardPreviewProps) {
  const generatorRef = useRef<HTMLDivElement>(null)
  const uploadKey = useRef<string | null>(null)
  const isStale = previewVersion < dataVersion
  const shouldGenerate = isStale && !previewUrl
  const hasShapes = useMemo(() => snapshotHasShapes(data), [data])

  useEffect(() => {
    if (!shouldGenerate || !data || typeof data !== 'object') return

    const currentKey = `${boardId}:${dataVersion}`

    async function publishPreview(file: Blob | null) {
      if (uploadKey.current === currentKey) return
      uploadKey.current = currentKey

      try {
        const result = await enqueuePreviewUpload(boardId, dataVersion, file)
        onPreviewReady(boardId, result.previewUrl, result.previewVersion)
      } catch {
        uploadKey.current = null
      }
    }

    if (!hasShapes) {
      void publishPreview(null)
      return
    }

    const generator = generatorRef.current
    if (!generator) return

    function publishRenderedImage() {
      const image = generator?.querySelector('img')
      if (!image?.src.startsWith('blob:')) return

      void fetch(image.src)
        .then((response) => response.blob())
        .then(normalizeBoardPreview)
        .then((blob) => publishPreview(blob))
        .catch(() => {})
    }

    const observer = new MutationObserver(publishRenderedImage)
    observer.observe(generator, {
      attributeFilter: ['src'],
      attributes: true,
      childList: true,
      subtree: true,
    })
    publishRenderedImage()

    return () => observer.disconnect()
  }, [boardId, data, dataVersion, hasShapes, onPreviewReady, shouldGenerate])

  return (
    <div className={styles.root}>
      {previewUrl ? (
        <Image
          alt=""
          className={styles.image}
          fill
          loading="eager"
          sizes="(max-width: 768px) 100vw, 320px"
          src={previewUrl}
        />
      ) : null}

      {shouldGenerate && hasShapes && data && typeof data === 'object' ? (
        <div
          ref={generatorRef}
          className={previewUrl ? styles.generator : styles.livePreview}
        >
          <TldrawImage
            snapshot={data as TLStoreSnapshot}
            format="png"
            background={true}
            padding={64}
            pixelRatio={1}
            darkMode={false}
          />
        </div>
      ) : null}
    </div>
  )
})

function snapshotHasShapes(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false

  const snapshot = data as Record<string, unknown>
  const document = snapshot.document
  const storeContainer =
    document && typeof document === 'object'
      ? (document as Record<string, unknown>)
      : snapshot
  const store = storeContainer.store

  if (!store || typeof store !== 'object') return false
  return Object.values(store).some((record) => {
    return (
      typeof record === 'object' &&
      record !== null &&
      (record as Record<string, unknown>).typeName === 'shape'
    )
  })
}

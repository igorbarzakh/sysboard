const PREVIEW_WIDTH = 1280
const PREVIEW_HEIGHT = 720
const PREVIEW_PADDING = 64
const BACKGROUND_TOLERANCE = 12

interface ContentBounds {
  height: number
  width: number
  x: number
  y: number
}

function findContentBounds(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): ContentBounds | null {
  const { data } = context.getImageData(0, 0, width, height)
  const background = [data[0], data[1], data[2], data[3]]
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4
      const differs = background.some((channel, index) =>
        Math.abs(data[offset + index] - channel) > BACKGROUND_TOLERANCE,
      )

      if (!differs) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  if (maxX < minX || maxY < minY) return null
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

export async function normalizeBoardPreview(blob: Blob): Promise<Blob> {
  const image = await createImageBitmap(blob)
  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = image.width
  sourceCanvas.height = image.height
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true })

  if (!sourceContext) {
    image.close()
    throw new Error('Canvas is not available')
  }

  sourceContext.drawImage(image, 0, 0)
  const bounds = findContentBounds(sourceContext, image.width, image.height)
  const canvas = document.createElement('canvas')
  canvas.width = PREVIEW_WIDTH
  canvas.height = PREVIEW_HEIGHT

  const context = canvas.getContext('2d')
  if (!context) {
    image.close()
    throw new Error('Canvas is not available')
  }

  context.fillStyle = '#f8fafc'
  context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT)

  if (!bounds) {
    image.close()
    return encodeCanvas(canvas)
  }

  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / bounds.width,
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / bounds.height,
  )
  const width = bounds.width * scale
  const height = bounds.height * scale

  context.drawImage(
    image,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    (PREVIEW_WIDTH - width) / 2,
    (PREVIEW_HEIGHT - height) / 2,
    width,
    height,
  )
  image.close()

  return encodeCanvas(canvas)
}

function encodeCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error('Preview encoding failed'))
    }, 'image/png')
  })
}

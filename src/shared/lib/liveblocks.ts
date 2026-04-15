import { Liveblocks } from '@liveblocks/node'

let liveblocks: Liveblocks | null = null

export function getLiveblocks(): Liveblocks {
  liveblocks ??= new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  })

  return liveblocks
}

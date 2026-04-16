import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 12)

export function deriveSlug(): string {
  return nanoid()
}

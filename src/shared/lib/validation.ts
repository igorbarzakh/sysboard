const CONTROL_CHARS = /[\x00-\x1f\x7f-\x9f]/g
export const MAX_NAME_LENGTH = 70

export type NameValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string }

export function validateName(raw: string): NameValidationResult {
  const value = raw.replace(CONTROL_CHARS, '').trim()

  if (value.length === 0) {
    return { ok: false, error: 'Name cannot be empty' }
  }

  if (value.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` }
  }

  return { ok: true, value }
}

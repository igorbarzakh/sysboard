'use client'

import * as React from 'react'
import { signOut, useSession } from 'next-auth/react'
import { HeartCrack, Upload } from 'lucide-react'
import {
  PROFILE_ROLE_OPTIONS,
  type ProfileRole,
  type CurrentUser,
} from '@entities/user/model'
import { validateName, MAX_NAME_LENGTH } from '@shared/lib'
import {
  Avatar,
  Button,
  DangerDialog,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  type SelectOption,
} from '@shared/ui'
import styles from './UserSettingsModal.module.scss'

const EMPTY_ROLE_VALUE = '__empty__'

type RoleSelectValue = ProfileRole | typeof EMPTY_ROLE_VALUE

interface UserSettingsModalProps {
  open: boolean
  user: CurrentUser
  onOpenChange: (open: boolean) => void
}

interface ProfileResponse {
  image?: string
  user?: {
    image?: string | null
    name?: string | null
    profileRole?: ProfileRole | null
  }
  error?: string
}

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  discord: 'Discord',
}

const ROLE_OPTIONS: Array<SelectOption<RoleSelectValue>> = [
  { label: 'No role', value: EMPTY_ROLE_VALUE },
  ...PROFILE_ROLE_OPTIONS,
]

async function readJsonResponse(response: Response): Promise<ProfileResponse> {
  const body: unknown = await response.json().catch(() => ({}))
  return typeof body === 'object' && body !== null ? body : {}
}

export function UserSettingsModal({
  open,
  user,
  onOpenChange,
}: UserSettingsModalProps) {
  const { update } = useSession()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [name, setName] = React.useState(user.name ?? '')
  const [image, setImage] = React.useState(user.image)
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [profileRole, setProfileRole] = React.useState<ProfileRole | null>(
    user.profileRole,
  )
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [avatarError, setAvatarError] = React.useState<string | null>(null)

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  React.useEffect(() => {
    if (!open) return

    setName(user.name ?? '')
    setImage(user.image)
    setPendingFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setProfileRole(user.profileRole)
    setAvatarError(null)
  }, [open, user.image, user.name, user.profileRole])

  const isBusy = isSaving || isDeleting
  const isNameValid = name.trim().length > 0
  const roleValue = profileRole ?? EMPTY_ROLE_VALUE
  const displayImage = previewUrl ?? image

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
    const MAX_BYTES = 2 * 1024 * 1024

    if (!ALLOWED_TYPES.has(file.type)) {
      setAvatarError('File must be a JPEG, PNG, or WebP image')
      return
    }

    if (file.size > MAX_BYTES) {
      setAvatarError('File must be 2 MB or smaller')
      return
    }

    setAvatarError(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setPendingFile(file)
  }

  function handleDeleteAvatar() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setPendingFile(null)
    setImage(null)
  }

  async function handleSave(event: { preventDefault(): void }) {
    event.preventDefault()

    const nameResult = validateName(name)
    if (!nameResult.ok) return

    const nextName = nameResult.value
    setIsSaving(true)

    try {
      let nextImage = image

      if (pendingFile) {
        const formData = new FormData()
        formData.append('file', pendingFile)
        const uploadResponse = await fetch('/api/users/avatar', {
          method: 'POST',
          body: formData,
        })
        const uploadBody = await readJsonResponse(uploadResponse)

        if (!uploadResponse.ok || typeof uploadBody.image !== 'string') {
          throw new Error(uploadBody.error ?? 'Avatar upload failed')
        }

        nextImage = uploadBody.image
      }

      const imageChanged = nextImage !== user.image
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nextName,
          profileRole,
          ...(imageChanged ? { image: nextImage } : {}),
        }),
      })
      const body = await readJsonResponse(response)

      if (!response.ok || !body.user) {
        throw new Error(body.error ?? 'Profile update failed')
      }

      setName(body.user.name ?? '')
      setProfileRole(body.user.profileRole ?? null)
      setImage(body.user.image ?? null)
      setPendingFile(null)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      await update({
        image: body.user.image ?? null,
        name: body.user.name ?? null,
        profileRole: body.user.profileRole ?? null,
      })
      onOpenChange(false)
    } catch {
      // silent — user can retry via Save button
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true)

    try {
      const response = await fetch('/api/users/me', { method: 'DELETE' })
      const body = await readJsonResponse(response)

      if (!response.ok) {
        throw new Error(body.error ?? 'Account deletion failed')
      }

      await signOut({ callbackUrl: '/' })
    } catch {
      setIsDeleteOpen(false)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={styles.content}>
          <form className={styles.form} onSubmit={handleSave}>
            <DialogHeader className={styles.header}>
              <DialogTitle className={styles.title}>
                Profile Settings
              </DialogTitle>
            </DialogHeader>

            <div className={styles.divider} />

            <div className={styles.avatarSection}>
              <div className={styles.avatarPreview}>
                <Avatar name={name || user.email} image={displayImage} size="lg" />
              </div>
              <div className={styles.avatarRight}>
                <div className={styles.avatarButtons}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={styles.fileInput}
                    onChange={handleAvatarChange}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={13} />
                    Upload Picture
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy || (!image && !pendingFile)}
                    onClick={handleDeleteAvatar}
                  >
                    Delete
                  </Button>
                </div>
                <div className={styles.avatarMeta}>
                  <p className={styles.avatarHint}>
                    File type: .png, .jpeg, .webp
                    <br />
                    Max file size: 2 MB
                  </p>
                  <p className={styles.avatarError}>{avatarError}</p>
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.fields}>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <span className={styles.label}>Name</span>
                  <span className={styles.charCount}>
                    {name.length}/{MAX_NAME_LENGTH}
                  </span>
                </div>
                <Input
                  value={name}
                  maxLength={MAX_NAME_LENGTH}
                  disabled={isBusy}
                  placeholder="Your name"
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Email Address</span>
                <Input value={user.email} disabled readOnly />
                {user.provider ? (
                  <span className={styles.emailHint}>
                    Managed by {PROVIDER_LABELS[user.provider] ?? user.provider}
                  </span>
                ) : null}
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Job Role</span>
                <Select<RoleSelectValue>
                  value={roleValue}
                  options={ROLE_OPTIONS}
                  disabled={isBusy}
                  triggerClassName={styles.roleTrigger}
                  contentClassName={styles.roleContent}
                  alignItemWithTrigger
                  onChange={(value) => {
                    setProfileRole(value === EMPTY_ROLE_VALUE ? null : value)
                  }}
                />
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.danger}>
              <p className={styles.dangerTitle}>Danger Zone</p>
              <p className={styles.dangerSubtitle}>
                Actions in this section are permanent and cannot be undone.
              </p>
              <Button
                type="button"
                variant="ghost"
                disabled={isBusy}
                className={styles.dangerButton}
                onClick={() => setIsDeleteOpen(true)}
              >
                Delete Account
              </Button>
            </div>

            <div className={styles.divider} />

            <DialogFooter className={styles.footer}>
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isBusy || !isNameValid}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DangerDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        icon={<HeartCrack size={22} />}
        title="Delete account?"
        description="This removes your account, workspaces, boards, sessions, and saved avatar files. This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete account'}
        isConfirming={isDeleting}
        onConfirm={handleDeleteAccount}
      />
    </>
  )
}

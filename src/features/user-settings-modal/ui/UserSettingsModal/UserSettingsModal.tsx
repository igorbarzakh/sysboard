'use client'

import * as React from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Upload } from 'lucide-react'
import {
  PROFILE_ROLE_OPTIONS,
  type ProfileRole,
  type CurrentUser,
} from '@entities/user/model'
import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
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
  const [profileRole, setProfileRole] = React.useState<ProfileRole | null>(
    user.profileRole,
  )
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return

    setName(user.name ?? '')
    setImage(user.image)
    setProfileRole(user.profileRole)
    setError(null)
  }, [open, user.image, user.name, user.profileRole])

  const isBusy = isSaving || isUploading || isDeleting
  const roleValue = profileRole ?? EMPTY_ROLE_VALUE
  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)
    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      })
      const body = await readJsonResponse(response)

      if (!response.ok || typeof body.image !== 'string') {
        throw new Error(body.error ?? 'Avatar upload failed')
      }

      setImage(body.image)
      await update({ image: body.image })
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Avatar upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    const nextName = name.trim() || null

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nextName,
          profileRole,
        }),
      })
      const body = await readJsonResponse(response)

      if (!response.ok || !body.user) {
        throw new Error(body.error ?? 'Profile update failed')
      }

      setName(body.user.name ?? '')
      setProfileRole(body.user.profileRole ?? null)
      await update({
        image,
        name: body.user.name ?? null,
        profileRole: body.user.profileRole ?? null,
      })
      onOpenChange(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Profile update failed')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setError(null)
    setIsDeleting(true)

    try {
      const response = await fetch('/api/users/me', { method: 'DELETE' })
      const body = await readJsonResponse(response)

      if (!response.ok) {
        throw new Error(body.error ?? 'Account deletion failed')
      }

      await signOut({ callbackUrl: '/' })
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Account deletion failed')
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
              <DialogTitle className={styles.title}>Profile Settings</DialogTitle>
            </DialogHeader>

            <div className={styles.divider} />

            <div className={styles.avatarSection}>
              <div className={styles.avatarPreview}>
                <Avatar name={name || user.email} image={image} size="lg" />
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
                    {isUploading ? 'Uploading…' : 'Upload Picture'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy || !image}
                    onClick={() => setImage(null)}
                  >
                    Delete
                  </Button>
                </div>
                <p className={styles.avatarHint}>
                  File type: .png, .jpeg, .webp
                  <br />
                  Max file size: 2 MB
                </p>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.fields}>
              <label className={styles.field}>
                <span className={styles.label}>Name</span>
                <Input
                  value={name}
                  maxLength={80}
                  disabled={isBusy}
                  placeholder="Your name"
                  onChange={(event) => setName(event.target.value)}
                />
              </label>

              <div className={styles.field}>
                <span className={styles.label}>Email Address</span>
                <Input value={user.email} disabled readOnly />
                {user.provider ? (
                  <span className={styles.emailHint}>
                    Managed by {PROVIDER_LABELS[user.provider] ?? user.provider}
                  </span>
                ) : null}
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Job Role</span>
                <Select<RoleSelectValue>
                  value={roleValue}
                  options={ROLE_OPTIONS}
                  disabled={isBusy}
                  triggerClassName={styles.roleTrigger}
                  contentClassName={styles.roleContent}
                  onChange={(value) => {
                    setProfileRole(value === EMPTY_ROLE_VALUE ? null : value)
                  }}
                />
              </label>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}

            <div className={styles.divider} />

            <div className={styles.danger}>
              <div>
                <p className={styles.dangerTitle}>Delete account</p>
                <p className={styles.dangerDescription}>
                  Remove your account and all related records.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isBusy}
                onClick={() => setIsDeleteOpen(true)}
              >
                Delete
              </Button>
            </div>

            <DialogFooter className={styles.footer}>
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isBusy}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className={styles.deleteContent}>
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This removes your account, workspaces, boards, sessions, and saved avatar files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? 'Deleting…' : 'Delete account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

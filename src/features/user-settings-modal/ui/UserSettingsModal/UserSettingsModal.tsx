'use client'

import * as React from 'react'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { HeartCrack } from 'lucide-react'
import { type CurrentUser, type ProfileRole } from '@entities/user/model'
import { validateName } from '@shared/lib'
import {
  Button,
  DangerDialog,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui'
import {
  deleteAccount,
  updateProfile,
  uploadAvatar,
  type UpdateProfilePayload,
} from '../../api'
import { AvatarSettingsSection } from './AvatarSettingsSection/AvatarSettingsSection'
import { DangerZone } from './DangerZone/DangerZone'
import { ProfileFields } from './ProfileFields/ProfileFields'
import styles from './UserSettingsModal.module.scss'

const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_AVATAR_BYTES = 2 * 1024 * 1024

interface UserSettingsModalProps {
  open: boolean
  user: CurrentUser
  onOpenChange: (open: boolean) => void
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
  const nameResult = validateName(name)
  const isNameValid = nameResult.ok
  const normalizedName = nameResult.ok ? nameResult.value : name.trim()
  const displayImage = previewUrl ?? image
  const hasChanges =
    normalizedName !== (user.name ?? '') ||
    profileRole !== user.profileRole ||
    image !== user.image ||
    pendingFile !== null

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setAvatarError('File must be a JPEG, PNG, or WebP image')
      return
    }

    if (file.size > MAX_AVATAR_BYTES) {
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

    if (!nameResult.ok) return

    const nextName = nameResult.value
    const hasProfileChanges =
      nextName !== (user.name ?? '') ||
      profileRole !== user.profileRole ||
      image !== user.image ||
      pendingFile !== null

    if (!hasProfileChanges) return

    setIsSaving(true)

    try {
      let nextImage = image

      if (pendingFile) {
        nextImage = await uploadAvatar(pendingFile)
      }

      const imageChanged = nextImage !== user.image
      const payload: UpdateProfilePayload = {
        ...(nextName !== (user.name ?? '') ? { name: nextName } : {}),
        ...(profileRole !== user.profileRole ? { profileRole } : {}),
        ...(imageChanged ? { image: nextImage } : {}),
      }
      const updatedUser = await updateProfile(payload)

      setName(updatedUser.name ?? '')
      setProfileRole(updatedUser.profileRole ?? null)
      setImage(updatedUser.image ?? null)
      setPendingFile(null)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      await update({
        image: updatedUser.image ?? null,
        name: updatedUser.name ?? null,
        profileRole: updatedUser.profileRole ?? null,
      })
      onOpenChange(false)
      toast.success('Profile saved')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Profile update failed',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true)

    try {
      await deleteAccount()
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
                Edit profile
              </DialogTitle>
            </DialogHeader>

            <div className={styles.divider} />

            <AvatarSettingsSection
              avatarError={avatarError}
              canDelete={Boolean(image || pendingFile)}
              disabled={isBusy}
              displayImage={displayImage}
              fileInputRef={fileInputRef}
              name={name}
              userEmail={user.email}
              onAvatarChange={handleAvatarChange}
              onDeleteAvatar={handleDeleteAvatar}
            />

            <div className={styles.divider} />

            <ProfileFields
              disabled={isBusy}
              name={name}
              profileRole={profileRole}
              user={user}
              onNameChange={setName}
              onProfileRoleChange={setProfileRole}
            />

            <div className={styles.divider} />

            <DangerZone
              disabled={isBusy}
              onDeleteClick={() => setIsDeleteOpen(true)}
            />

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
              <Button
                type="submit"
                disabled={isBusy || !isNameValid || !hasChanges}
              >
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

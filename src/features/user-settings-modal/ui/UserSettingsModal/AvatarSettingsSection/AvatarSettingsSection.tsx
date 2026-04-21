import type * as React from 'react'
import { Upload } from 'lucide-react'
import { Avatar, Button } from '@shared/ui'
import styles from './AvatarSettingsSection.module.scss'

interface AvatarSettingsSectionProps {
  avatarError: string | null
  canDelete: boolean
  disabled: boolean
  displayImage: string | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  name: string
  userEmail: string
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDeleteAvatar: () => void
}

export function AvatarSettingsSection({
  avatarError,
  canDelete,
  disabled,
  displayImage,
  fileInputRef,
  name,
  userEmail,
  onAvatarChange,
  onDeleteAvatar,
}: AvatarSettingsSectionProps) {
  return (
    <div className={styles.root}>
      <div className={styles.preview}>
        <Avatar name={name || userEmail} image={displayImage} size="xl" />
      </div>
      <div className={styles.content}>
        <div className={styles.actions}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.fileInput}
            onChange={onAvatarChange}
          />
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={13} />
            Upload Picture
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || !canDelete}
            onClick={onDeleteAvatar}
          >
            Delete
          </Button>
        </div>
        <div className={styles.meta}>
          <p className={styles.hint}>
            File type: .png, .jpeg, .webp
            <br />
            Max file size: 2 MB
          </p>
          <p className={styles.error}>{avatarError}</p>
        </div>
      </div>
    </div>
  )
}

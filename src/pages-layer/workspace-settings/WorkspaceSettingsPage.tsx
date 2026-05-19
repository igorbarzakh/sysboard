'use client'

import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { AlertTriangle, CreditCard, LogOut, Upload } from 'lucide-react'
import {
  useDeleteWorkspaceMutation,
  useLeaveWorkspaceMutation,
  useUpdateWorkspaceMutation,
} from '@entities/workspace/hooks'
import type { WorkspaceRole } from '@entities/workspace/model'
import { uploadWorkspaceImage } from '@entities/workspace/api'
import {
  MAX_NAME_LENGTH,
  PLAN_LIMITS,
  validateName,
  type UserPlan,
} from '@shared/lib'
import { Avatar, Button, DangerDialog, Input, Textarea } from '@shared/ui'
import styles from './WorkspaceSettingsPage.module.scss'

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const MAX_DESCRIPTION_LENGTH = 280
const WORKSPACE_SETTINGS_FORM_ID = 'workspace-settings-form'

interface WorkspaceSettingsPageProps {
  workspace: {
    activeInviteCount: number
    boardCount: number
    currentUserRole: WorkspaceRole
    description: string | null
    image: string | null
    memberCount: number
    name: string
    plan: UserPlan
    slug: string
  }
}

export function WorkspaceSettingsPage({
  workspace,
}: WorkspaceSettingsPageProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [savedName, setSavedName] = useState(workspace.name)
  const [savedDescription, setSavedDescription] = useState(
    workspace.description ?? '',
  )
  const [savedImage, setSavedImage] = useState(workspace.image)
  const [name, setName] = useState(workspace.name)
  const [description, setDescription] = useState(workspace.description ?? '')
  const [image, setImage] = useState(workspace.image)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const updateWorkspaceMutation = useUpdateWorkspaceMutation(workspace.slug)
  const deleteWorkspaceMutation = useDeleteWorkspaceMutation(workspace.slug)
  const leaveWorkspaceMutation = useLeaveWorkspaceMutation(workspace.slug)

  const canManageWorkspace = workspace.currentUserRole === 'owner'
  const canDeleteWorkspace = workspace.currentUserRole === 'owner'
  const canLeaveWorkspace = workspace.currentUserRole !== 'owner'
  const nameResult = validateName(name)
  const normalizedName = nameResult.ok ? nameResult.value : name.trim()
  const normalizedDescription = description.trim()
  const hasNameChange = normalizedName !== savedName
  const hasDescriptionChange = normalizedDescription !== savedDescription
  const hasImageChange = image !== savedImage || pendingFile !== null
  const hasChanges = hasNameChange || hasDescriptionChange || hasImageChange
  const isDescriptionValid = description.length <= MAX_DESCRIPTION_LENGTH
  const displayImage = previewUrl ?? image
  const isBusy =
    updateWorkspaceMutation.isPending ||
    deleteWorkspaceMutation.isPending ||
    leaveWorkspaceMutation.isPending
  const planLimits = PLAN_LIMITS[workspace.plan]
  const usedMemberSlots = workspace.memberCount + workspace.activeInviteCount
  const memberUsageLabel =
    workspace.activeInviteCount > 0
      ? `${workspace.memberCount} members + ${workspace.activeInviteCount} pending`
      : `${workspace.memberCount} members`

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setImageError('File must be a JPEG, PNG, or WebP image')
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('File must be 2 MB or smaller')
      return
    }

    setImageError(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setPendingFile(file)
  }

  function handleDeleteImage() {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setPendingFile(null)
    setImage(null)
    setImageError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !canManageWorkspace ||
      !hasChanges ||
      isBusy ||
      !nameResult.ok ||
      !isDescriptionValid
    ) {
      return
    }

    setError(null)

    try {
      let nextImage = image

      if (pendingFile) {
        nextImage = await uploadWorkspaceImage(workspace.slug, pendingFile)
      }

      const updated = await updateWorkspaceMutation.mutateAsync({
        ...(hasNameChange ? { name: normalizedName } : {}),
        ...(hasDescriptionChange
          ? { description: normalizedDescription || null }
          : {}),
        ...(nextImage !== savedImage ? { image: nextImage } : {}),
      })

      setSavedName(updated.name)
      setSavedDescription(updated.description ?? '')
      setSavedImage(updated.image)
      setName(updated.name)
      setDescription(updated.description ?? '')
      setImage(updated.image)
      setPendingFile(null)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      router.refresh()
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Unable to update workspace',
      )
    }
  }

  async function handleDelete() {
    if (!canDeleteWorkspace || isBusy) return

    setError(null)

    try {
      await deleteWorkspaceMutation.mutateAsync()
      router.push('/workspace')
      router.refresh()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete workspace',
      )
    }
  }

  async function handleLeave() {
    if (!canLeaveWorkspace || isBusy) return

    setError(null)

    try {
      await leaveWorkspaceMutation.mutateAsync()
      router.push('/workspace')
      router.refresh()
    } catch (leaveError) {
      setError(
        leaveError instanceof Error
          ? leaveError.message
          : 'Unable to leave workspace',
      )
    }
  }

  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Settings</h1>
        </div>
        {canManageWorkspace ? (
          <Button
            type="submit"
            form={WORKSPACE_SETTINGS_FORM_ID}
            disabled={
              !hasChanges || !nameResult.ok || !isDescriptionValid || isBusy
            }
          >
            {updateWorkspaceMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        ) : null}
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.card} aria-label="Workspace settings">
        {canManageWorkspace ? (
          <form
            id={WORKSPACE_SETTINGS_FORM_ID}
            className={styles.form}
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className={styles.pictureSection}>
              <Avatar
                name={name}
                image={displayImage}
                color="orange"
                eager
                initialsLength={1}
                shape="rounded"
                size="xl"
              />
              <div className={styles.pictureContent}>
                <div className={styles.pictureActions}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={styles.fileInput}
                    disabled={isBusy}
                    onChange={handleImageChange}
                    tabIndex={-1}
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
                    disabled={isBusy || !displayImage}
                    onClick={handleDeleteImage}
                  >
                    Delete
                  </Button>
                </div>
                <p className={styles.pictureHint}>
                  File type: .png, .jpeg, .webp
                  <br />
                  Max file size: 2 MB
                </p>
                {imageError ? (
                  <p className={styles.fieldError}>{imageError}</p>
                ) : null}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.labelRow}>
                <span className={styles.label}>Workspace name</span>
                <span className={styles.charCount}>
                  {name.length}/{MAX_NAME_LENGTH}
                </span>
              </span>
              <Input
                className={styles.nameInput}
                value={name}
                maxLength={MAX_NAME_LENGTH}
                disabled={isBusy}
                aria-invalid={!nameResult.ok}
                onChange={(event) => setName(event.target.value)}
              />
              {!nameResult.ok ? (
                <span className={styles.fieldError}>{nameResult.error}</span>
              ) : null}
            </div>

            <div className={styles.field}>
              <span
                className={[styles.labelRow, styles.descriptionLabelRow].join(
                  ' ',
                )}
              >
                <span className={styles.label}>Description</span>
                <span className={styles.charCount}>
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </span>
              <Textarea
                className={styles.descriptionInput}
                value={description}
                maxLength={MAX_DESCRIPTION_LENGTH}
                disabled={isBusy}
                placeholder="What is this workspace for?"
                aria-invalid={!isDescriptionValid}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </form>
        ) : (
          <div className={styles.readOnlySummary}>
            <Avatar
              name={workspace.name}
              image={workspace.image}
              color="orange"
              eager
              initialsLength={1}
              shape="rounded"
              size="xl"
            />
            <p className={styles.readOnlyName}>{workspace.name}</p>
          </div>
        )}
      </section>

      {canManageWorkspace ? (
        <section className={styles.card} aria-labelledby="settings-plan">
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle} id="settings-plan">
              Plan & Limits
            </h2>
            <span className={styles.planBadge}>{workspace.plan}</span>
          </div>

          <div className={styles.limitList}>
            <LimitItem
              label="Boards"
              value={`${workspace.boardCount} / ${planLimits.maxBoardsPerWorkspace}`}
            />
            <LimitItem
              label="Workspace seats"
              value={`${usedMemberSlots} / ${planLimits.maxWorkspaceMembers}`}
              hint={memberUsageLabel}
            />
            <LimitItem
              label="Concurrent board users"
              value={planLimits.maxMembersPerBoard.toString()}
            />
          </div>

          <div className={styles.planActions}>
            <Button type="button">
              <CreditCard size={16} />
              Manage plan
            </Button>
          </div>
        </section>
      ) : null}

      <section
        className={[styles.card, styles.dangerCard].join(' ')}
        aria-labelledby="settings-danger"
      >
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle} id="settings-danger">
              Danger Zone
            </h2>
            <p className={styles.cardDescription}>
              Deleting a workspace removes its boards, members, and invites.
            </p>
          </div>
        </div>

        {canDeleteWorkspace ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            className={styles.dangerButton}
            onClick={() => setDeleteOpen(true)}
          >
            Delete workspace
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            className={styles.dangerButton}
            onClick={() => setLeaveOpen(true)}
          >
            Leave workspace
          </Button>
        )}
      </section>

      <DangerDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        icon={<AlertTriangle size={20} />}
        title="Delete workspace?"
        description={`This will permanently delete "${workspace.name}" and all boards inside it.`}
        confirmLabel={
          deleteWorkspaceMutation.isPending ? 'Deleting...' : 'Delete workspace'
        }
        isConfirming={deleteWorkspaceMutation.isPending}
        onConfirm={() => void handleDelete()}
      />

      <DangerDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        icon={<LogOut size={20} />}
        title="Leave workspace?"
        description={`You will lose access to "${workspace.name}" and its boards.`}
        confirmLabel={
          leaveWorkspaceMutation.isPending ? 'Leaving...' : 'Leave workspace'
        }
        isConfirming={leaveWorkspaceMutation.isPending}
        onConfirm={() => void handleLeave()}
      />
    </section>
  )
}

function LimitItem({
  label,
  value,
  hint,
}: {
  hint?: string
  label: string
  value: string
}) {
  return (
    <div className={styles.limitItem}>
      <div>
        <span className={styles.limitLabel}>{label}</span>
        {hint ? <p className={styles.limitHint}>{hint}</p> : null}
      </div>
      <span className={styles.limitValue}>{value}</span>
    </div>
  )
}

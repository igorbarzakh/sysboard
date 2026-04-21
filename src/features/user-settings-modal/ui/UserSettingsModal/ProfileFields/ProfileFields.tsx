import {
  PROFILE_ROLE_OPTIONS,
  type CurrentUser,
  type ProfileRole,
} from '@entities/user/model'
import { MAX_NAME_LENGTH } from '@shared/lib'
import { Input, Select, type SelectOption } from '@shared/ui'
import styles from './ProfileFields.module.scss'

const EMPTY_ROLE_VALUE = '__empty__'

type RoleSelectValue = ProfileRole | typeof EMPTY_ROLE_VALUE

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  discord: 'Discord',
}

const ROLE_OPTIONS: Array<SelectOption<RoleSelectValue>> = [
  { label: 'No role', value: EMPTY_ROLE_VALUE },
  ...PROFILE_ROLE_OPTIONS,
]

interface ProfileFieldsProps {
  disabled: boolean
  name: string
  profileRole: ProfileRole | null
  user: CurrentUser
  onNameChange: (name: string) => void
  onProfileRoleChange: (role: ProfileRole | null) => void
}

export function ProfileFields({
  disabled,
  name,
  profileRole,
  user,
  onNameChange,
  onProfileRoleChange,
}: ProfileFieldsProps) {
  return (
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
          disabled={disabled}
          placeholder="Your name"
          onChange={(event) => onNameChange(event.target.value)}
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
          value={profileRole ?? EMPTY_ROLE_VALUE}
          options={ROLE_OPTIONS}
          disabled={disabled}
          triggerClassName={styles.roleTrigger}
          contentClassName={styles.roleContent}
          alignItemWithTrigger
          onChange={(value: RoleSelectValue) => {
            onProfileRoleChange(value === EMPTY_ROLE_VALUE ? null : value)
          }}
        />
      </div>
    </div>
  )
}

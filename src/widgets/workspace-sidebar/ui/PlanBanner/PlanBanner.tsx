'use client'

import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import type { UserPlan } from '@shared/lib'
import { PLAN_LIMITS } from '@shared/lib/constants'
import { Button } from '@shared/ui'
import styles from '../WorkspaceSidebar/WorkspaceSidebar.module.scss'

interface PlanBannerProps {
  plan: UserPlan
}

export function PlanBanner({ plan }: PlanBannerProps) {
  return (
    <div className={styles.planBanner}>
      {plan === 'pro' ? (
        <div className={styles.planCard} data-plan="pro">
          <div className={styles.planHeader}>
            <span className={styles.planName}>Pro plan</span>
            <Sparkles size={13} className={styles.planIcon} />
          </div>
          <p className={styles.planDetails}>
            {PLAN_LIMITS.pro.maxBoardsPerWorkspace} boards &middot;{' '}
            {PLAN_LIMITS.pro.maxMembersPerBoard} members per board
          </p>
        </div>
      ) : (
        <div className={styles.planCard} data-plan="free">
          <div className={styles.planHeader}>
            <span className={styles.planName}>Free plan</span>
            <Zap size={13} className={styles.planIcon} />
          </div>
          <p className={styles.planDetails}>
            {PLAN_LIMITS.free.maxBoardsPerWorkspace} boards &middot;{' '}
            {PLAN_LIMITS.free.maxMembersPerBoard} members per board
          </p>
          <Button size="xs" className={styles.upgradeBtn}>
            Upgrade to Pro
            <ArrowRight size={11} />
          </Button>
        </div>
      )}
    </div>
  )
}

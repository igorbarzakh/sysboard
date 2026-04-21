'use client'

import { ArrowRight, Sparkles, Zap } from 'lucide-react'
import type { UserPlan } from '@shared/lib'
import { PLAN_LIMITS } from '@shared/lib/constants'
import { Button } from '@shared/ui'
import styles from './PlanBanner.module.scss'

interface PlanBannerProps {
  plan: UserPlan
}

export function PlanBanner({ plan }: PlanBannerProps) {
  return (
    <div className={styles.root}>
      {plan === 'pro' ? (
        <div className={styles.card} data-plan="pro">
          <div className={styles.header}>
            <span className={styles.name}>Pro plan</span>
            <Sparkles size={13} className={styles.icon} />
          </div>
          <p className={styles.details}>
            {PLAN_LIMITS.pro.maxBoardsPerWorkspace} boards &middot;{' '}
            {PLAN_LIMITS.pro.maxMembersPerBoard} members per board
          </p>
        </div>
      ) : (
        <div className={styles.card} data-plan="free">
          <div className={styles.header}>
            <span className={styles.name}>Free plan</span>
            <Zap size={13} className={styles.icon} />
          </div>
          <p className={styles.details}>
            {PLAN_LIMITS.free.maxBoardsPerWorkspace} boards &middot;{' '}
            {PLAN_LIMITS.free.maxMembersPerBoard} members per board
          </p>
          <Button size="xs" className={styles.upgradeButton}>
            Upgrade to Pro
            <ArrowRight size={11} />
          </Button>
        </div>
      )}
    </div>
  )
}

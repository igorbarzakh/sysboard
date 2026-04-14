export type UserPlan = 'free' | 'pro'

export interface PlanLimits {
  maxWorkspaces: number
  maxBoardsPerWorkspace: number
  maxMembersPerBoard: number
}

export const FREE_PLAN: PlanLimits = {
  maxWorkspaces: 1,
  maxBoardsPerWorkspace: 2,
  maxMembersPerBoard: 2,
}

export const PRO_PLAN: PlanLimits = {
  maxWorkspaces: 5,
  maxBoardsPerWorkspace: 10,
  maxMembersPerBoard: 10,
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: FREE_PLAN,
  pro: PRO_PLAN,
}

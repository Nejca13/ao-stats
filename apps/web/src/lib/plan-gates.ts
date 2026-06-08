import type { Group } from '@ao/shared'
import { auth } from '@/lib/auth'
import { groupsCollection } from '@/lib/db'

export const FREE_MATCH_LIMIT = 10
export const FREE_ASADO_LIMIT = 1

export function getPlanLimits(plan: string) {
  if (plan !== 'free') return { matchLimit: Infinity, asadoLimit: Infinity }
  return { matchLimit: FREE_MATCH_LIMIT, asadoLimit: FREE_ASADO_LIMIT }
}

export async function getUserGroup(): Promise<Group | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const group = await groupsCollection().findOne(
    { memberIds: session.user.id },
    { projection: { _id: 0 } },
  )
  return group as Group | null
}

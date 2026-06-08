import { auth } from '@/lib/auth'
import { groupsCollection, playersCollection, asadosCollection, matchesCollection } from '@/lib/db'
import { getPlanLimits } from '@/lib/plan-gates'

export async function getDashboardData() {
  const session = await auth()
  if (!session?.user?.id) return null

  const group = await groupsCollection().findOne(
    { memberIds: session.user.id },
    { projection: { _id: 0 } },
  )

  if (!group) return { group: null, players: [], asados: [], matches: [], limited: false }

  const { matchLimit, asadoLimit } = getPlanLimits(group.plan)

  const [players, asados, matches] = await Promise.all([
    playersCollection()
      .find({ groupId: group.id })
      .project({ _id: 0 })
      .sort({ name: 1 })
      .toArray(),
    asadosCollection()
      .find({ groupId: group.id })
      .project({ _id: 0 })
      .sort({ date: -1 })
      .toArray(),
    matchesCollection()
      .find({ groupId: group.id })
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .toArray(),
  ])

  // Apply plan limits
  if (isFinite(matchLimit)) {
    matches.length = Math.min(matches.length, matchLimit)
  }
  if (isFinite(asadoLimit)) {
    asados.length = Math.min(asados.length, asadoLimit)
  }

  const totalMatches = await matchesCollection().countDocuments({ groupId: group.id })
  const totalAsados = await asadosCollection().countDocuments({ groupId: group.id })

  return {
    group,
    players,
    asados,
    matches,
    limited: isFinite(matchLimit) && matchLimit < totalMatches,
    totalMatches,
    totalAsados,
  }
}

import { auth } from '@/lib/auth'
import { groupsCollection, playersCollection, asadosCollection, matchesCollection } from '@/lib/db'
import { getPlanLimits } from '@/lib/plan-gates'
import { getLegacySnapshot } from '@/lib/legacy-migration'

export async function getDashboardData() {
  const session = await auth()
  if (!session?.user?.id) return null

  const group = await groupsCollection().findOne(
    { memberIds: session.user.id },
    { projection: { _id: 0 } },
  )

  if (!group) return { group: null, players: [], asados: [], matches: [], limited: false, usingLegacy: true }

  const { matchLimit, asadoLimit } = getPlanLimits(group.plan)

  let players = await playersCollection()
    .find({ groupId: group.id })
    .project({ _id: 0 })
    .sort({ name: 1 })
    .toArray()

  let asados = await asadosCollection()
    .find({ groupId: group.id })
    .project({ _id: 0 })
    .sort({ date: -1 })
    .toArray()

  let matches = await matchesCollection()
    .find({ groupId: group.id })
    .project({ _id: 0 })
    .sort({ createdAt: -1 })
    .toArray()

  let usingLegacy = false

  // Fallback: si V2 no tiene datos para este grupo, usar snapshot legacy
  if (players.length === 0 && asados.length === 0 && matches.length === 0) {
    const snapshot = await getLegacySnapshot()
    if (snapshot) {
      players = snapshot.players || []
      asados = snapshot.asados || []
      matches = snapshot.matches || []
      usingLegacy = true
    }
  }

  // Aplicar limites del plan
  if (isFinite(matchLimit)) {
    matches = matches.slice(0, matchLimit)
  }
  if (isFinite(asadoLimit)) {
    asados = asados.slice(0, asadoLimit)
  }

  const totalMatches = usingLegacy ? matches.length : await matchesCollection().countDocuments({ groupId: group.id })
  const totalAsados = usingLegacy ? asados.length : await asadosCollection().countDocuments({ groupId: group.id })

  return {
    group,
    players,
    asados,
    matches,
    limited: isFinite(matchLimit) && matchLimit < totalMatches,
    totalMatches,
    totalAsados,
    usingLegacy,
  }
}

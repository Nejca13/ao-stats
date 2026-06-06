// ── Helpers ──

export function buildPointScale(n: number): number[] {
  if (n <= 0) return []
  if (n === 1) return [10]
  return Array.from({ length: n }, (_, i) =>
    Math.max(1, Math.round(10 - (9 * i) / (n - 1)))
  )
}

export interface PlayerMapEntry { name: string; avatarUrl: string | null; colorHex: string | null }

export function buildPlayerMap(
  players: { id: string; name: string; avatarUrl?: string | null; colorHex?: string | null }[]
): Record<string, PlayerMapEntry> {
  const map: Record<string, { name: string; avatarUrl: string | null; colorHex: string | null }> = {}
  for (const p of players) {
    map[p.id] = {
      name: p.name,
      avatarUrl: p.avatarUrl ?? null,
      colorHex: p.colorHex ?? null,
    }
  }
  return map
}

export function buildEloMap(players: { id: string; elo?: number | null }[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const p of players) {
    map[p.id] = p.elo ?? 1500
  }
  return map
}

// ── Head-to-Head ──

export interface H2HEntry {
  opponentId: string
  opponentName: string
  opponentAvatarUrl: string | null
  wins: number
  losses: number
}

export interface PlayerStats {
  playerId: string
  name: string
  avatarUrl: string | null
  colorHex: string | null
  played: number
  wins: number
  losses: number
  winRate: number
  goalsScored: number
  goalsConceded: number
  goalDiff: number
  avgGoalsScored: number
  avgGoalsConceded: number
  headToHead: H2HEntry[]
  bestVictim: { playerId: string; name: string; wins: number } | null
  nemesis: { playerId: string; name: string; losses: number } | null
}

export interface AsadoPlayerRank {
  playerId: string
  name: string
  avatarUrl: string | null
  colorHex: string | null
  wins: number
  losses: number
  played: number
  position: number
  points: number
}

export interface MayorGoleada {
  winnerName: string
  winnerAvatarUrl: string | null
  loserName: string
  loserAvatarUrl: string | null
  winnerGoles: number
  loserGoles: number
  comment: string | null
  photoUrl: string | null
}

export interface FormattedMatch {
  id: string
  winnerId: string
  winnerName: string
  winnerAvatarUrl: string | null
  loserId: string
  loserName: string
  loserAvatarUrl: string | null
  winnerGoles: number | null
  loserGoles: number | null
  comment: string | null
  photoUrl: string | null
  createdAt: string | null
}

export interface AsadoResult {
  asadoId: string
  date: string
  comment: string | null
  totalMatches: number
  ranking: AsadoPlayerRank[]
  mvp: { playerId: string; name: string; avatarUrl: string | null; wins: number } | null
  matches: FormattedMatch[]
  mayorGoleada: MayorGoleada | null
}

export interface GlobalPlayer extends PlayerStats {
  elo: number
  totalPoints: number
  averagePoints: number
  mvpCount: number
}

export interface Rankings {
  byPoints: { playerId: string; name: string; avatarUrl: string | null; totalPoints: number }[]
  byWinRate: { playerId: string; name: string; avatarUrl: string | null; winRate: number }[]
  byElo: { playerId: string; name: string; avatarUrl: string | null; elo: number }[]
}

export interface ProcessedStats {
  global: {
    players: GlobalPlayer[]
    rankings: Rankings
    mvpHistorico: { playerId: string; name: string; avatarUrl: string | null; mvpCount: number } | null
    topScorer: { playerId: string; name: string; avatarUrl: string | null; goalsScored: number } | null
    mayorGoleada: MayorGoleada | null
  }
  asados: AsadoResult[]
}

// ── Stats Computation ──

export interface MatchStats {
  winnerId: string; loserId: string; winnerGoles?: number | null; loserGoles?: number | null
}

export function computePlayerStats(
  matches: MatchStats[],
  playerMap: Record<string, PlayerMapEntry>
): Record<string, PlayerStats> {
  const stats: Record<string, PlayerStats> = {}

  for (const id of Object.keys(playerMap)) {
    stats[id] = {
      playerId: id,
      name: playerMap[id].name,
      avatarUrl: playerMap[id].avatarUrl,
      colorHex: playerMap[id].colorHex,
      played: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      goalsScored: 0,
      goalsConceded: 0,
      goalDiff: 0,
      avgGoalsScored: 0,
      avgGoalsConceded: 0,
      headToHead: [],
      bestVictim: null,
      nemesis: null,
    }
  }

  const h2hRaw: Record<string, Record<string, { wins: number; losses: number }>> = {}

  for (const m of matches) {
    const w = m.winnerId
    const l = m.loserId

    if (stats[w]) { stats[w].played++; stats[w].wins++ }
    if (stats[l]) { stats[l].played++; stats[l].losses++ }

    const winnerGoles = typeof m.winnerGoles === 'number' ? m.winnerGoles : null
    const loserGoles = typeof m.loserGoles === 'number' ? m.loserGoles : null

    if (winnerGoles !== null && loserGoles !== null) {
      if (stats[w]) {
        stats[w].goalsScored += winnerGoles
        stats[w].goalsConceded += loserGoles
      }
      if (stats[l]) {
        stats[l].goalsScored += loserGoles
        stats[l].goalsConceded += winnerGoles
      }
    }

    if (stats[w]) {
      if (!h2hRaw[w]) h2hRaw[w] = {}
      if (!h2hRaw[w][l]) h2hRaw[w][l] = { wins: 0, losses: 0 }
      h2hRaw[w][l].wins++
    }
    if (stats[l]) {
      if (!h2hRaw[l]) h2hRaw[l] = {}
      if (!h2hRaw[l][w]) h2hRaw[l][w] = { wins: 0, losses: 0 }
      h2hRaw[l][w].losses++
    }
  }

  for (const id of Object.keys(stats)) {
    const s = stats[id]
    s.winRate = s.played > 0 ? Math.round((s.wins / s.played) * 10000) / 100 : 0
    s.goalDiff = s.goalsScored - s.goalsConceded
    s.avgGoalsScored = s.played > 0 ? Math.round((s.goalsScored / s.played) * 100) / 100 : 0
    s.avgGoalsConceded = s.played > 0 ? Math.round((s.goalsConceded / s.played) * 100) / 100 : 0

    const h2hEntries = Object.entries(h2hRaw[id] ?? {}).map(([oppId, data]) => ({
      opponentId: oppId,
      opponentName: playerMap[oppId]?.name || 'Desconocido',
      opponentAvatarUrl: playerMap[oppId]?.avatarUrl || null,
      wins: data.wins,
      losses: data.losses,
    }))

    s.headToHead = h2hEntries

    let maxWins = 0
    let maxLosses = 0
    s.bestVictim = null
    s.nemesis = null

    for (const h of h2hEntries) {
      if (h.wins > maxWins) { maxWins = h.wins; s.bestVictim = { playerId: h.opponentId, name: h.opponentName, wins: h.wins } }
      if (h.losses > maxLosses) { maxLosses = h.losses; s.nemesis = { playerId: h.opponentId, name: h.opponentName, losses: h.losses } }
    }
  }

  return stats
}

export function computeAsadoRanking(
  asadoMatches: { winnerId: string; loserId: string }[],
  asadoPlayerIds: string[],
  playerMap: Record<string, PlayerMapEntry>
): AsadoPlayerRank[] {
  const counts: Record<string, { wins: number; losses: number; played: number }> = {}

  for (const pid of asadoPlayerIds) {
    counts[pid] = { wins: 0, losses: 0, played: 0 }
  }

  for (const m of asadoMatches) {
    if (counts[m.winnerId]) { counts[m.winnerId].wins++; counts[m.winnerId].played++ }
    if (counts[m.loserId]) { counts[m.loserId].losses++; counts[m.loserId].played++ }
  }

  const compare = (a: { playerId: string; wins: number; losses: number }, b: { playerId: string; wins: number; losses: number }) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    if (a.losses !== b.losses) return a.losses - b.losses

    const h2hMatches = asadoMatches.filter(m =>
      (m.winnerId === a.playerId && m.loserId === b.playerId) ||
      (m.winnerId === b.playerId && m.loserId === a.playerId)
    )

    if (h2hMatches.length > 0) {
      const aWins = h2hMatches.filter(m => m.winnerId === a.playerId).length
      const bWins = h2hMatches.filter(m => m.winnerId === b.playerId).length
      if (aWins !== bWins) return bWins - aWins
    }
    return 0
  }

  const base = Object.entries(counts)
    .map(([pid, c]) => ({
      playerId: pid,
      name: playerMap[pid]?.name || 'Desconocido',
      avatarUrl: playerMap[pid]?.avatarUrl || null,
      colorHex: playerMap[pid]?.colorHex || null,
      wins: c.wins,
      losses: c.losses,
      played: c.played,
    }))
    .sort(compare)

  const pointScale = buildPointScale(asadoPlayerIds.length)
  let pos = 1

  const result: AsadoPlayerRank[] = []
  for (let i = 0; i < base.length; i++) {
    if (i > 0 && compare(base[i - 1], base[i]) !== 0) {
      pos = i + 1
    }
    result.push({
      ...base[i],
      position: pos,
      points: pos - 1 < pointScale.length ? pointScale[pos - 1] : 1,
    })
  }

  return result
}

export function findMayorGoleada(
  matches: { winnerId: string; loserId: string; winnerGoles?: number | null; loserGoles?: number | null; comment?: string | null; photoUrl?: string | null }[],
  playerMap: Record<string, PlayerMapEntry>
): MayorGoleada | null {
  let bestMatch: (typeof matches)[0] | null = null
  let maxDiff = -1
  let maxWinnerGoles = -1

  for (const m of matches) {
    const w = m.winnerGoles ?? null
    const l = m.loserGoles ?? null
    if (w === null || l === null) continue
    const diff = w - l
    if (diff > maxDiff || (diff === maxDiff && w > maxWinnerGoles)) {
      maxDiff = diff
      maxWinnerGoles = w
      bestMatch = m
    }
  }

  if (!bestMatch) return null

  return {
    winnerName: playerMap[bestMatch.winnerId]?.name || 'Desconocido',
    winnerAvatarUrl: playerMap[bestMatch.winnerId]?.avatarUrl || null,
    loserName: playerMap[bestMatch.loserId]?.name || 'Desconocido',
    loserAvatarUrl: playerMap[bestMatch.loserId]?.avatarUrl || null,
    winnerGoles: bestMatch.winnerGoles ?? 0,
    loserGoles: bestMatch.loserGoles ?? 0,
    comment: bestMatch.comment ?? null,
    photoUrl: bestMatch.photoUrl ?? null,
  }
}

// ── Main Processor ──

export function processStatsData(snapshot: {
  players: { id: string; name: string; avatarUrl?: string | null; colorHex?: string | null; elo?: number | null }[]
  asados: { id: string; date: string; playerIds: string[]; comment?: string | null }[]
  matches: { id: string; asadoId: string; winnerId: string; loserId: string; winnerGoles?: number | null; loserGoles?: number | null; comment?: string | null; photoUrl?: string | null; createdAt?: string | null }[]
}): ProcessedStats {
  const { players, asados, matches } = snapshot
  const playerMap = buildPlayerMap(players)
  const eloMap = buildEloMap(players)
  const globalStats = computePlayerStats(matches, playerMap)
  const asadoResults: AsadoResult[] = []

  for (const asado of asados) {
    const asadoMatches = matches.filter(m => m.asadoId === asado.id)
    const ranking = computeAsadoRanking(asadoMatches, asado.playerIds, playerMap)
    const mvp = ranking.length > 0 ? ranking[0] : null

    const formattedMatches: FormattedMatch[] = asadoMatches.map(m => ({
      id: m.id,
      winnerId: m.winnerId,
      winnerName: playerMap[m.winnerId]?.name || 'Desconocido',
      winnerAvatarUrl: playerMap[m.winnerId]?.avatarUrl || null,
      loserId: m.loserId,
      loserName: playerMap[m.loserId]?.name || 'Desconocido',
      loserAvatarUrl: playerMap[m.loserId]?.avatarUrl || null,
      winnerGoles: m.winnerGoles ?? null,
      loserGoles: m.loserGoles ?? null,
      comment: m.comment ?? null,
      photoUrl: m.photoUrl ?? null,
      createdAt: m.createdAt ?? null,
    }))

    const asadoMayorGoleada = findMayorGoleada(asadoMatches, playerMap)

    asadoResults.push({
      asadoId: asado.id,
      date: asado.date,
      comment: asado.comment ?? null,
      totalMatches: asadoMatches.length,
      ranking,
      mvp: mvp ? { playerId: mvp.playerId, name: mvp.name, avatarUrl: mvp.avatarUrl, wins: mvp.wins } : null,
      matches: formattedMatches,
      mayorGoleada: asadoMayorGoleada,
    })
  }

  const pointsAccum: Record<string, { totalPoints: number; asadosPlayed: number; mvpCount: number }> = {}
  for (const id of Object.keys(playerMap)) {
    pointsAccum[id] = { totalPoints: 0, asadosPlayed: 0, mvpCount: 0 }
  }

  for (const asado of asados) {
    const asadoMatches = matches.filter(m => m.asadoId === asado.id)
    if (asadoMatches.length === 0) continue
    const ranking = computeAsadoRanking(asadoMatches, asado.playerIds, playerMap)
    for (const r of ranking) {
      if (pointsAccum[r.playerId]) {
        pointsAccum[r.playerId].totalPoints += r.points
        pointsAccum[r.playerId].asadosPlayed++
        if (r.position === 1) pointsAccum[r.playerId].mvpCount++
      }
    }
  }

  const globalPlayers: GlobalPlayer[] = Object.values(globalStats).map(s => ({
    ...s,
    elo: eloMap[s.playerId] ?? 1500,
    totalPoints: pointsAccum[s.playerId]?.totalPoints ?? 0,
    averagePoints: pointsAccum[s.playerId]?.asadosPlayed > 0
      ? Math.round((pointsAccum[s.playerId].totalPoints / pointsAccum[s.playerId].asadosPlayed) * 100) / 100
      : 0,
    mvpCount: pointsAccum[s.playerId]?.mvpCount ?? 0,
  }))

  const byPoints = [...globalPlayers].sort((a, b) => b.totalPoints - a.totalPoints)
  const byWinRate = [...globalPlayers].sort((a, b) => b.winRate - a.winRate)
  const byElo = [...globalPlayers].sort((a, b) => b.elo - a.elo)
  const topMvp = [...globalPlayers].sort((a, b) => b.mvpCount - a.mvpCount)[0] ?? null
  const mayorGoleadaGlobal = findMayorGoleada(matches, playerMap)

  const byGoals = [...globalPlayers].sort((a, b) => b.goalsScored - a.goalsScored)
  const topScorer = byGoals[0]?.goalsScored > 0 ? byGoals[0] : null

  return {
    global: {
      players: globalPlayers,
      rankings: {
        byPoints: byPoints.map(p => ({ playerId: p.playerId, name: p.name, avatarUrl: p.avatarUrl, totalPoints: p.totalPoints })),
        byWinRate: byWinRate.map(p => ({ playerId: p.playerId, name: p.name, avatarUrl: p.avatarUrl, winRate: p.winRate })),
        byElo: byElo.map(p => ({ playerId: p.playerId, name: p.name, avatarUrl: p.avatarUrl, elo: p.elo })),
      },
      mvpHistorico: topMvp ? { playerId: topMvp.playerId, name: topMvp.name, avatarUrl: topMvp.avatarUrl, mvpCount: topMvp.mvpCount } : null,
      topScorer: topScorer ? { playerId: topScorer.playerId, name: topScorer.name, avatarUrl: topScorer.avatarUrl, goalsScored: topScorer.goalsScored } : null,
      mayorGoleada: mayorGoleadaGlobal,
    },
    asados: asadoResults,
  }
}

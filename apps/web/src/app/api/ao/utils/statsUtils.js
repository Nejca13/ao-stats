export function buildPointScale(n) {
  if (n <= 0) return []
  if (n === 1) return [10]
  return Array.from({ length: n }, (_, i) =>
    Math.max(1, Math.round(10 - (9 * i) / (n - 1)))
  )
}

export function buildPlayerMap(players) {
  const map = {}
  players.forEach(p => {
    map[p.id] = {
      name: p.name,
      avatarUrl: p.avatarUrl || p.avatar_url || null,
      colorHex: p.colorHex || p.color_hex || null
    }
  })
  return map
}

export function computePlayerStats(matches, playerMap) {
  const stats = {}
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
      headToHead: {},
    }
  }

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
      if (!stats[w].headToHead[l]) stats[w].headToHead[l] = { wins: 0, losses: 0 }
      stats[w].headToHead[l].wins++
    }
    if (stats[l]) {
      if (!stats[l].headToHead[w]) stats[l].headToHead[w] = { wins: 0, losses: 0 }
      stats[l].headToHead[w].losses++
    }
  }

  for (const id of Object.keys(stats)) {
    const s = stats[id]
    s.winRate = s.played > 0 ? Math.round((s.wins / s.played) * 10000) / 100 : 0
    s.goalDiff = s.goalsScored - s.goalsConceded
    s.avgGoalsScored = s.played > 0 ? Math.round((s.goalsScored / s.played) * 100) / 100 : 0
    s.avgGoalsConceded = s.played > 0 ? Math.round((s.goalsConceded / s.played) * 100) / 100 : 0

    const h2hArray = Object.entries(s.headToHead).map(([oppId, data]) => ({
      opponentId: oppId,
      opponentName: playerMap[oppId]?.name || 'Desconocido',
      opponentAvatarUrl: playerMap[oppId]?.avatarUrl || null,
      wins: data.wins,
      losses: data.losses,
    }))
    s.headToHead = h2hArray
    s.bestVictim = null
    s.nemesis = null
    let maxWins = 0
    let maxLosses = 0
    for (const h of h2hArray) {
      if (h.wins > maxWins) { maxWins = h.wins; s.bestVictim = { playerId: h.opponentId, name: h.opponentName, wins: h.wins } }
      if (h.losses > maxLosses) { maxLosses = h.losses; s.nemesis = { playerId: h.opponentId, name: h.opponentName, losses: h.losses } }
    }
  }
  return stats
}

export function computeAsadoRanking(asadoMatches, asadoPlayerIds, playerMap) {
  const counts = {}
  for (const pid of asadoPlayerIds) {
    counts[pid] = { wins: 0, losses: 0, played: 0 }
  }
  for (const m of asadoMatches) {
    if (counts[m.winnerId]) { counts[m.winnerId].wins++; counts[m.winnerId].played++ }
    if (counts[m.loserId]) { counts[m.loserId].losses++; counts[m.loserId].played++ }
  }
  const comparePlayers = (a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.losses !== b.losses) return a.losses - b.losses;

    const h2hMatches = asadoMatches.filter(m =>
      (m.winnerId === a.playerId && m.loserId === b.playerId) ||
      (m.winnerId === b.playerId && m.loserId === a.playerId)
    );
    if (h2hMatches.length > 0) {
      const aWinsH2H = h2hMatches.filter(m => m.winnerId === a.playerId).length;
      const bWinsH2H = h2hMatches.filter(m => m.winnerId === b.playerId).length;
      if (aWinsH2H !== bWinsH2H) return bWinsH2H - aWinsH2H;
    }
    return 0;
  };

  const sorted = Object.entries(counts)
    .map(([pid, c]) => ({
      playerId: pid,
      name: playerMap[pid]?.name || 'Desconocido',
      avatarUrl: playerMap[pid]?.avatarUrl || null,
      colorHex: playerMap[pid]?.colorHex || null,
      ...c
    }))
    .sort(comparePlayers);

  const pointScale = buildPointScale(asadoPlayerIds.length)
  let pos = 1
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && comparePlayers(sorted[i - 1], sorted[i]) !== 0) {
      pos = i + 1;
    }
    sorted[i].position = pos
    const scaleIndex = pos - 1
    sorted[i].points = scaleIndex < pointScale.length ? pointScale[scaleIndex] : 1
  }
  return sorted
}

export function buildEloMap(players) {
  const map = {}
  players.forEach(p => { map[p.id] = p.elo || 1500 })
  return map
}

export function findMayorGoleada(matches, playerMap) {
  let bestMatch = null
  let maxDiff = -1
  let maxWinnerGoles = -1

  for (const m of matches) {
    if (m.winnerGoles === null || m.loserGoles === null || m.winnerGoles === undefined || m.loserGoles === undefined) continue
    const diff = m.winnerGoles - m.loserGoles
    if (diff > maxDiff || (diff === maxDiff && m.winnerGoles > maxWinnerGoles)) {
      maxDiff = diff
      maxWinnerGoles = m.winnerGoles
      bestMatch = m
    }
  }

  if (!bestMatch) return null

  return {
    winnerName: playerMap[bestMatch.winnerId]?.name || 'Desconocido',
    winnerAvatarUrl: playerMap[bestMatch.winnerId]?.avatarUrl || null,
    loserName: playerMap[bestMatch.loserId]?.name || 'Desconocido',
    loserAvatarUrl: playerMap[bestMatch.loserId]?.avatarUrl || null,
    winnerGoles: bestMatch.winnerGoles,
    loserGoles: bestMatch.loserGoles,
    comment: bestMatch.comment || null,
    photoUrl: bestMatch.photoUrl || null
  }
}

export function processStatsData(snapshot) {
  const { players, asados, matches } = snapshot
  const playerMap = buildPlayerMap(players)
  const eloMap = buildEloMap(players)
  const globalStats = computePlayerStats(matches, playerMap)
  const asadoResults = []

  for (const asado of asados) {
    const asadoMatches = matches.filter(m => m.asadoId === asado.id)
    const ranking = computeAsadoRanking(asadoMatches, asado.playerIds, playerMap)
    const mvp = ranking.length > 0 ? ranking[0] : null

    const formattedMatches = asadoMatches.map(m => ({
      id: m.id,
      winnerId: m.winnerId,
      winnerName: playerMap[m.winnerId]?.name || 'Desconocido',
      winnerAvatarUrl: playerMap[m.winnerId]?.avatarUrl || null,
      loserId: m.loserId,
      loserName: playerMap[m.loserId]?.name || 'Desconocido',
      loserAvatarUrl: playerMap[m.loserId]?.avatarUrl || null,
      winnerGoles: m.winnerGoles,
      loserGoles: m.loserGoles,
      comment: m.comment || null,
      photoUrl: m.photoUrl || null,
      createdAt: m.createdAt || null
    }))

    const asadoMayorGoleada = findMayorGoleada(asadoMatches, playerMap)

    asadoResults.push({
      asadoId: asado.id,
      date: asado.date,
      comment: asado.comment || null,
      totalMatches: asadoMatches.length,
      ranking,
      mvp: mvp ? { playerId: mvp.playerId, name: mvp.name, avatarUrl: mvp.avatarUrl, wins: mvp.wins } : null,
      matches: formattedMatches,
      mayorGoleada: asadoMayorGoleada
    })
  }

  const pointsAccum = {}
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

  const globalPlayers = Object.values(globalStats).map(s => ({
    ...s,
    elo: eloMap[s.playerId] || 1500,
    totalPoints: pointsAccum[s.playerId]?.totalPoints || 0,
    averagePoints: pointsAccum[s.playerId]?.asadosPlayed > 0
      ? Math.round((pointsAccum[s.playerId].totalPoints / pointsAccum[s.playerId].asadosPlayed) * 100) / 100
      : 0,
    mvpCount: pointsAccum[s.playerId]?.mvpCount || 0,
  }))

  const byPoints = [...globalPlayers].sort((a, b) => b.totalPoints - a.totalPoints)
  const byWinRate = [...globalPlayers].sort((a, b) => b.winRate - a.winRate)
  const byElo = [...globalPlayers].sort((a, b) => b.elo - a.elo)
  const topMvp = [...globalPlayers].sort((a, b) => b.mvpCount - a.mvpCount)[0] || null
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
      mayorGoleada: mayorGoleadaGlobal
    },
    asados: asadoResults,
  }
}

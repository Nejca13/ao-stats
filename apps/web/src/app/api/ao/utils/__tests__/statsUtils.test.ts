import { describe, it, expect } from 'vitest'
import {
  buildPointScale,
  buildPlayerMap,
  computePlayerStats,
  computeAsadoRanking,
  buildEloMap,
  findMayorGoleada,
  processStatsData,
} from '@ao/shared'
import type { PlayerStats, AsadoPlayerRank } from '@ao/shared'

function assertPlayerStats(stats: Record<string, PlayerStats>, id: string): PlayerStats {
  const s = stats[id]
  if (!s) throw new Error(`Player ${id} not found in stats`)
  return s
}

describe('buildPointScale', () => {
  it('returns empty array for n <= 0', () => {
    expect(buildPointScale(0)).toEqual([])
    expect(buildPointScale(-1)).toEqual([])
  })

  it('returns [10] for n = 1', () => {
    expect(buildPointScale(1)).toEqual([10])
  })

  it('generates descending scale for n = 5', () => {
    const scale = buildPointScale(5)
    expect(scale).toHaveLength(5)
    expect(scale[0]).toBe(10)
    expect(scale[scale.length - 1]).toBe(1)
  })

  it('never goes below 1', () => {
    const scale = buildPointScale(20)
    scale.forEach(p => expect(p).toBeGreaterThanOrEqual(1))
  })
})

describe('buildPlayerMap', () => {
  it('creates a map from player array', () => {
    const players = [
      { id: 'p1', name: 'Alice', avatarUrl: '/a.png', colorHex: '#ff0' },
      { id: 'p2', name: 'Bob', avatarUrl: null, colorHex: null },
    ]
    const map = buildPlayerMap(players)
    expect(map['p1'].name).toBe('Alice')
    expect(map['p2'].name).toBe('Bob')
  })

  it('handles empty array', () => {
    expect(buildPlayerMap([])).toEqual({})
  })
})

describe('computePlayerStats', () => {
  const playerMap = buildPlayerMap([
    { id: 'p1', name: 'Alice', avatarUrl: null, colorHex: null },
    { id: 'p2', name: 'Bob', avatarUrl: null, colorHex: null },
  ])

  it('computes basic win/loss stats', () => {
    const stats = computePlayerStats([
      { winnerId: 'p1', loserId: 'p2', winnerGoles: 3, loserGoles: 1 },
      { winnerId: 'p1', loserId: 'p2', winnerGoles: 2, loserGoles: 0 },
    ], playerMap)

    expect(assertPlayerStats(stats, 'p1').played).toBe(2)
    expect(assertPlayerStats(stats, 'p1').wins).toBe(2)
    expect(assertPlayerStats(stats, 'p1').winRate).toBe(100)
    expect(assertPlayerStats(stats, 'p2').played).toBe(2)
    expect(assertPlayerStats(stats, 'p2').losses).toBe(2)
  })

  it('calculates goals correctly', () => {
    const stats = computePlayerStats([
      { winnerId: 'p1', loserId: 'p2', winnerGoles: 4, loserGoles: 2 },
    ], playerMap)

    expect(assertPlayerStats(stats, 'p1').goalsScored).toBe(4)
    expect(assertPlayerStats(stats, 'p1').goalsConceded).toBe(2)
    expect(assertPlayerStats(stats, 'p1').goalDiff).toBe(2)
    expect(assertPlayerStats(stats, 'p2').goalsScored).toBe(2)
    expect(assertPlayerStats(stats, 'p2').goalsConceded).toBe(4)
  })

  it('tracks head-to-head', () => {
    const stats = computePlayerStats([
      { winnerId: 'p1', loserId: 'p2' },
      { winnerId: 'p1', loserId: 'p2' },
    ], playerMap)

    expect(assertPlayerStats(stats, 'p1').headToHead).toHaveLength(1)
    expect(assertPlayerStats(stats, 'p1').headToHead[0].opponentId).toBe('p2')
    expect(assertPlayerStats(stats, 'p1').headToHead[0].wins).toBe(2)
    expect(assertPlayerStats(stats, 'p2').headToHead[0].losses).toBe(2)
  })

  it('identifies best victim and nemesis', () => {
    const pm = buildPlayerMap([
      { id: 'p1', name: 'Alice', avatarUrl: null, colorHex: null },
      { id: 'p2', name: 'Bob', avatarUrl: null, colorHex: null },
      { id: 'p3', name: 'Charlie', avatarUrl: null, colorHex: null },
    ])

    const stats = computePlayerStats([
      { winnerId: 'p1', loserId: 'p2' },
      { winnerId: 'p1', loserId: 'p2' },
      { winnerId: 'p3', loserId: 'p1' },
      { winnerId: 'p3', loserId: 'p1' },
      { winnerId: 'p3', loserId: 'p1' },
    ], pm)

    expect(assertPlayerStats(stats, 'p1').bestVictim?.playerId).toBe('p2')
    expect(assertPlayerStats(stats, 'p1').nemesis?.playerId).toBe('p3')
  })
})

describe('computeAsadoRanking', () => {
  const playerMap = buildPlayerMap([
    { id: 'p1', name: 'Alice', avatarUrl: null, colorHex: null },
    { id: 'p2', name: 'Bob', avatarUrl: null, colorHex: null },
    { id: 'p3', name: 'Charlie', avatarUrl: null, colorHex: null },
  ])

  it('ranks by wins, then losses, then H2H', () => {
    const ranking = computeAsadoRanking([
      { winnerId: 'p1', loserId: 'p2' },
      { winnerId: 'p1', loserId: 'p3' },
      { winnerId: 'p2', loserId: 'p3' },
    ], ['p1', 'p2', 'p3'], playerMap)

    expect(ranking[0].playerId).toBe('p1')
    expect(ranking[1].playerId).toBe('p2')
    expect(ranking[2].playerId).toBe('p3')
  })

  it('assigns points based on position', () => {
    const ranking = computeAsadoRanking([
      { winnerId: 'p1', loserId: 'p2' },
    ], ['p1', 'p2'], playerMap)

    expect(ranking[0].points).toBe(10)
    expect(ranking[1].points).toBe(1)
  })
})

describe('buildEloMap', () => {
  it('extracts elo with default 1500', () => {
    const map = buildEloMap([
      { id: 'p1', elo: 1600 },
      { id: 'p2' },
    ])
    expect(map['p1']).toBe(1600)
    expect(map['p2']).toBe(1500)
  })
})

describe('findMayorGoleada', () => {
  const playerMap = buildPlayerMap([
    { id: 'p1', name: 'Alice', avatarUrl: null, colorHex: null },
    { id: 'p2', name: 'Bob', avatarUrl: null, colorHex: null },
  ])

  it('returns the match with the biggest goal difference', () => {
    const result = findMayorGoleada([
      { winnerId: 'p1', loserId: 'p2', winnerGoles: 2, loserGoles: 1 },
      { winnerId: 'p1', loserId: 'p2', winnerGoles: 5, loserGoles: 0 },
    ], playerMap)

    expect(result?.winnerName).toBe('Alice')
    expect(result?.winnerGoles).toBe(5)
  })

  it('returns null if no match has goals', () => {
    const result = findMayorGoleada([
      { winnerId: 'p1', loserId: 'p2', winnerGoles: null, loserGoles: null },
    ], playerMap)

    expect(result).toBeNull()
  })
})

describe('processStatsData', () => {
  const snapshot = {
    players: [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ],
    asados: [
      { id: 'a1', date: '2024-01-01', playerIds: ['p1', 'p2'] },
    ],
    matches: [
      { id: 'm1', asadoId: 'a1', winnerId: 'p1', loserId: 'p2', winnerGoles: 3, loserGoles: 1 },
      { id: 'm2', asadoId: 'a1', winnerId: 'p1', loserId: 'p2', winnerGoles: 2, loserGoles: 2 },
    ],
  }

  it('returns structured stats with global and asados sections', () => {
    const result = processStatsData(snapshot)
    expect(result).toHaveProperty('global')
    expect(result).toHaveProperty('asados')
    expect(result.asados).toHaveLength(1)
  })

  it('computes global rankings', () => {
    const result = processStatsData(snapshot)
    expect(result.global.rankings.byPoints).toHaveLength(2)
    expect(result.global.rankings.byWinRate).toHaveLength(2)
    expect(result.global.players[0].name).toBe('Alice')
  })

  it('identifies MVP', () => {
    const result = processStatsData(snapshot)
    expect(result.global.mvpHistorico).not.toBeNull()
    expect(result.global.mvpHistorico?.playerId).toBe('p1')
  })

  it('identifies top scorer', () => {
    const result = processStatsData(snapshot)
    expect(result.global.topScorer).not.toBeNull()
  })

  it('handles empty snapshot gracefully', () => {
    const result = processStatsData({ players: [], asados: [], matches: [] })
    expect(result.global.players).toHaveLength(0)
    expect(result.asados).toHaveLength(0)
  })
})

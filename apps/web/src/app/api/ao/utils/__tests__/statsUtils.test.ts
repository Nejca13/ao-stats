import { describe, it, expect } from 'vitest'
import {
  buildPointScale,
  buildPlayerMap,
  computePlayerStats,
  computeAsadoRanking,
  buildEloMap,
  findMayorGoleada,
  processStatsData,
} from '../statsUtils'

interface PlayerInfo {
  name: string
  avatarUrl: string | null
  colorHex: string | null
}

interface PlayerStats {
  playerId: string
  name: string
  played: number
  wins: number
  losses: number
  winRate: number
  goalsScored: number
  goalsConceded: number
  goalDiff: number
  headToHead: Array<{
    opponentId: string
    opponentName: string
    wins: number
    losses: number
  }>
  bestVictim: { playerId: string; name: string; wins: number } | null
  nemesis: { playerId: string; name: string; losses: number } | null
  elo: number
  totalPoints: number
  averagePoints: number
  mvpCount: number
  [key: string]: unknown
}

type PlayerStatsMap = Record<string, PlayerStats>

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
    const map = buildPlayerMap(players) as Record<string, PlayerInfo>
    expect(map['p1'].name).toBe('Alice')
    expect(map['p2'].name).toBe('Bob')
  })

  it('handles empty array', () => {
    expect(buildPlayerMap([])).toEqual({})
  })
})

describe('computePlayerStats', () => {
  const playerMap: Record<string, PlayerInfo> = {
    p1: { name: 'Alice', avatarUrl: null, colorHex: null },
    p2: { name: 'Bob', avatarUrl: null, colorHex: null },
  }

  it('computes basic win/loss stats', () => {
    const matches = [
      { winnerId: 'p1', loserId: 'p2', winnerGoles: 3, loserGoles: 1 },
      { winnerId: 'p1', loserId: 'p2', winnerGoles: 2, loserGoles: 0 },
    ]
    const stats = computePlayerStats(matches, playerMap) as PlayerStatsMap
    expect(stats['p1'].played).toBe(2)
    expect(stats['p1'].wins).toBe(2)
    expect(stats['p1'].winRate).toBe(100)
    expect(stats['p2'].played).toBe(2)
    expect(stats['p2'].losses).toBe(2)
  })

  it('calculates goals correctly', () => {
    const matches = [
      { winnerId: 'p1', loserId: 'p2', winnerGoles: 4, loserGoles: 2 },
    ]
    const stats = computePlayerStats(matches, playerMap) as PlayerStatsMap
    expect(stats['p1'].goalsScored).toBe(4)
    expect(stats['p1'].goalsConceded).toBe(2)
    expect(stats['p1'].goalDiff).toBe(2)
    expect(stats['p2'].goalsScored).toBe(2)
    expect(stats['p2'].goalsConceded).toBe(4)
  })

  it('tracks head-to-head', () => {
    const matches = [
      { winnerId: 'p1', loserId: 'p2' },
      { winnerId: 'p1', loserId: 'p2' },
    ]
    const stats = computePlayerStats(matches, playerMap) as PlayerStatsMap
    expect(stats['p1'].headToHead).toHaveLength(1)
    expect(stats['p1'].headToHead[0].opponentId).toBe('p2')
    expect(stats['p1'].headToHead[0].wins).toBe(2)
    expect(stats['p2'].headToHead[0].losses).toBe(2)
  })

  it('identifies best victim and nemesis', () => {
    const playerMap3: Record<string, PlayerInfo> = {
      p1: { name: 'Alice', avatarUrl: null, colorHex: null },
      p2: { name: 'Bob', avatarUrl: null, colorHex: null },
      p3: { name: 'Charlie', avatarUrl: null, colorHex: null },
    }
    const matches = [
      { winnerId: 'p1', loserId: 'p2' },
      { winnerId: 'p1', loserId: 'p2' },
      { winnerId: 'p3', loserId: 'p1' },
      { winnerId: 'p3', loserId: 'p1' },
      { winnerId: 'p3', loserId: 'p1' },
    ]
    const stats = computePlayerStats(matches, playerMap3) as PlayerStatsMap
    expect(stats['p1'].bestVictim?.playerId).toBe('p2')
    expect(stats['p1'].nemesis?.playerId).toBe('p3')
  })
})

describe('computeAsadoRanking', () => {
  const playerMap: Record<string, PlayerInfo> = {
    p1: { name: 'Alice', avatarUrl: null, colorHex: null },
    p2: { name: 'Bob', avatarUrl: null, colorHex: null },
    p3: { name: 'Charlie', avatarUrl: null, colorHex: null },
  }

  it('ranks by wins, then losses, then H2H', () => {
    const matches = [
      { winnerId: 'p1', loserId: 'p2' },
      { winnerId: 'p1', loserId: 'p3' },
      { winnerId: 'p2', loserId: 'p3' },
    ]
    const ranking = computeAsadoRanking(matches, ['p1', 'p2', 'p3'], playerMap)
    expect(ranking[0].playerId).toBe('p1')
    expect(ranking[1].playerId).toBe('p2')
    expect(ranking[2].playerId).toBe('p3')
  })

  it('assigns points based on position', () => {
    const matches = [
      { winnerId: 'p1', loserId: 'p2' },
    ]
    const ranking = computeAsadoRanking(matches, ['p1', 'p2'], playerMap)
    expect(ranking[0].points).toBe(10)
    expect(ranking[1].points).toBe(1)
  })
})

describe('buildEloMap', () => {
  it('extracts elo with default 1500', () => {
    const players = [
      { id: 'p1', elo: 1600 },
      { id: 'p2' },
    ]
    const map = buildEloMap(players) as Record<string, number>
    expect(map['p1']).toBe(1600)
    expect(map['p2']).toBe(1500)
  })
})

describe('findMayorGoleada', () => {
  const playerMap: Record<string, PlayerInfo> = {
    p1: { name: 'Alice', avatarUrl: null, colorHex: null },
    p2: { name: 'Bob', avatarUrl: null, colorHex: null },
  }

  it('returns the match with the biggest goal difference', () => {
    const matches = [
      { winnerId: 'p1', loserId: 'p2', winnerGoles: 2, loserGoles: 1 },
      { winnerId: 'p1', loserId: 'p2', winnerGoles: 5, loserGoles: 0 },
    ]
    const result = findMayorGoleada(matches, playerMap)
    expect(result?.winnerName).toBe('Alice')
    expect(result?.winnerGoles).toBe(5)
  })

  it('returns null if no match has goals', () => {
    const matches = [
      { winnerId: 'p1', loserId: 'p2', winnerGoles: null, loserGoles: null },
    ]
    expect(findMayorGoleada(matches, playerMap)).toBeNull()
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
      { asadoId: 'a1', winnerId: 'p1', loserId: 'p2', winnerGoles: 3, loserGoles: 1 },
      { asadoId: 'a1', winnerId: 'p1', loserId: 'p2', winnerGoles: 2, loserGoles: 2 },
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
    const empty = { players: [], asados: [], matches: [] }
    const result = processStatsData(empty)
    expect(result.global.players).toHaveLength(0)
    expect(result.asados).toHaveLength(0)
  })
})

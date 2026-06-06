import { z } from 'zod'

// ── Player ──
export const PlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  createdAt: z.string().datetime().nullable().optional(),
  avatarUrl: z.string().max(2048).nullable().optional(),
  colorHex: z.string().max(7).nullable().optional(),
  elo: z.number().int().min(0).max(3000).default(1500),
})

export type Player = z.infer<typeof PlayerSchema>

// ── Tournament Config ──
export const TournamentModeSchema = z.enum(['none', 'winner_stays', 'league', 'one_vs_one'])
export const TournamentStatusSchema = z.enum(['not_started', 'in_progress', 'finished'])
export const MatchStatusSchema = z.enum(['pending', 'completed', 'cancelled'])

export const WinnerStaysConfigSchema = z.object({
  currentWinnerId: z.string().nullable().optional(),
  nextChallengerId: z.string().nullable().optional(),
  queue: z.array(z.string()).default([]),
})

export const TournamentMatchSchema = z.object({
  player1Id: z.string(),
  player2Id: z.string(),
  status: MatchStatusSchema.default('pending'),
})

export const LeagueConfigSchema = z.object({
  fixtures: z.array(TournamentMatchSchema).default([]),
})

export const OneVsOneConfigSchema = z.object({
  player1Id: z.string(),
  player2Id: z.string(),
  player1Wins: z.number().int().default(0),
  player2Wins: z.number().int().default(0),
  targetWins: z.number().int().default(3),
})

export const TournamentConfigSchema = z.object({
  mode: TournamentModeSchema.default('none'),
  status: TournamentStatusSchema.default('not_started'),
  participants: z.array(z.string()).default([]),
  winnerStaysConfig: WinnerStaysConfigSchema.nullable().optional(),
  leagueConfig: LeagueConfigSchema.nullable().optional(),
  oneVsOneConfig: OneVsOneConfigSchema.nullable().optional(),
})

export type TournamentConfig = z.infer<typeof TournamentConfigSchema>

// ── Asado ──
export const AsadoSchema = z.object({
  id: z.string().min(1),
  date: z.string(),
  playerIds: z.array(z.string()),
  comment: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().default(false),
  tournamentConfig: TournamentConfigSchema.nullable().optional(),
})

export type Asado = z.infer<typeof AsadoSchema>

// ── Match ──
export const MatchSchema = z.object({
  id: z.string().min(1),
  asadoId: z.string().min(1),
  winnerId: z.string().min(1),
  loserId: z.string().min(1),
  winnerGoles: z.number().int().min(0).nullable().optional(),
  loserGoles: z.number().int().min(0).nullable().optional(),
  photoUrl: z.string().max(2048).nullable().optional(),
  createdAt: z.string().nullable().optional(),
})

export type Match = z.infer<typeof MatchSchema>

// ── Snapshot (legacy) ──
export const SnapshotMetadataSchema = z.object({
  version: z.string().default('1.0.0'),
  exportedAt: z.string().nullable().optional(),
})

export const SnapshotSchema = z.object({
  players: z.array(PlayerSchema),
  asados: z.array(AsadoSchema),
  matches: z.array(MatchSchema),
  metadata: SnapshotMetadataSchema.default({}),
})

export type Snapshot = z.infer<typeof SnapshotSchema>

// ── Group (for Fase 1 — commercial) ──
export const PlanSchema = z.enum(['free', 'asado', 'parrillero', 'asador_mayor', 'bar_lounge', 'liga'])

export const GroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  ownerId: z.string().min(1),
  plan: PlanSchema.default('free'),
  createdAt: z.string(),
})

export type Group = z.infer<typeof GroupSchema>

import { Collection } from 'mongodb'
import type { Player, Asado, Match } from '@ao/shared'
import db from '@/app/api/ao/utils/mongodbV2'

export const playersCollection = (): Collection<Player> =>
  db.collection<Player>('players')

export const asadosCollection = (): Collection<Asado> =>
  db.collection<Asado>('asados')

export const matchesCollection = (): Collection<Match> =>
  db.collection<Match>('matches')

// Indexes for normalized collections
export async function ensureIndexes() {
  await playersCollection().createIndex({ id: 1 }, { unique: true })
  await asadosCollection().createIndex({ id: 1 }, { unique: true })
  await matchesCollection().createIndex({ id: 1 }, { unique: true })
  await matchesCollection().createIndex({ asadoId: 1 })
}

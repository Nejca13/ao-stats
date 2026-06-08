import { Collection } from 'mongodb'
import type { Player, Asado, Match, Group } from '@ao/shared'
import db from '@/lib/mongodbV2'

export const playersCollection = (): Collection<Player> =>
  db.collection<Player>('players')

export const asadosCollection = (): Collection<Asado> =>
  db.collection<Asado>('asados')

export const matchesCollection = (): Collection<Match> =>
  db.collection<Match>('matches')

export const groupsCollection = (): Collection<Group> =>
  db.collection<Group>('groups')

export async function ensureIndexes() {
  await playersCollection().createIndex({ id: 1 }, { unique: true })
  await asadosCollection().createIndex({ id: 1 }, { unique: true })
  await matchesCollection().createIndex({ id: 1 }, { unique: true })
  await matchesCollection().createIndex({ asadoId: 1 })
  await groupsCollection().createIndex({ id: 1 }, { unique: true })
  await groupsCollection().createIndex({ slug: 1 }, { unique: true })
  await groupsCollection().createIndex({ ownerId: 1 })
}

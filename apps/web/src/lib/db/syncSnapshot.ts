import type { Snapshot } from '@ao/shared'
import { playersCollection, asadosCollection, matchesCollection } from './collections'

/**
 * Writes a snapshot into the normalized collections (asao_v2).
 * Upserts each entity so repeated syncs are idempotent.
 */
export async function syncSnapshotToV2(snapshot: Snapshot) {
  const players = playersCollection()
  const asados = asadosCollection()
  const matches = matchesCollection()

  const playerOps = snapshot.players.map(p => ({
    updateOne: {
      filter: { id: p.id },
      update: { $set: p },
      upsert: true,
    },
  }))

  const asadoOps = snapshot.asados.map(a => ({
    updateOne: {
      filter: { id: a.id },
      update: { $set: a },
      upsert: true,
    },
  }))

  const matchOps = snapshot.matches.map(m => ({
    updateOne: {
      filter: { id: m.id },
      update: { $set: m },
      upsert: true,
    },
  }))

  const results = await Promise.all([
    playerOps.length > 0 ? players.bulkWrite(playerOps, { ordered: false }) : Promise.resolve(null),
    asadoOps.length > 0 ? asados.bulkWrite(asadoOps, { ordered: false }) : Promise.resolve(null),
    matchOps.length > 0 ? matches.bulkWrite(matchOps, { ordered: false }) : Promise.resolve(null),
  ])

  return {
    playersUpserted: results[0]?.upsertedCount ?? 0,
    playersModified: results[0]?.modifiedCount ?? 0,
    asadosUpserted: results[1]?.upsertedCount ?? 0,
    asadosModified: results[1]?.modifiedCount ?? 0,
    matchesUpserted: results[2]?.upsertedCount ?? 0,
    matchesModified: results[2]?.modifiedCount ?? 0,
  }
}

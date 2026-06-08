import { NextResponse } from 'next/server'
import { playersCollection, asadosCollection, matchesCollection } from '@/lib/db'
import { getUserGroup } from '@/lib/plan-gates'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const group = await getUserGroup()
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since')

    const filter: Record<string, any> = { groupId: group.id }
    if (since) {
      filter.createdAt = { $gt: since }
    }

    const [players, asados, matches] = await Promise.all([
      playersCollection().find(filter).project({ _id: 0 }).sort({ name: 1 }).toArray(),
      asadosCollection().find(filter).project({ _id: 0 }).sort({ date: -1 }).toArray(),
      matchesCollection().find(filter).project({ _id: 0 }).sort({ createdAt: -1 }).toArray(),
    ])

    return NextResponse.json({
      players,
      asados,
      matches,
      serverTime: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error en GET /api/v1/sync:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const group = await getUserGroup()
    if (!group) {
      return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { players, asados, matches } = body

    const results = {
      players: 0,
      asados: 0,
      matches: 0,
    }

    if (Array.isArray(players) && players.length > 0) {
      const ops = players.map(p => ({
        updateOne: {
          filter: { id: p.id },
          update: { $set: { ...p, groupId: group.id } },
          upsert: true,
        },
      }))
      const r = await playersCollection().bulkWrite(ops, { ordered: false })
      results.players = (r.upsertedCount ?? 0) + (r.modifiedCount ?? 0)
    }

    if (Array.isArray(asados) && asados.length > 0) {
      const ops = asados.map(a => ({
        updateOne: {
          filter: { id: a.id },
          update: { $set: { ...a, groupId: group.id } },
          upsert: true,
        },
      }))
      const r = await asadosCollection().bulkWrite(ops, { ordered: false })
      results.asados = (r.upsertedCount ?? 0) + (r.modifiedCount ?? 0)
    }

    if (Array.isArray(matches) && matches.length > 0) {
      const ops = matches.map(m => ({
        updateOne: {
          filter: { id: m.id },
          update: { $set: { ...m, groupId: group.id } },
          upsert: true,
        },
      }))
      const r = await matchesCollection().bulkWrite(ops, { ordered: false })
      results.matches = (r.upsertedCount ?? 0) + (r.modifiedCount ?? 0)
    }

    return NextResponse.json({ status: 'ok', upserted: results })
  } catch (error) {
    console.error('Error en POST /api/v1/sync:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}

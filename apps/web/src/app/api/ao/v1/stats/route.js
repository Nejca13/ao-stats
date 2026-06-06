import { NextResponse } from 'next/server'
import clientPromise from '../../utils/mongodb'
import { processStatsData } from '@ao/shared'

const rateLimits = new Map()
const RATE_LIMIT_MS = 1000

const INTERNAL_SECRET = process.env.INTERNAL_STATS_SECRET || 'ao-stats-internal-secure-key-2024'

export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const now = Date.now()
    const lastRequest = rateLimits.get(ip)

    if (lastRequest && (now - lastRequest) < RATE_LIMIT_MS) {
      return NextResponse.json(
        { status: 'error', message: 'Too many requests. Please wait a second.' },
        { status: 429 }
      )
    }
    rateLimits.set(ip, now)

    const secret = request.headers.get('x-internal-secret')
    if (!secret || secret !== INTERNAL_SECRET) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db('asao')

    const latestDoc = await db.collection('ao_snapshots')
      .find({ app: "AO & FIFA" })
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray()

    if (latestDoc.length === 0) {
      return NextResponse.json({
        global: { players: [], rankings: { byPoints: [], byWinRate: [] }, mvpHistorico: null },
        asados: [],
      })
    }

    const stats = processStatsData(latestDoc[0].snapshot)

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error en GET /api/ao/v1/stats:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

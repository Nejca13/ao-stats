import { NextResponse } from 'next/server'
import clientPromise from './utils/mongodb'
import { syncSnapshotToV2 } from '@/lib/db/syncSnapshot'

const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024

const isValidDate = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

const sanitize = (str, length = 1000) => {
  if (typeof str !== 'string') return ''
  return str.trim().substring(0, length)
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('asao')

    const latestDoc = await db.collection('ao_snapshots')
      .find({ app: "AO & FIFA" })
      .sort({ receivedAt: -1 })
      .limit(1)
      .toArray()

    if (latestDoc.length === 0) {
      return NextResponse.json({
        players: [],
        asados: [],
        matches: [],
        metadata: { exportedAt: null, version: "0.0.0" }
      })
    }

    const doc = latestDoc[0]
    const response = { ...doc.snapshot }

    if (response.matches && Array.isArray(response.matches)) {
      response.matches = response.matches.map(m => ({
        ...m,
        photoUrl: m.photoUrl || null
      }))
    }

    response.metadata = {
      ...response.metadata,
      serverReceivedAt: doc.receivedAt,
      snapshotId: doc._id.toString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error en GET /api/ao:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function calculateElo(players, asados, matches) {
  const K = 32
  const elos = {}

  players.forEach(p => {
    elos[p.id] = 1500
  })

  const sortedAsados = [...asados].sort((a, b) => new Date(a.date) - new Date(b.date))

  sortedAsados.forEach(asado => {
    const asadoMatches = matches.filter(m => m.asadoId === asado.id)

    asadoMatches.forEach(match => {
      const winnerId = match.winnerId
      const loserId = match.loserId

      if (elos[winnerId] !== undefined && elos[loserId] !== undefined) {
        const rW = elos[winnerId]
        const rL = elos[loserId]

        const expectedW = 1 / (1 + Math.pow(10, (rL - rW) / 400))
        const expectedL = 1 / (1 + Math.pow(10, (rW - rL) / 400))

        elos[winnerId] = Math.round(rW + K * (1 - expectedW))
        elos[loserId] = Math.round(rL + K * (0 - expectedL))
      }
    })
  })

  players.forEach(p => {
    p.elo = elos[p.id] || 1500
  })
}

function normalizeAvatarUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url
  }
  const cleanId = url.replace(/_/g, '-')
  return `/api_teams/${cleanId}.png`
}

function normalizeSnapshot(payload) {
  if (!payload) return payload

  return {
    players: Array.isArray(payload.players)
      ? payload.players.map(p => ({
          id: p.id,
          name: p.name,
          createdAt: p.created_at || p.createdAt || null,
          avatarUrl: normalizeAvatarUrl(p.avatar_url || p.avatarUrl),
          colorHex: p.color_hex || p.colorHex || null,
          elo: typeof p.elo === 'number' ? p.elo : 1500
        }))
      : [],
    asados: Array.isArray(payload.asados)
      ? payload.asados.map(a => ({
          id: a.id,
          date: a.date,
          playerIds: a.player_ids || a.playerIds || [],
          comment: a.comment || null,
          isActive: a.is_active !== undefined ? a.is_active : (a.isActive !== undefined ? a.isActive : false)
        }))
      : [],
    matches: Array.isArray(payload.matches)
      ? payload.matches.map(m => ({
          id: m.id,
          asadoId: m.asado_id || m.asadoId || null,
          winnerId: m.winner_id || m.winnerId || null,
          loserId: m.loser_id || m.loserId || null,
          winnerGoles: m.winner_goles !== undefined ? m.winner_goles : (m.winnerGoles !== undefined ? m.winnerGoles : null),
          loserGoles: m.loser_goles !== undefined ? m.loser_goles : (m.loserGoles !== undefined ? m.loserGoles : null),
          photoUrl: m.photo_url || m.photoUrl || null,
          createdAt: m.createdAt || m.created_at || null
        }))
      : [],
    metadata: {
      version: payload.metadata?.version || "1.0.0",
      exportedAt: payload.metadata?.exportedAt || payload.metadata?.exported_at || new Date().toISOString()
    }
  }
}

export async function POST(request) {
  try {
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ status: 'error', message: 'Payload too large' }, { status: 413 })
    }

    const rawPayload = await request.json()
    const payload = normalizeSnapshot(rawPayload)
    const errors = []

    const requiredKeys = ['players', 'asados', 'matches', 'metadata']
    requiredKeys.forEach(key => {
      if (!payload[key]) errors.push({ field: key, message: `Falta la clave requerida: ${key}` })
    })

    if (errors.length > 0) return NextResponse.json({ status: 'error', errors }, { status: 400 })

    const { players, asados, matches, metadata } = payload

    if (!Array.isArray(players)) errors.push({ field: 'players', message: 'Debe ser un array' })
    if (!Array.isArray(asados)) errors.push({ field: 'asados', message: 'Debe ser un array' })
    if (!Array.isArray(matches)) errors.push({ field: 'matches', message: 'Debe ser un array' })

    if (errors.length > 0) return NextResponse.json({ status: 'error', errors }, { status: 400 })

    const playerIds = new Set()
    players.forEach((p, i) => {
      if (!p.id || typeof p.id !== 'string') errors.push({ field: `players[${i}].id`, message: 'ID invalido o vacio' })
      if (!p.name) errors.push({ field: `players[${i}].name`, message: 'Nombre requerido' })
      if (p.createdAt && !isValidDate(p.createdAt)) errors.push({ field: `players[${i}].createdAt`, message: 'Fecha invalida' })
      playerIds.add(p.id)
    })

    const asadoIds = new Set()
    asados.forEach((a, i) => {
      if (!a.id || typeof a.id !== 'string') errors.push({ field: `asados[${i}].id`, message: 'ID invalido o vacio' })
      if (!isValidDate(a.date)) errors.push({ field: `asados[${i}].date`, message: 'Fecha invalida' })
      if (!Array.isArray(a.playerIds)) errors.push({ field: `asados[${i}].playerIds`, message: 'Debe ser un array' })
      asadoIds.add(a.id)

      if (Array.isArray(a.playerIds)) {
        a.playerIds.forEach(pid => {
          if (!playerIds.has(pid)) errors.push({ field: `asados[${i}].playerIds`, message: `Player ID ${pid} no existe` })
        })
      }

      if (a.comment) a.comment = sanitize(a.comment)
    })

    matches.forEach((m, i) => {
      if (!m.id || typeof m.id !== 'string') errors.push({ field: `matches[${i}].id`, message: 'ID invalido o vacio' })
      if (!m.asadoId || !asadoIds.has(m.asadoId)) errors.push({ field: `matches[${i}].asadoId`, message: `Asado ID ${m.asadoId} no existe` })
      if (!m.winnerId || !playerIds.has(m.winnerId)) errors.push({ field: `matches[${i}].winnerId`, message: `Winner ID ${m.winnerId} no existe` })
      if (!m.loserId || !playerIds.has(m.loserId)) errors.push({ field: `matches[${i}].loserId`, message: `Loser ID ${m.loserId} no existe` })

      if (m.comment) m.comment = sanitize(m.comment)

      if (m.photoUrl !== undefined && m.photoUrl !== null) {
        if (typeof m.photoUrl !== 'string') {
          errors.push({ field: `matches[${i}].photoUrl`, message: 'photoUrl debe ser un string' })
        } else {
          m.photoUrl = sanitize(m.photoUrl, 2048)
        }
      } else {
        m.photoUrl = null
      }
    })

    if (!isValidDate(metadata.exportedAt)) errors.push({ field: 'metadata.exportedAt', message: 'Fecha de exportacion invalida' })

    if (errors.length > 0) {
      return NextResponse.json({ status: 'error', errors }, { status: 400 })
    }

    calculateElo(players, asados, matches)

    const client = await clientPromise
    const db = client.db('asao')

    const docToInsert = {
      app: "AO & FIFA",
      snapshot: payload,
      receivedAt: new Date().toISOString(),
      source: {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }

    const result = await db.collection('ao_snapshots').insertOne(docToInsert)

    // Write to normalized V2 collections (best-effort, no break if it fails)
    try {
      const v2Result = await syncSnapshotToV2(payload)
      console.log('[V2] Snapshot syncronizado:', v2Result)
    } catch (v2Error) {
      console.error('[V2] Error al syncronizar snapshot (no critico):', v2Error)
    }

    return NextResponse.json({
      status: 'ok',
      id: result.insertedId,
      receivedAt: docToInsert.receivedAt
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/ao:', error)
    return NextResponse.json(
      { status: 'error', message: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}

import clientPromise from '@/app/api/ao/utils/mongodb'
import Link from 'next/link'
import s from './dashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const client = await clientPromise
  const db = client.db('asao')
  const latest = await db.collection('ao_snapshots')
    .find({ app: "AO & FIFA" })
    .sort({ receivedAt: -1 })
    .limit(1)
    .toArray()

  const snapshot = latest[0]?.snapshot
  const players = snapshot?.players || []
  const asados = snapshot?.asados || []
  const matches = snapshot?.matches || []

  return (
    <div className={s.dashboardHome}>
      <h1 className={s.dashboardTitle}>Panel de Control</h1>
      <p className={s.dashboardSubtitle}>Resumen general de la plataforma</p>

      <div className={s.cards}>
        <Link href="/dashboard/players" className={s.card} style={{ textDecoration: 'none' }}>
          <div className={s.cardIcon}>👤</div>
          <div className={s.cardLabel}>Jugadores</div>
          <div className={s.cardValue}>{players.length}</div>
        </Link>
        <Link href="/dashboard/asados" className={s.card} style={{ textDecoration: 'none' }}>
          <div className={s.cardIcon}>🔥</div>
          <div className={s.cardLabel}>Asados</div>
          <div className={s.cardValue}>{asados.length}</div>
        </Link>
        <Link href="/dashboard/matches" className={s.card} style={{ textDecoration: 'none' }}>
          <div className={s.cardIcon}>⚽</div>
          <div className={s.cardLabel}>Partidos</div>
          <div className={s.cardValue}>{matches.length}</div>
        </Link>
        <Link href="/dashboard/crests" className={s.card} style={{ textDecoration: 'none' }}>
          <div className={s.cardIcon}>🛡️</div>
          <div className={s.cardLabel}>Escudos</div>
          <div className={s.cardValue}>Subir</div>
        </Link>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { IconBallFootball, IconSword } from '@tabler/icons-react'
import { getDashboardData } from '@/lib/dashboard-data'
import s from '../dashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function MatchesPage() {
  const data = await getDashboardData()
  if (!data) redirect('/auth/login')

  const { matches, players, usingLegacy } = data
  const playerMap = Object.fromEntries(players.map(p => [p.id, p.name]))

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Partidos</h1>
          <p className={s.pageDesc}>{matches.length} partidos registrados</p>
        </div>
      </div>

      {usingLegacy && (
        <div style={{
          background: 'rgba(241,123,32,0.08)',
          border: '1px solid rgba(241,123,32,0.2)',
          borderRadius: 10,
          padding: '10px 16px',
          fontSize: '0.8rem',
          color: 'rgba(251,217,173,0.6)',
          marginBottom: 20,
        }}>
          Datos del snapshot general. Asocia tu grupo desde la app para ver datos exclusivos.
        </div>
      )}

      {matches.length === 0 ? (
        <div className={s.emptyState}>
          <IconBallFootball size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No hay partidos registrados</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {matches.map(m => (
            <div key={m.id} style={{
              background: 'rgba(28,20,16,0.7)',
              border: '1px solid rgba(244,152,67,0.12)',
              borderRadius: 12,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <IconSword size={20} style={{ color: 'rgba(251,217,173,0.5)' }} />
              <div>
                <div style={{ fontWeight: 600 }}>
                  {playerMap[m.winnerId] ?? m.winnerId} vs {playerMap[m.loserId] ?? m.loserId}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)' }}>
                  {m.winnerGoles !== null ? `${m.winnerGoles} - ${m.loserGoles}` : 'Sin resultado'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

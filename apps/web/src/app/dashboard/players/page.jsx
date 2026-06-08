import { redirect } from 'next/navigation'
import { IconUsers, IconUser } from '@tabler/icons-react'
import { getDashboardData } from '@/lib/dashboard-data'
import s from '../dashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function PlayersPage() {
  const data = await getDashboardData()
  if (!data) redirect('/auth/login')

  const { players, usingLegacy } = data

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Jugadores</h1>
          <p className={s.pageDesc}>{players.length} jugadores registrados</p>
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

      {players.length === 0 ? (
        <div className={s.emptyState}>
          <IconUsers size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No hay jugadores registrados</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.map(p => (
            <div key={p.id} style={{
              background: 'rgba(28,20,16,0.7)',
              border: '1px solid rgba(244,152,67,0.12)',
              borderRadius: 12,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <IconUser size={20} style={{ color: 'rgba(251,217,173,0.5)' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)' }}>
                  ELO: {p.elo || 1500}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

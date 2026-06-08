import Image from 'next/image'
import { redirect } from 'next/navigation'
import { IconBallFootball, IconCalendarEvent } from '@tabler/icons-react'
import { getDashboardData } from '@/lib/dashboard-data'
import s from '../dashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function MatchesPage() {
  const data = await getDashboardData()
  if (!data) redirect('/auth/login')

  const { matches, players, asados } = data
  const playerMap = Object.fromEntries(players.map(p => [p.id, p]))
  const asadoMap = Object.fromEntries(asados.map(a => [a.id, a]))

  const matchesByAsado = {}
  for (const m of matches) {
    if (!matchesByAsado[m.asadoId]) matchesByAsado[m.asadoId] = []
    matchesByAsado[m.asadoId].push(m)
  }

  const asadosWithMatches = asados.filter(a => matchesByAsado[a.id])

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Partidos</h1>
          <p className={s.pageDesc}>{matches.length} partidos en {asadosWithMatches.length} asados</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className={s.emptyState}>
          <IconBallFootball size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No hay partidos registrados</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {asadosWithMatches.map(a => {
            const asadoMatches = matchesByAsado[a.id] || []
            return (
              <div key={a.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <IconCalendarEvent size={18} style={{ color: '#f17b20' }} />
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'rgba(251,217,173,0.9)' }}>
                    {a.date}
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(251,217,173,0.4)', marginLeft: 'auto' }}>
                    {asadoMatches.length} partido{asadoMatches.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {asadoMatches.map(m => {
                    const winner = playerMap[m.winnerId]
                    const loser = playerMap[m.loserId]
                    return (
                      <div key={m.id} style={{
                        background: 'rgba(28,20,16,0.7)', border: '1px solid rgba(244,152,67,0.12)',
                        borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          {winner?.avatarUrl ? (
                            <Image src={winner.avatarUrl} alt="" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} unoptimized />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(76,175,80,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#4caf50', fontWeight: 700 }}>
                              {winner?.name?.[0] || '?'}
                            </div>
                          )}
                          <span style={{ fontWeight: 600, color: '#4caf50', fontSize: '0.9rem' }}>{winner?.name ?? m.winnerId}</span>
                        </div>
                        <div style={{ background: 'rgba(244,152,67,0.08)', borderRadius: 8, padding: '4px 14px', fontWeight: 800, fontSize: '1rem', color: '#f17b20', whiteSpace: 'nowrap' }}>
                          {m.winnerGoles !== null ? `${m.winnerGoles} - ${m.loserGoles}` : 'vs'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                          <span style={{ fontWeight: 600, color: 'rgba(251,217,173,0.6)', fontSize: '0.9rem' }}>{loser?.name ?? m.loserId}</span>
                          {loser?.avatarUrl ? (
                            <Image src={loser.avatarUrl} alt="" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} unoptimized />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(244,67,54,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#ef5350', fontWeight: 700 }}>
                              {loser?.name?.[0] || '?'}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

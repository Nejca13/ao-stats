import clientPromise from '@/app/api/ao/utils/mongodb'
import s from '../dashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function MatchesPage() {
  const client = await clientPromise
  const db = client.db('asao')
  const latest = await db.collection('ao_snapshots')
    .find({ app: "AO & FIFA" })
    .sort({ receivedAt: -1 })
    .limit(1)
    .toArray()

  const matches = latest[0]?.snapshot?.matches || []

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Partidos</h1>
          <p className={s.pageDesc}>{matches.length} partidos registrados</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className={s.emptyState}>
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
              <div style={{ fontSize: '1.2rem' }}>⚽</div>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {m.winnerId} vs {m.loserId}
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

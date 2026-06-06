import clientPromise from '@/app/api/ao/utils/mongodb'
import s from '../dashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function AsadosPage() {
  const client = await clientPromise
  const db = client.db('asao')
  const latest = await db.collection('ao_snapshots')
    .find({ app: "AO & FIFA" })
    .sort({ receivedAt: -1 })
    .limit(1)
    .toArray()

  const asados = latest[0]?.snapshot?.asados || []

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Asados</h1>
          <p className={s.pageDesc}>{asados.length} torneos registrados</p>
        </div>
      </div>

      {asados.length === 0 ? (
        <div className={s.emptyState}>
          <p>No hay asados registrados</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {asados.map(a => (
            <div key={a.id} style={{
              background: 'rgba(28,20,16,0.7)',
              border: '1px solid rgba(244,152,67,0.12)',
              borderRadius: 12,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ fontSize: '1.2rem' }}>🔥</div>
              <div>
                <div style={{ fontWeight: 600 }}>{a.date}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)' }}>
                  {a.playerIds?.length || 0} jugadores · {a.isActive ? 'Activo' : 'Finalizado'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: '$0',
    period: '',
    desc: '10 partidos visibles, 1 asado activo',
    features: ['10 partidos', '1 asado activo', 'Stats básicas'],
  },
  {
    id: 'asado',
    name: 'Asado',
    price: '$3',
    period: '/mes',
    desc: 'Historial ilimitado para el grupo',
    features: ['Historial ilimitado', 'Cara a cara', 'Fotos ilimitadas', 'Compartir ranking'],
  },
  {
    id: 'parrillero',
    name: 'Parrillero',
    price: '$10',
    period: '/mes',
    desc: 'Estadísticas en serio',
    features: ['Todo lo de Asado', 'ELO histórico con gráfico', 'Exportar CSV', 'Certificado PDF'],
  },
  {
    id: 'asador_mayor',
    name: 'Asador Mayor',
    price: '$20',
    period: '/mes',
    desc: 'Para el que organiza todo',
    features: ['Todo lo de Parrillero', 'Múltiples grupos', 'API key', 'Soporte prioritario'],
  },
]

export default function AccountManager({
  group,
  userEmail,
}: {
  group: { id: string; name: string; plan: string; memberIds: string[] } | null
  userEmail: string
}) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!group) {
    return (
      <div
        style={{
          background: 'rgba(28,20,16,0.7)',
          border: '1px solid rgba(244,152,67,0.12)',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
          maxWidth: 500,
        }}
      >
        <p style={{ color: 'rgba(251,217,173,0.6)' }}>
          Todavía no tenés un grupo. Crealo en Mi Grupo.
        </p>
        <Link
          href="/dashboard/grupo"
          style={{
            display: 'inline-block',
            marginTop: 16,
            padding: '10px 24px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #f17b20, #e26014)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Ir a Mi Grupo
        </Link>
      </div>
    )
  }

  async function handleUpgrade(planId: string) {
    setLoading(planId)
    try {
      const res = await fetch('/api/v1/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, groupId: group!.id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al crear el pago')

      window.location.href = data.initPoint
    } catch (err: any) {
      alert(err.message)
      setLoading(null)
    }
  }

  return (
    <div>
      <div
        style={{
          background: 'rgba(28,20,16,0.7)',
          border: '1px solid rgba(244,152,67,0.12)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
          maxWidth: 500,
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>{group.name}</h2>
        <div style={{ fontSize: '0.85rem', color: 'rgba(251,217,173,0.6)' }}>
          <div style={{ marginBottom: 6 }}>
            Email: <span style={{ color: '#fff' }}>{userEmail}</span>
          </div>
          <div style={{ marginBottom: 6 }}>
            Miembros: <span style={{ color: '#fff' }}>{group.memberIds.length}</span>
          </div>
          <div>
            Plan actual:{' '}
            <span
              style={{
                color: group.plan === 'free' ? '#f17b20' : '#4caf50',
                fontWeight: 700,
              }}
            >
              {PLANS.find(p => p.id === group.plan)?.name ?? group.plan}
            </span>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Cambiar de plan</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          maxWidth: 960,
        }}
      >
        {PLANS.map(plan => {
          const isCurrent = group.plan === plan.id
          return (
            <div
              key={plan.id}
              style={{
                background: isCurrent
                  ? 'linear-gradient(135deg, rgba(241,123,32,0.12), rgba(226,96,20,0.06))'
                  : 'rgba(28,20,16,0.7)',
                border: isCurrent
                  ? '2px solid #f17b20'
                  : '1px solid rgba(244,152,67,0.12)',
                borderRadius: 16,
                padding: 24,
                position: 'relative',
              }}
            >
              {isCurrent && (
                <div
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: 16,
                    background: 'linear-gradient(135deg, #f17b20, #e26014)',
                    borderRadius: 12,
                    padding: '2px 12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Actual
                </div>
              )}

              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '2rem', fontWeight: 900 }}>{plan.price}</span>
                <span style={{ color: 'rgba(251,217,173,0.5)', fontSize: '0.85rem' }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)', marginBottom: 16 }}>
                {plan.desc}
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 20px',
                  fontSize: '0.8rem',
                }}
              >
                {plan.features.map(f => (
                  <li
                    key={f}
                    style={{
                      padding: '4px 0',
                      borderBottom: '1px solid rgba(244,152,67,0.06)',
                      color: 'rgba(251,217,173,0.7)',
                    }}
                  >
                    ✓ {f}
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 10,
                    border: 'none',
                    background:
                      plan.id === 'free'
                        ? 'rgba(100,100,100,0.2)'
                        : 'linear-gradient(135deg, #f17b20, #e26014)',
                    color: plan.id === 'free' ? '#999' : '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: loading === plan.id ? 'wait' : 'pointer',
                  }}
                >
                  {loading === plan.id ? 'Procesando...' : plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

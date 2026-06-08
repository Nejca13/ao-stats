import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: '$0',
    desc: 'Para probar la plataforma',
    features: ['10 partidos visibles', '1 asado activo', 'Stats básicas', 'Fotos limitadas'],
    cta: 'Comenzar',
    href: '/auth/login',
    highlight: false,
  },
  {
    id: 'asado',
    name: 'Asado',
    price: '$3',
    period: '/mes',
    desc: 'Para el grupo que juega seguido',
    features: [
      'Historial ilimitado',
      'Todos los asados',
      'Cara a cara completo',
      'Fotos ilimitadas',
      'Compartir ranking a WhatsApp',
    ],
    cta: 'Elegir Plan',
    href: '/dashboard/account',
    highlight: true,
  },
  {
    id: 'parrillero',
    name: 'Parrillero',
    price: '$10',
    period: '/mes',
    desc: 'Para los que quieren estadísticas en serio',
    features: [
      'Todo lo de Asado',
      'ELO histórico con gráfico',
      'Exportar datos a CSV',
      'Badge personalizado del grupo',
      'Certificado de Campeón PDF',
    ],
    cta: 'Elegir Plan',
    href: '/dashboard/account',
    highlight: false,
  },
  {
    id: 'asador_mayor',
    name: 'Asador Mayor',
    price: '$20',
    period: '/mes',
    desc: 'Para el que organiza todo',
    features: [
      'Todo lo de Parrillero',
      'Múltiples grupos',
      'API key para integraciones',
      'Soporte prioritario',
      'Branding personalizado',
    ],
    cta: 'Elegir Plan',
    href: '/dashboard/account',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0a07',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        padding: '60px 24px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link
          href="/"
          style={{ color: 'rgba(251,217,173,0.5)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: 40 }}
        >
          ← Volver
        </Link>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>
          Planes para tu grupo
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(251,217,173,0.6)',
            fontSize: '1.1rem',
            maxWidth: 600,
            margin: '0 auto 48px',
          }}
        >
          Un paga, todos juegan. Dividan cuenta entre los amigos.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                background: plan.highlight
                  ? 'linear-gradient(135deg, rgba(241,123,32,0.12), rgba(226,96,20,0.06))'
                  : 'rgba(28,20,16,0.7)',
                border: plan.highlight
                  ? '2px solid #f17b20'
                  : '1px solid rgba(244,152,67,0.12)',
                borderRadius: 16,
                padding: '28px 24px',
                position: 'relative',
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #f17b20, #e26014)',
                    borderRadius: 20,
                    padding: '4px 16px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Recomendado
                </div>
              )}

              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{plan.name}</h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(251,217,173,0.5)', marginBottom: 16 }}>
                {plan.desc}
              </p>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900 }}>{plan.price}</span>
                {plan.period && (
                  <span style={{ color: 'rgba(251,217,173,0.5)', fontSize: '0.9rem' }}>{plan.period}</span>
                )}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', fontSize: '0.85rem' }}>
                {plan.features.map(f => (
                  <li
                    key={f}
                    style={{
                      padding: '6px 0',
                      borderBottom: '1px solid rgba(244,152,67,0.06)',
                    }}
                  >
                    ✓ {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  borderRadius: 10,
                  background: plan.highlight
                    ? 'linear-gradient(135deg, #f17b20, #e26014)'
                    : 'rgba(244,152,67,0.1)',
                  color: plan.highlight ? '#fff' : '#f17b20',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: 'center',
            color: 'rgba(251,217,173,0.3)',
            fontSize: '0.8rem',
            marginTop: 48,
          }}
        >
          Pagos via Mercado Pago.
        </p>
      </div>
    </div>
  )
}

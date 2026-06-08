'use client'

export default function DashboardError({ error, reset }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Algo salio mal</h2>
      <p style={{ color: 'rgba(251,217,173,0.6)', marginBottom: 24, fontSize: '0.9rem' }}>
        {error?.message || 'Error inesperado en el dashboard'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '12px 28px',
          borderRadius: 10,
          border: 'none',
          background: 'linear-gradient(135deg, #f17b20, #e26014)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}
      >
        Intentar de nuevo
      </button>
    </div>
  )
}

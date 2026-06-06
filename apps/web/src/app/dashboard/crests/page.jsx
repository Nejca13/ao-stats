import Link from 'next/link'
import s from '../dashboard.module.css'

export default function CrestsPage() {
  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Escudos de Equipos</h1>
          <p className={s.pageDesc}>Sube y gestiona los escudos de los equipos</p>
        </div>
      </div>

      <div style={{
        background: 'rgba(28,20,16,0.7)',
        border: '1px solid rgba(244,152,67,0.12)',
        borderRadius: 16,
        padding: 32,
        textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 16px', color: 'rgba(251,217,173,0.6)' }}>
          Sube escudos de equipos a Cloudinary para usarlos en la plataforma.
        </p>
        <Link
          href="/upload"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #f17b20, #e26014)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            padding: '12px 28px',
            borderRadius: 12,
            fontSize: '0.95rem',
          }}
        >
          Subir Escudo
        </Link>
      </div>
    </div>
  )
}

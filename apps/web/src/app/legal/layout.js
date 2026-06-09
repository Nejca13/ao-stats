import Link from 'next/link'
import { IconBallFootball, IconFileText, IconShieldLock } from '@tabler/icons-react'

export const metadata = {
  title: 'Legal · AO Stats',
}

const NAV_ITEMS = [
  { href: '/legal/terms', label: 'Términos', icon: IconFileText },
  { href: '/legal/privacy', label: 'Privacidad', icon: IconShieldLock },
]

export default function LegalLayout({ children }) {
  return (
    <div style={{
      background: '#0c0a09',
      color: '#fef7ee',
      fontFamily: 'Inter, system-ui, sans-serif',
      minHeight: '100vh',
    }}>
      {/* Top nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(12,10,9,0.85)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(244,152,67,0.1)',
      }}>
        <div style={{
          maxWidth: 860, margin: '0 auto', padding: '0 24px',
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', color: '#f8bd79', fontWeight: 800,
            fontSize: '1.05rem',
          }}>
            <IconBallFootball size={20} /> AO Stats
          </Link>

          <div style={{ display: 'flex', gap: 4 }}>
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8,
                textDecoration: 'none', color: 'rgba(251,217,173,0.7)',
                fontSize: '0.875rem', fontWeight: 500,
                transition: 'color 0.2s, background 0.2s',
              }}>
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ padding: '88px 24px 60px', maxWidth: 860, margin: '0 auto' }}>
        {children}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(244,152,67,0.08)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ color: 'rgba(251,217,173,0.3)', fontSize: '0.8rem', margin: 0 }}>
          AO Stats © {new Date().getFullYear()} · Nejca ·{' '}
          <Link href="/legal" style={{ color: 'rgba(244,152,67,0.5)', textDecoration: 'none' }}>
            Legal
          </Link>
        </p>
      </footer>
    </div>
  )
}

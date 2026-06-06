import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import s from './dashboard.module.css'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Panel', icon: '📊' },
  { href: '/dashboard/players', label: 'Jugadores', icon: '👤' },
  { href: '/dashboard/asados', label: 'Asados', icon: '🔥' },
  { href: '/dashboard/matches', label: 'Partidos', icon: '⚽' },
  { href: '/dashboard/crests', label: 'Escudos', icon: '🛡️' },
]

export default async function DashboardLayout({ children }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className={s.layout}>
      <aside className={s.sidebar}>
        <div className={s.sidebarHeader}>
          <Link href="/dashboard" className={s.logo}>
            <span>⚽</span> AO Stats
          </Link>
        </div>
        <nav className={s.nav}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className={s.navItem}>
              <span className={s.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={s.sidebarFooter}>
          <Link href="/stats" className={s.backLink}>← Ver estadisticas</Link>
        </div>
      </aside>
      <main className={s.main}>{children}</main>
    </div>
  )
}

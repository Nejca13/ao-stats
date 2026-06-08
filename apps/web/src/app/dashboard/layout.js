import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  IconDashboard,
  IconUsers,
  IconFlame,
  IconBallFootball,
  IconHome,
  IconShield,
  IconSettings,
} from '@tabler/icons-react'
import s from './dashboard.module.css'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Panel', icon: IconDashboard },
  { href: '/dashboard/players', label: 'Jugadores', icon: IconUsers },
  { href: '/dashboard/asados', label: 'Asados', icon: IconFlame },
  { href: '/dashboard/matches', label: 'Partidos', icon: IconBallFootball },
  { href: '/dashboard/grupo', label: 'Mi Grupo', icon: IconHome },
  { href: '/dashboard/crests', label: 'Escudos', icon: IconShield },
  { href: '/dashboard/account', label: 'Cuenta', icon: IconSettings },
]

export default async function DashboardLayout({ children }) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  return (
    <div className={s.layout}>
      <aside className={s.sidebar}>
        <div className={s.sidebarHeader}>
          <Link href="/dashboard" className={s.logo}>
            <IconBallFootball size={20} /> AO Stats
          </Link>
        </div>
        <nav className={s.nav}>
          {NAV_ITEMS.map(item => {
            const NavIcon = item.icon
            return (
              <Link key={item.href} href={item.href} className={s.navItem}>
                <span className={s.navIcon}>
                  <NavIcon size={18} />
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className={s.sidebarFooter}>
          <Link href="/stats" className={s.backLink}>Ver estadisticas</Link>
        </div>
      </aside>
      <main className={s.main}>{children}</main>
    </div>
  )
}

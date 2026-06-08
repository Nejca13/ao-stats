import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  IconUsers,
  IconFlame,
  IconBallFootball,
  IconShield,
  IconHome,
} from '@tabler/icons-react'
import { getDashboardData } from '@/lib/dashboard-data'
import s from './dashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getDashboardData()
  if (!data) redirect('/auth/login')

  const { group, players, asados, matches } = data

  const cards = [
    { href: '/dashboard/players', icon: IconUsers, label: 'Jugadores', value: players.length },
    { href: '/dashboard/asados', icon: IconFlame, label: 'Asados', value: asados.length },
    { href: '/dashboard/matches', icon: IconBallFootball, label: 'Partidos', value: matches.length },
    { href: '/dashboard/crests', icon: IconShield, label: 'Escudos', value: 'Subir' },
  ]

  return (
    <div className={s.dashboardHome}>
      <h1 className={s.dashboardTitle}>Panel de Control</h1>
      {group ? (
        <p className={s.dashboardSubtitle}>
          <IconHome size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {group.name}
        </p>
      ) : (
        <p className={s.dashboardSubtitle}>
          Crea o unite a un grupo en Mi Grupo para empezar
        </p>
      )}

      <div className={s.cards}>
        {cards.map(card => {
          const CardIcon = card.icon
          return (
            <Link key={card.href} href={card.href} className={s.card} style={{ textDecoration: 'none' }}>
              <div className={s.cardIcon}>
                <CardIcon size={24} />
              </div>
              <div className={s.cardLabel}>{card.label}</div>
              <div className={s.cardValue}>{card.value}</div>
            </Link>
          )
        })}
      </div>

      {group?.plan === 'free' && (
        <div style={{
          background: 'rgba(244,152,67,0.08)',
          border: '1px solid rgba(244,152,67,0.2)',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 16,
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Plan Gratis</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)' }}>
              {data.limited ? 'Mostrando los ultimos 10 partidos y 1 asado' : 'Limite de 10 partidos y 1 asado'}
            </div>
          </div>
          <Link href="/pricing" style={{
            padding: '8px 18px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #f17b20, #e26014)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}>
            Upgrade
          </Link>
        </div>
      )}
    </div>
  )
}

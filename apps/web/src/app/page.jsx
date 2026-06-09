import Link from 'next/link'
import {
  IconChartBar,
  IconTrophy,
  IconFlame,
  IconDeviceMobile,
  IconFileText,
  IconShieldLock,
  IconBallFootball,
  IconStar,
  IconArrowRight,
  IconSparkles,
  IconUsers,
  IconTarget,
} from '@tabler/icons-react'
import Nav from '@/components/Nav'
import s from './landing.module.css'

const NAV_LINKS = [
  { href: '/stats', label: 'Estadísticas' },
  { href: '/app', label: 'App' },
  { href: '/auth/login', label: 'Dashboard', cta: true },
]

const STATS = [
  { value: '∞', label: 'Torneos', icon: <IconTrophy size={16} /> },
  { value: 'ELO', label: 'Sistema de ranking', icon: <IconStar size={16} /> },
  { value: '100%', label: 'Offline-first', icon: <IconDeviceMobile size={16} /> },
  { value: 'Live', label: 'Estadísticas', icon: <IconChartBar size={16} /> },
]

const FEATURES = [
  {
    icon: <IconChartBar size={28} />,
    title: 'Estadísticas en vivo',
    desc: 'Win rate, ELO, rendimiento histórico y métricas detalladas de cada jugador, actualizadas al instante.',
  },
  {
    icon: <IconTrophy size={28} />,
    title: 'Rankings y MVPs',
    desc: 'Clasificación global, mejor jugador de cada torneo y enfrentamientos cara a cara entre rivales.',
  },
  {
    icon: <IconFlame size={28} />,
    title: 'Momentos épicos',
    desc: 'Registrá goleadas históricas, subí fotos de los partidos y revivé los mejores momentos.',
  },
  {
    icon: <IconDeviceMobile size={28} />,
    title: 'App Android nativa',
    desc: 'Funciona offline, sincroniza en segundo plano y siempre tenés tus datos a mano.',
  },
  {
    icon: <IconUsers size={28} />,
    title: 'Gestión de grupos',
    desc: 'Administrá jugadores, equipos y temporadas desde un solo panel centralizado.',
  },
  {
    icon: <IconTarget size={28} />,
    title: 'Head-to-Head',
    desc: 'Historial completo de enfrentamientos directos entre cualquier par de jugadores.',
  },
]

export default function LandingPage() {
  return (
    <div className={s.landing}>
      <Nav links={NAV_LINKS} />

      {/* ── HERO ─────────────────────────────── */}
      <section className={s.hero}>
        <div className={s.heroBg} />
        <div className={s.heroGrid} />
        <div className={s.heroGlow1} />
        <div className={s.heroGlow2} />

        <div className={s.heroContent}>
          <div className={s.badge}>
            <IconSparkles size={13} />
            Torneos · Estadísticas · Argentina
          </div>

          <h1 className={s.heroTitle}>
            Tu liga,{' '}
            <span className={s.heroHighlight}>tus estadísticas</span>
          </h1>

          <p className={s.heroDesc}>
            Organizá tus torneos, seguí el rendimiento de cada jugador,
            descubrí quién es el MVP y revivís los momentos épicos de cada jornada.
          </p>

          <div className={s.heroActions}>
            <Link href="/stats" className={s.btnPrimary}>
              Ver Estadísticas
              <IconArrowRight size={17} />
            </Link>
            <Link href="/app" className={s.btnSecondary}>
              <IconDeviceMobile size={17} />
              App Android
            </Link>
          </div>

          <div className={s.heroPills}>
            {STATS.map((st) => (
              <div key={st.label} className={s.pill}>
                <span className={s.pillIcon}>{st.icon}</span>
                <span className={s.pillValue}>{st.value}</span>
                <span className={s.pillDivider} />
                <span className={s.pillLabel}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.scrollHint}>
          <span className={s.scrollDot} />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className={s.features}>
        <div className={s.inner}>
          <p className={s.sectionLabel}>
            <IconSparkles size={13} /> Funcionalidades
          </p>
          <h2 className={s.sectionTitle}>Todo lo que necesitás</h2>
          <p className={s.sectionDesc}>
            Una plataforma completa para gestionar tus torneos.
          </p>

          <div className={s.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={s.featureCard}>
                <div className={s.featureCardGlow} />
                <div className={s.featureIcon}>{f.icon}</div>
                <h3 className={s.featureTitle}>{f.title}</h3>
                <p className={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ─────────────────────────── */}
      <section className={s.showcase}>
        <div className={s.inner}>
          <div className={s.showcaseLayout}>

            <div className={s.showcaseText}>
              <p className={s.sectionLabel}>
                <IconBallFootball size={13} /> Diseñado para vos
              </p>
              <h2 className={s.showcaseTitle}>
                De la cancha a las
                <span className={s.heroHighlight}> estadísticas</span>
              </h2>
              <p className={s.showcaseDesc}>
                Cada gol, cada victoria, cada derrota queda registrada. Analizá tu
                progreso con el sistema ELO y rankings globales acumulados.
              </p>
              <ul className={s.showcaseList}>
                {['Sistema ELO base 1500', 'MVP por jornada', 'Head-to-Head histórico', 'Ranking global acumulado'].map(f => (
                  <li key={f} className={s.showcaseItem}>
                    <span className={s.showcaseDot} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/stats" className={s.btnPrimary}>
                Ver stats ahora <IconArrowRight size={17} />
              </Link>
            </div>

            <div className={s.showcaseVisual}>
              <div className={s.mockCard} style={{ '--delay': '0s' }}>
                <div className={s.mockHeader}>
                  <IconTrophy size={14} color="#f49843" />
                  <span>Ranking Global</span>
                </div>
                {[
                  { rank: '#1', initial: 'N', name: 'Nico', elo: '1742', bg: '#f49843' },
                  { rank: '#2', initial: 'M', name: 'Maxi', elo: '1689', bg: '#e26014' },
                  { rank: '#3', initial: 'R', name: 'Rodri', elo: '1621', bg: '#f17b20' },
                ].map((p, i) => (
                  <div key={p.name} className={s.mockRow} style={{ '--i': i }}>
                    <span className={s.mockRankNum}>{p.rank}</span>
                    <span className={s.mockAvatar} style={{ background: p.bg }}>{p.initial}</span>
                    <span className={s.mockName}>{p.name}</span>
                    <span className={s.mockElo}>{p.elo}</span>
                  </div>
                ))}
              </div>

              <div className={s.mockCard} style={{ '--delay': '0.2s', marginTop: '28px', marginLeft: 'auto' }}>
                <div className={s.mockHeader}>
                  <IconFlame size={14} color="#f49843" />
                  <span>Último Partido</span>
                </div>
                <div className={s.mockMatch}>
                  <span className={s.mockTeam}>Nico</span>
                  <span className={s.mockScore}>3 – 1</span>
                  <span className={s.mockTeam}>Maxi</span>
                </div>
                <div className={s.mockBadge}>🏆 MVP del Asado</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className={s.cta}>
        <div className={s.ctaGlow} />
        <div className={s.inner}>
          <div className={s.badge}>
            <IconSparkles size={13} /> Gratis para empezar
          </div>
          <h2 className={s.ctaTitle}>¿Listo para competir?</h2>
          <p className={s.ctaDesc}>
            Organizá tu próximo torneo, invitá a tus amigos y descubrí quién es el verdadero campeón.
          </p>
          <div className={s.ctaActions}>
            <Link href="/stats" className={s.btnPrimary}>
              Ver Estadísticas <IconArrowRight size={17} />
            </Link>
            <Link href="/auth/login" className={s.btnGhost}>
              Panel Admin
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <span className={s.footerLogo}>
            <IconBallFootball size={16} /> AO Stats
          </span>
          <p className={s.footerCopy}>© {new Date().getFullYear()} · Nejca</p>
          <div className={s.footerLinks}>
            <Link href="/legal/terms" className={s.footerLink}>
              <IconFileText size={13} /> Términos
            </Link>
            <Link href="/legal/privacy" className={s.footerLink}>
              <IconShieldLock size={13} /> Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

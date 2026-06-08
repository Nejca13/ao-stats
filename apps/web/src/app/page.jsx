import Link from 'next/link'
import {
  IconChartBar,
  IconTrophy,
  IconFlame,
  IconDeviceMobile,
} from '@tabler/icons-react'
import Nav from '@/components/Nav'
import s from './landing.module.css'

const NAV_LINKS = [
  { href: '/stats', label: 'Estadisticas' },
  { href: '/app', label: 'App' },
  { href: '/auth/login', label: 'Dashboard', cta: true },
]

export default function LandingPage() {
  return (
    <div className={s.landing}>
      <Nav links={NAV_LINKS} />

      <section className={s.hero}>
        <div className={s.heroBg} />
        <div className={s.heroContent}>
          <div className={s.heroBadge}>FIFA Torneos</div>
          <h1 className={s.heroTitle}>
            Tu liga,{' '}
            <span className={s.heroHighlight}>tus estadisticas</span>
          </h1>
          <p className={s.heroDesc}>
            Organiza tus torneos de FIFA, sigue el rendimiento de cada jugador,
            descubre quien es el MVP y revive los momentos epicos de cada jornada.
          </p>
          <div className={s.heroActions}>
            <Link href="/stats" className={s.btnPrimary}>
              Ver Estadisticas
            </Link>
            <Link href="/app" className={s.btnSecondary}>
              App Android
            </Link>
            <Link href="/auth/login" className={s.btnSecondary}>
              Panel Admin
            </Link>
          </div>
        </div>
      </section>

      <section className={s.features}>
        <div className={s.sectionInner}>
          <h2 className={s.sectionTitle}>Todo lo que necesitas</h2>
          <p className={s.sectionDesc}>
            Una plataforma completa para gestionar tus torneos de FIFA.
          </p>
          <div className={s.featuresGrid}>
            <div className={s.featureCard}>
              <div className={s.featureIcon}><IconChartBar size={28} /></div>
              <h3 className={s.featureTitle}>Estadisticas en vivo</h3>
              <p className={s.featureDesc}>
                Rendimiento, win rate, ELO y metricas detalladas de cada jugador actualizadas automaticamente.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={s.featureIcon}><IconTrophy size={28} /></div>
              <h3 className={s.featureTitle}>Rankings y MVPs</h3>
              <p className={s.featureDesc}>
                Clasificacion por puntos, mejor jugador de cada torneo y enfrentamientos cara a cara.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={s.featureIcon}><IconFlame size={28} /></div>
              <h3 className={s.featureTitle}>Momentos epicos</h3>
              <p className={s.featureDesc}>
                Registra goleadas historicas, sube fotos de los partidos y revive los mejores momentos.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={s.featureIcon}><IconDeviceMobile size={28} /></div>
              <h3 className={s.featureTitle}>App Android</h3>
              <p className={s.featureDesc}>
                Descarga nuestra app para Android. Funciona offline y sincroniza automaticamente. <Link href="/app" style={{color: 'var(--tango-400)'}}>Descargar</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={s.cta}>
        <div className={s.sectionInner}>
          <h2 className={s.ctaTitle}>Listo para competir?</h2>
          <p className={s.ctaDesc}>
            Organiza tu proximo torneo, invita a tus amigos y descubre quien es el verdadero campeon.
          </p>
          <Link href="/stats" className={s.btnPrimary}>Ver Estadisticas</Link>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={s.footerInner}>
          <p className={s.footerText}>AO Stats &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}

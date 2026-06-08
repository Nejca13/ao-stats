import Link from 'next/link'
import {
  IconBallFootball,
  IconChartBar,
  IconTrophy,
  IconFlame,
  IconDeviceMobile,
} from '@tabler/icons-react'
import s from './landing.module.css'

export default function LandingPage() {
  return (
    <div className={s.landing}>
      <nav className={s.nav}>
        <div className={s.navInner}>
          <div className={s.navLogo}>
            <span className={s.navLogoIcon}><IconBallFootball size={22} /></span>
            <span className={s.navLogoText}>AO Stats</span>
          </div>
          <div className={s.navLinks}>
            <Link href="/stats" className={s.navLink}>Estadisticas</Link>
            <Link href="/auth/login" className={s.navCta}>Dashboard</Link>
          </div>
        </div>
      </nav>

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
              <h3 className={s.featureTitle}>Multiplataforma</h3>
              <p className={s.featureDesc}>
                Accede desde cualquier dispositivo. Tus datos siempre sincronizados en la nube.
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

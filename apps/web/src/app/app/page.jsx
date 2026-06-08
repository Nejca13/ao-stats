'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  IconDeviceMobile,
  IconDownload,
  IconWifi,
  IconRefresh,
  IconUsers,
  IconChartBar,
} from '@tabler/icons-react'
import Nav from '@/components/Nav'
import s from './app.module.css'

const NAV_LINKS = [
  { href: '/stats', label: 'Estadisticas' },
  { href: '/app', label: 'Descargar App', cta: true },
]

export default function AppPage() {
  const [release, setRelease] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://api.github.com/repos/Nejca13/ao-stats/releases/latest')
      .then(r => r.json())
      .then(data => {
        if (data.tag_name) setRelease(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const apkAsset = release?.assets?.find(a => a.name?.endsWith('.apk'))
  const downloadUrl = apkAsset?.browser_download_url

  return (
    <div className={s.page}>
      <Nav links={NAV_LINKS} />

      <section className={s.hero}>
        <div className={s.heroBg} />
        <div className={s.heroContent}>
          <div className={s.badge}>Android App</div>
          <h1 className={s.title}>
            Lleva AO Stats en tu{' '}
            <span className={s.highlight}>bolsillo</span>
          </h1>
          <p className={s.desc}>
            Gestiona tus torneos, registra partidos y consulta estadisticas desde tu celular.
            Sincronizacion automatica con la nube.
          </p>

          <div className={s.downloadArea}>
            {loading ? (
              <div className={s.loading}>Buscando ultima version...</div>
            ) : downloadUrl ? (
              <a href={downloadUrl} className={s.downloadBtn} download>
                <IconDownload size={22} />
                Descargar APK {release?.tag_name?.replace('android-v', 'v') || ''}
              </a>
            ) : (
              <a
                href="https://github.com/Nejca13/ao-stats/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className={s.downloadBtn}
              >
                <IconDownload size={22} />
                Descargar desde GitHub
              </a>
            )}
            <p className={s.downloadInfo}>
              APK firmado. Requiere Android 12+ (API 31)
            </p>
          </div>

          <div className={s.links}>
            <a
              href="https://github.com/Nejca13/ao-stats/releases"
              target="_blank"
              rel="noopener noreferrer"
              className={s.linkBtn}
            >
              Ver todas las versiones
            </a>
          </div>
        </div>
      </section>

      <section className={s.features}>
        <div className={s.sectionInner}>
          <h2 className={s.sectionTitle}>Por que usar la app?</h2>
          <div className={s.featuresGrid}>
            <div className={s.featureCard}>
              <div className={s.featureIcon}><IconDeviceMobile size={28} /></div>
              <h3 className={s.featureTitle}><IconWifi size={16} /> Offline-first</h3>
              <p className={s.featureDesc}>
                Todos los datos se guardan localmente. Funciona sin internet y sincroniza cuando volves a conectarte.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={s.featureIcon}><IconRefresh size={28} /></div>
              <h3 className={s.featureTitle}>Sincronizacion automatica</h3>
              <p className={s.featureDesc}>
                Los cambios se sincronizan en segundo plano. No perdes nada si cambias de dispositivo.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={s.featureIcon}><IconUsers size={28} /></div>
              <h3 className={s.featureTitle}>Gestion de jugadores</h3>
              <p className={s.featureDesc}>
                Crea jugadores, asigna escudos y colores, y seguí su rendimiento en cada torneo.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={s.featureIcon}><IconChartBar size={28} /></div>
              <h3 className={s.featureTitle}>Estadisticas en vivo</h3>
              <p className={s.featureDesc}>
                ELO, rankings, MVPs, head-to-head y metricas detalladas actualizadas automaticamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={s.cta}>
        <div className={s.sectionInner}>
          <h2 className={s.ctaTitle}>Usalo desde la web</h2>
          <p className={s.ctaDesc}>
            Preferis no instalar nada? Todas las funciones estan disponibles directamente en el navegador.
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

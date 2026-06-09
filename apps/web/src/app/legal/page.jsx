import Link from 'next/link'
import { IconFileText, IconShieldLock, IconChevronRight } from '@tabler/icons-react'

export const metadata = {
  title: 'Legal · AO Stats',
  description: 'Documentación legal de AO Stats: Términos y Condiciones y Política de Privacidad.',
}

const cards = [
  {
    href: '/legal/terms',
    icon: IconFileText,
    title: 'Términos y Condiciones',
    desc: 'Conocé las reglas de uso, limitaciones de responsabilidad y condiciones de los planes premium.',
    updated: '8 de junio de 2026',
  },
  {
    href: '/legal/privacy',
    icon: IconShieldLock,
    title: 'Política de Privacidad',
    desc: 'Cómo recopilamos, usamos y protegemos tus datos personales conforme a la Ley 25.326 y el RGPD.',
    updated: '8 de junio de 2026',
  },
]

export default function LegalIndexPage() {
  return (
    <article>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>
        Legal
      </h1>
      <p style={{ color: 'rgba(251,217,173,0.6)', fontSize: '0.95rem', marginBottom: 40, lineHeight: 1.6 }}>
        En AO Stats nos comprometemos con la transparencia. Aquí encontrás toda
        la documentación legal que rige el uso de la plataforma.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {cards.map(({ href, icon: Icon, title, desc, updated }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '24px 28px',
              background: 'rgba(244,152,67,0.06)',
              border: '1px solid rgba(244,152,67,0.15)',
              borderRadius: 16,
              textDecoration: 'none',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #f8bd79, #f17b20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={22} color="#0c0a09" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fef7ee', marginBottom: 4 }}>
                {title}
              </div>
              <div style={{ color: 'rgba(251,217,173,0.6)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                {desc}
              </div>
              <div style={{ color: 'rgba(251,217,173,0.35)', fontSize: '0.78rem', marginTop: 8 }}>
                Última actualización: {updated}
              </div>
            </div>

            <IconChevronRight size={20} color="rgba(244,152,67,0.6)" style={{ flexShrink: 0 }} />
          </Link>
        ))}
      </div>

      <div style={{
        marginTop: 48, padding: '20px 24px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ color: 'rgba(251,217,173,0.5)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
          Si tenés preguntas sobre estos documentos o necesitás ejercer derechos sobre tus
          datos personales (acceso, rectificación, supresión), podés contactarnos a través
          de la sección <strong style={{ color: 'rgba(251,217,173,0.75)' }}>Ayuda</strong> en
          la app o abriendo un issue en nuestro repositorio de GitHub.
        </p>
      </div>
    </article>
  )
}

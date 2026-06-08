'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconBallFootball, IconMenu2, IconX } from '@tabler/icons-react'
import s from './Nav.module.css'

export default function Nav({ links, logoHref }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  }, [])

  return (
    <nav className={s.nav}>
      <div className={s.inner}>
        <Link
          href={logoHref ?? '/'}
          className={s.logo}
          onClick={() => setOpen(false)}
        >
          <span className={s.logoIcon}><IconBallFootball size={22} /></span>
          <span className={s.logoText}>AO Stats</span>
        </Link>

        <button
          className={s.hamburger}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <IconX size={22} /> : <IconMenu2 size={22} />}
        </button>

        {open && <div className={s.backdrop} onClick={() => setOpen(false)} />}

        <div className={`${s.links} ${open ? s.linksOpen : ''}`}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={link.cta ? s.cta : s.link}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

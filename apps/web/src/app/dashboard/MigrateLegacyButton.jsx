'use client'

import { useState } from 'react'
import s from './dashboard.module.css'

export default function MigrateLegacyButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const handleMigrate = async () => {
    setStatus('loading')
    setMsg('')
    try {
      const res = await fetch('/api/v1/migrate', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setStatus('done')
        const r = data.result
        setMsg(`Migrados: ${r.playersUpserted} jug, ${r.asadosUpserted} asados, ${r.matchesUpserted} partidos`)
        setTimeout(() => location.reload(), 2000)
      } else {
        setStatus('error')
        setMsg(data.error || 'Error al migrar')
      }
    } catch {
      setStatus('error')
      setMsg('Error de conexion')
    }
  }

  if (status === 'done') {
    return <span className={s.migrateSuccess}>{msg}</span>
  }

  return (
    <div>
      <button
        onClick={handleMigrate}
        disabled={status === 'loading'}
        className={s.btnMigrate}
      >
        {status === 'loading' ? 'Migrando...' : 'Migrar datos legacy'}
      </button>
      {status === 'error' && (
        <p className={s.migrateError}>{msg}</p>
      )}
    </div>
  )
}

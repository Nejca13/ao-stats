'use client'

import { useState } from 'react'

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
        setMsg(`Migrados: ${r.playersUpserted} jugadores, ${r.asadosUpserted} asados, ${r.matchesUpserted} partidos`)
        setTimeout(() => location.reload(), 2000)
      } else {
        setStatus('error')
        setMsg(data.error || 'Error al migrar')
      }
    } catch {
      setStatus('error')
      setMsg('Error de conexión')
    }
  }

  if (status === 'done') {
    return <span style={{ color: '#4caf50', fontSize: '0.85rem' }}>{msg}</span>
  }

  return (
    <div>
      <button
        onClick={handleMigrate}
        disabled={status === 'loading'}
        style={{
          background: status === 'loading' ? '#555' : '#f17b20',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 14px',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        {status === 'loading' ? 'Migrando...' : 'Migrar datos legacy a V2'}
      </button>
      {status === 'error' && (
        <p style={{ color: '#f44336', fontSize: '0.8rem', marginTop: 6 }}>{msg}</p>
      )}
    </div>
  )
}

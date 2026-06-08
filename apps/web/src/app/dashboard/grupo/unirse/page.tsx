'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconUsers, IconCheck, IconX } from '@tabler/icons-react'

export default function UnirsePage() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')

  const [status, setStatus] = useState<'idle' | 'joining' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!slug) {
      setStatus('error')
      setMessage('Link invalido: falta el slug del grupo')
      return
    }

    setStatus('joining')

    fetch('/api/v1/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then(async res => {
        const data = await res.json()
        if (res.ok) {
          setStatus('success')
          setMessage('Te uniste al grupo exitosamente!')
        } else if (res.status === 409) {
          setStatus('success')
          setMessage('Ya eras miembro de este grupo')
        } else {
          setStatus('error')
          setMessage(data.message || 'Error al unirse al grupo')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Error de conexion')
      })
  }, [slug])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
      }}
    >
      {status === 'joining' && (
        <div style={{ textAlign: 'center' }}>
          <IconUsers size={48} style={{ color: 'rgba(251,217,173,0.4)', marginBottom: 16 }} />
          <p style={{ color: 'rgba(251,217,173,0.6)', fontSize: '1.1rem' }}>Uniendote al grupo...</p>
        </div>
      )}

      {status === 'success' && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(76,175,80,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <IconCheck size={32} style={{ color: '#4caf50' }} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Bienvenido!</h2>
          <p style={{ color: 'rgba(251,217,173,0.6)', marginBottom: 24 }}>{message}</p>
          <Link
            href="/dashboard/grupo"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #f17b20, #e26014)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Ir a Mi Grupo
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(244,67,54,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <IconX size={32} style={{ color: '#f44336' }} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Error</h2>
          <p style={{ color: 'rgba(251,217,173,0.6)', marginBottom: 24 }}>{message}</p>
          <Link
            href="/dashboard/grupo"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              borderRadius: 10,
              background: 'rgba(244,152,67,0.1)',
              color: '#f17b20',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Volver
          </Link>
        </div>
      )}

      {!slug && status === 'error' && (
        <Link
          href="/dashboard/grupo"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            borderRadius: 10,
            background: 'rgba(244,152,67,0.1)',
            color: '#f17b20',
            textDecoration: 'none',
            fontWeight: 700,
            marginTop: 16,
          }}
        >
          Volver
        </Link>
      )}
    </div>
  )
}

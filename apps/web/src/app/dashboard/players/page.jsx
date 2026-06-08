'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { IconUsers, IconPlus, IconBallFootball } from '@tabler/icons-react'
import s from '../dashboard.module.css'

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/v1/players')
      .then(r => r.json())
      .then(data => {
        setPlayers(data.players || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/v1/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al crear jugador')
      setName('')
      setShowForm(false)
      setPlayers(prev => [...prev, data.player].sort((a, b) => a.name.localeCompare(b.name)))
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className={s.pageHeader}>
          <h1 className={s.pageTitle}>Jugadores</h1>
        </div>
        <div className={s.emptyState}>
          <IconBallFootball size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Jugadores</h1>
          <p className={s.pageDesc}>{players.length} jugadores registrados</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            background: showForm
              ? 'rgba(100,100,100,0.3)'
              : 'linear-gradient(135deg, #f17b20, #e26014)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <IconPlus size={18} />
          {showForm ? 'Cancelar' : 'Nuevo Jugador'}
        </button>
      </div>

      {error && (
        <p style={{ color: '#f44', marginBottom: 12, fontSize: '0.85rem' }}>{error}</p>
      )}

      {showForm && (
        <form onSubmit={handleCreate} style={{
          background: 'rgba(28,20,16,0.7)',
          border: '1px solid rgba(244,152,67,0.12)',
          borderRadius: 14,
          padding: 20,
          marginBottom: 20,
          maxWidth: 400,
          display: 'flex',
          gap: 10,
        }}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del jugador"
            required
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(244,152,67,0.2)',
              background: 'rgba(0,0,0,0.3)',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={creating || !name.trim()}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: name.trim()
                ? 'linear-gradient(135deg, #f17b20, #e26014)'
                : 'rgba(244,152,67,0.3)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap',
            }}
          >
            {creating ? 'Creando...' : 'Crear'}
          </button>
        </form>
      )}

      {players.length === 0 ? (
        <div className={s.emptyState}>
          <IconUsers size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No hay jugadores registrados</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.map(p => (
            <div key={p.id} style={{
              background: 'rgba(28,20,16,0.7)',
              border: '1px solid rgba(244,152,67,0.12)',
              borderRadius: 12,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              {p.avatarUrl ? (
                <Image src={p.avatarUrl} alt="" width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} unoptimized />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(244,152,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)' }}>{p.name?.[0]}</span>
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)' }}>
                  ELO: {p.elo || 1500}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

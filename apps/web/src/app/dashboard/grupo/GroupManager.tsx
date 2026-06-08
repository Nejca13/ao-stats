'use client'

import { useState } from 'react'
import { IconCopy, IconCheck, IconUsers, IconLink } from '@tabler/icons-react'
import type { Group } from '@ao/shared'

const PLAN_LABELS: Record<string, { name: string; price: string }> = {
  free: { name: 'Gratis', price: '$0' },
  asado: { name: 'Asado', price: '$3/mes' },
  parrillero: { name: 'Parrillero', price: '$10/mes' },
  asador_mayor: { name: 'Asador Mayor', price: '$20/mes' },
  bar_lounge: { name: 'Bar / Lounge', price: '$30/mes' },
  liga: { name: 'Liga Organizada', price: '$75/mes' },
}

function InviteSection({ group }: { group: Group }) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${window.location.origin}/dashboard/grupo/unirse?slug=${group.slug}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text manually
    }
  }

  return (
    <div
      style={{
        background: 'rgba(28,20,16,0.7)',
        border: '1px solid rgba(244,152,67,0.12)',
        borderRadius: 16,
        padding: 24,
        maxWidth: 600,
        marginTop: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <IconUsers size={18} style={{ color: 'rgba(251,217,173,0.5)' }} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Invitar miembros</span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)', marginBottom: 12 }}>
        Comparti este link con tus amigos para que se unan al grupo:
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          readOnly
          value={inviteUrl}
          onClick={e => (e.target as HTMLInputElement).select()}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid rgba(244,152,67,0.2)',
            background: 'rgba(0,0,0,0.3)',
            color: 'rgba(251,217,173,0.7)',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        />
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid rgba(244,152,67,0.2)',
            background: 'rgba(244,152,67,0.1)',
            color: copied ? '#4caf50' : '#f17b20',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

export default function GroupManager({
  groups,
  userId,
}: {
  groups: Group[]
  userId: string
}) {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')

    try {
      const res = await fetch('/api/v1/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al crear grupo')
      }

      window.location.reload()
    } catch (err: any) {
      setError(err.message)
      setCreating(false)
    }
  }

  if (groups.length === 0) {
    return (
      <div style={{ maxWidth: 480, marginTop: 24 }}>
        <form onSubmit={handleCreate}>
          <label
            htmlFor="groupName"
            style={{ display: 'block', marginBottom: 8, color: 'rgba(251,217,173,0.7)', fontSize: '0.9rem' }}
          >
            Nombre del grupo
          </label>
          <input
            id="groupName"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Los Matadores de Martinez"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid rgba(244,152,67,0.2)',
              background: 'rgba(28,20,16,0.7)',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              marginBottom: 16,
            }}
          />
          {error && (
            <p style={{ color: '#f44', marginBottom: 12, fontSize: '0.85rem' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={creating || !name.trim()}
            style={{
              padding: '12px 28px',
              borderRadius: 10,
              border: 'none',
              background: !name.trim()
                ? 'rgba(244,152,67,0.3)'
                : 'linear-gradient(135deg, #f17b20, #e26014)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: !name.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {creating ? 'Creando...' : 'Crear Grupo'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 24 }}>
      {groups.map(group => (
        <div key={group.id}>
          <div
            style={{
              background: 'rgba(28,20,16,0.7)',
              border: '1px solid rgba(244,152,67,0.12)',
              borderRadius: 16,
              padding: 24,
              maxWidth: 600,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{group.name}</h2>
              <span
                style={{
                  padding: '4px 14px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background:
                    group.plan === 'free'
                      ? 'rgba(100,100,100,0.2)'
                      : 'linear-gradient(135deg, #f17b20, #e26014)',
                  color: group.plan === 'free' ? '#999' : '#fff',
                }}
              >
                {PLAN_LABELS[group.plan]?.name ?? group.plan}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'rgba(251,217,173,0.5)' }}>Slug:</span>{' '}
                <span style={{ color: 'rgba(251,217,173,0.8)' }}>{group.slug}</span>
              </div>
              <div>
                <span style={{ color: 'rgba(251,217,173,0.5)' }}>Miembros:</span>{' '}
                <span style={{ color: 'rgba(251,217,173,0.8)' }}>{group.memberIds.length}</span>
              </div>
              <div>
                <span style={{ color: 'rgba(251,217,173,0.5)' }}>Plan:</span>{' '}
                <span style={{ color: 'rgba(251,217,173,0.8)' }}>{PLAN_LABELS[group.plan]?.price ?? '-'}</span>
              </div>
              <div>
                <span style={{ color: 'rgba(251,217,173,0.5)' }}>Creado:</span>{' '}
                <span style={{ color: 'rgba(251,217,173,0.8)' }}>
                  {new Date(group.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {group.plan === 'free' && (
              <div
                style={{
                  background: 'rgba(244,152,67,0.08)',
                  border: '1px solid rgba(244,152,67,0.2)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Plan Gratis</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)' }}>
                    Historial limitado a 10 partidos
                  </div>
                </div>
                <a
                  href="/pricing"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #f17b20, #e26014)',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  Upgrade
                </a>
              </div>
            )}

            {group.ownerId === userId && (
              <p style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.4)', marginTop: 12 }}>
                Eres el dueño del grupo
              </p>
            )}
          </div>

          <InviteSection group={group} />
        </div>
      ))}
    </div>
  )
}

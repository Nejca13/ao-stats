'use client'

import Image from 'next/image'
import { useState, useMemo } from 'react'
import { IconChevronDown, IconChevronUp, IconFlame, IconTrophy, IconSwords, IconBallFootball, IconPlus, IconPlayerPlay, IconCheck } from '@tabler/icons-react'
import { computeAsadoRanking, findMayorGoleada, buildPlayerMap } from '@ao/shared'
import s from '../dashboard.module.css'

function NewAsadoForm({ players, onClose, onError }) {
  const [form, setForm] = useState({ date: '', playerIds: [], comment: '' })
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setCreating(true)
    onError('')
    try {
      const res = await fetch('/api/v1/asados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al crear asado')
      onClose()
      window.location.reload()
    } catch (err) {
      onError(err.message)
    } finally {
      setCreating(false)
    }
  }

  function togglePlayer(id) {
    setForm(prev => ({
      ...prev,
      playerIds: prev.playerIds.includes(id)
        ? prev.playerIds.filter(p => p !== id)
        : [...prev.playerIds, id],
    }))
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'rgba(28,20,16,0.7)',
      border: '1px solid rgba(244,152,67,0.12)',
      borderRadius: 14,
      padding: 20,
      marginBottom: 20,
      maxWidth: 500,
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Nuevo Asado</h3>

      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(251,217,173,0.7)', marginBottom: 6 }}>
        Fecha
      </label>
      <input
        type="date"
        value={form.date}
        onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
        required
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 10,
          border: '1px solid rgba(244,152,67,0.2)',
          background: 'rgba(0,0,0,0.3)',
          color: '#fff',
          fontSize: '0.9rem',
          outline: 'none',
          marginBottom: 16,
        }}
      />

      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(251,217,173,0.7)', marginBottom: 6 }}>
        Jugadores que asisten ({form.playerIds.length} seleccionados)
      </label>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16,
        maxHeight: 160, overflowY: 'auto', padding: '4px 0',
      }}>
        {players.map(p => (
          <label
            key={p.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: form.playerIds.includes(p.id) ? 'rgba(241,123,32,0.15)' : 'rgba(255,255,255,0.04)',
              cursor: 'pointer', fontSize: '0.85rem',
              border: form.playerIds.includes(p.id) ? '1px solid rgba(241,123,32,0.3)' : '1px solid transparent',
            }}
          >
            <input
              type="checkbox" checked={form.playerIds.includes(p.id)} onChange={() => togglePlayer(p.id)}
              style={{ display: 'none' }}
            />
            {p.avatarUrl ? (
              <Image src={p.avatarUrl} alt="" width={20} height={20} style={{ borderRadius: '50%', objectFit: 'cover' }} unoptimized />
            ) : (
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(244,152,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'rgba(251,217,173,0.5)' }}>
                {p.name?.[0]}
              </div>
            )}
            {p.name}
            {form.playerIds.includes(p.id) && <IconCheck size={14} style={{ color: '#f17b20' }} />}
          </label>
        ))}
      </div>

      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(251,217,173,0.7)', marginBottom: 6 }}>
        Comentario (opcional)
      </label>
      <input
        type="text" value={form.comment}
        onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
        placeholder="Ej: Asado de finde"
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10,
          border: '1px solid rgba(244,152,67,0.2)', background: 'rgba(0,0,0,0.3)',
          color: '#fff', fontSize: '0.9rem', outline: 'none', marginBottom: 16,
        }}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="submit"
          disabled={creating || !form.date || form.playerIds.length < 2}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: form.date && form.playerIds.length >= 2
              ? 'linear-gradient(135deg, #f17b20, #e26014)'
              : 'rgba(244,152,67,0.3)',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
            cursor: form.date && form.playerIds.length >= 2 ? 'pointer' : 'not-allowed',
          }}
        >
          {creating ? 'Creando...' : 'Crear Asado'}
        </button>
        <button
          type="button" onClick={onClose}
          style={{
            padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(244,152,67,0.2)',
            background: 'transparent', color: 'rgba(251,217,173,0.7)',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

function AsadoDetail({ asado, detail, playerMap }) {
  const [newMatch, setNewMatch] = useState({ winnerId: '', loserId: '', winnerGoles: '', loserGoles: '' })
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState('')

  const attending = (asado.playerIds || []).map(id => playerMap[id]).filter(Boolean)

  async function handleCreateMatch() {
    if (!newMatch.winnerId || !newMatch.loserId) return
    if (newMatch.winnerId === newMatch.loserId) { setError('Deben ser distintos'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/v1/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asadoId: asado.id,
          winnerId: newMatch.winnerId,
          loserId: newMatch.loserId,
          winnerGoles: newMatch.winnerGoles !== '' ? parseInt(newMatch.winnerGoles) : null,
          loserGoles: newMatch.loserGoles !== '' ? parseInt(newMatch.loserGoles) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al crear partido')
      setNewMatch({ winnerId: '', loserId: '', winnerGoles: '', loserGoles: '' })
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleFinalize() {
    setFinalizing(true)
    setError('')
    try {
      const res = await fetch(`/api/v1/asados/${asado.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al finalizar')
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setFinalizing(false)
    }
  }

  return (
    <>
      {error && <p style={{ color: '#f44', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, margin: '16px 0', flexWrap: 'wrap' }}>
        {detail.mvp && (
          <div style={{ flex: 1, minWidth: 200, background: 'rgba(255,193,7,0.06)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconTrophy size={22} style={{ color: '#ffc107', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(251,217,173,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MVP</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{detail.mvp.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(251,217,173,0.5)' }}>{detail.mvp.wins}G / {detail.matches.length} partidos</div>
            </div>
          </div>
        )}
        {detail.mayorGoleada && (
          <div style={{ flex: 1, minWidth: 200, background: 'rgba(244,67,54,0.06)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconSwords size={22} style={{ color: '#ef5350', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(251,217,173,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mayor Goleada</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {detail.mayorGoleada.winnerName} {detail.mayorGoleada.winnerGoles} - {detail.mayorGoleada.loserGoles} {detail.mayorGoleada.loserName}
              </div>
            </div>
          </div>
        )}
      </div>

      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(251,217,173,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
        Ranking
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {detail.ranking.map((r, i) => (
          <div key={r.playerId} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            background: i === 0 ? 'rgba(255,193,7,0.06)' : 'rgba(255,255,255,0.02)', borderRadius: 8,
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              background: i === 0 ? '#ffc107' : i === 1 ? '#b0bec5' : i === 2 ? '#a1887f' : 'rgba(244,152,67,0.1)',
              color: i <= 2 ? '#000' : 'rgba(251,217,173,0.6)',
            }}>
              {i + 1}
            </span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(244,152,67,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {r.avatarUrl ? (
                <Image src={r.avatarUrl} alt="" width={28} height={28} style={{ objectFit: 'cover' }} unoptimized />
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'rgba(251,217,173,0.5)' }}>{r.name?.[0]}</span>
              )}
            </div>
            <span style={{ flex: 1, fontWeight: 500, fontSize: '0.85rem' }}>{r.name}</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)' }}>{r.wins}G / {r.losses}P</span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f17b20', minWidth: 30, textAlign: 'right' }}>{r.points}pts</span>
          </div>
        ))}
      </div>

      {detail.matches.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(251,217,173,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
            Partidos ({detail.matches.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {detail.matches.map(m => {
              const winner = playerMap[m.winnerId]
              const loser = playerMap[m.loserId]
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                    {winner?.avatarUrl ? (
                      <Image src={winner.avatarUrl} alt="" width={24} height={24} style={{ borderRadius: '50%', objectFit: 'cover' }} unoptimized />
                    ) : (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(76,175,80,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#4caf50', fontWeight: 700 }}>
                        {winner?.name?.[0] || '?'}
                      </div>
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4caf50' }}>{winner?.name || m.winnerId}</span>
                  </div>
                  <div style={{ background: 'rgba(244,152,67,0.08)', borderRadius: 6, padding: '2px 10px', fontWeight: 700, fontSize: '0.85rem', color: '#f17b20', whiteSpace: 'nowrap' }}>
                    {m.winnerGoles !== null ? `${m.winnerGoles} - ${m.loserGoles}` : 'vs'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(251,217,173,0.6)' }}>{loser?.name || m.loserId}</span>
                    {loser?.avatarUrl ? (
                      <Image src={loser.avatarUrl} alt="" width={24} height={24} style={{ borderRadius: '50%', objectFit: 'cover' }} unoptimized />
                    ) : (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(244,67,54,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#ef5350', fontWeight: 700 }}>
                        {loser?.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(251,217,173,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Partidos</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f17b20' }}>{detail.matches.length}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(251,217,173,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jugadores</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f17b20' }}>{asado.playerIds?.length || 0}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(251,217,173,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goles Total</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f17b20' }}>
            {detail.matches.reduce((sum, m) => sum + (m.winnerGoles || 0) + (m.loserGoles || 0), 0)}
          </div>
        </div>
      </div>

      {asado.isActive && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(244,152,67,0.08)' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(251,217,173,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconPlayerPlay size={16} />
            Cargar Resultado
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(251,217,173,0.6)', marginBottom: 4 }}>Ganador</label>
              <select value={newMatch.winnerId} onChange={e => setNewMatch(prev => ({ ...prev, winnerId: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(244,152,67,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}>
                <option value="">Seleccionar</option>
                {attending.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(251,217,173,0.6)', marginBottom: 4 }}>Perdedor</label>
              <select value={newMatch.loserId} onChange={e => setNewMatch(prev => ({ ...prev, loserId: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(244,152,67,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}>
                <option value="">Seleccionar</option>
                {attending.filter(p => p.id !== newMatch.winnerId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(251,217,173,0.6)', marginBottom: 4 }}>Goles ganador</label>
              <input type="number" min="0" value={newMatch.winnerGoles} onChange={e => setNewMatch(prev => ({ ...prev, winnerGoles: e.target.value }))} placeholder="0"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(244,152,67,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(251,217,173,0.6)', marginBottom: 4 }}>Goles perdedor</label>
              <input type="number" min="0" value={newMatch.loserGoles} onChange={e => setNewMatch(prev => ({ ...prev, loserGoles: e.target.value }))} placeholder="0"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(244,152,67,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          </div>
          <button onClick={handleCreateMatch} disabled={saving || !newMatch.winnerId || !newMatch.loserId}
            style={{ marginTop: 12, padding: '10px 24px', borderRadius: 10, border: 'none',
              background: newMatch.winnerId && newMatch.loserId ? 'linear-gradient(135deg, #f17b20, #e26014)' : 'rgba(244,152,67,0.3)',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: newMatch.winnerId && newMatch.loserId ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: 6 }}>
            {saving ? 'Guardando...' : 'Guardar Partido'}
          </button>
        </div>
      )}

      {asado.isActive && (
        <button onClick={handleFinalize} disabled={finalizing}
          style={{ marginTop: 12, padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(244,67,54,0.3)',
            background: 'rgba(244,67,54,0.08)', color: '#ef5350', fontWeight: 600, fontSize: '0.8rem', cursor: finalizing ? 'wait' : 'pointer' }}>
          {finalizing ? 'Finalizando...' : 'Finalizar Asado'}
        </button>
      )}
    </>
  )
}

export default function AsadosClient({ data }) {
  const [expandedId, setExpandedId] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [error, setError] = useState('')

  const { asados, matches, players } = data

  const playerMap = useMemo(() => buildPlayerMap(players), [players])

  const asadoMatchesMap = useMemo(() => {
    const map = {}
    for (const m of matches) {
      if (!map[m.asadoId]) map[m.asadoId] = []
      map[m.asadoId].push(m)
    }
    return map
  }, [matches])

  const asadoDetails = useMemo(() => {
    const details = {}
    for (const a of asados) {
      const asadoMatches = asadoMatchesMap[a.id] || []
      const ranking = computeAsadoRanking(asadoMatches, a.playerIds || [], playerMap)
      const mayorGoleada = findMayorGoleada(asadoMatches, playerMap)
      const mvp = ranking.length > 0 ? ranking[0] : null
      details[a.id] = { ranking, mayorGoleada, mvp, matches: asadoMatches }
    }
    return details
  }, [asados, asadoMatchesMap, playerMap])

  const toggle = (id) => setExpandedId(expandedId === id ? null : id)

  if (!asados || asados.length === 0) {
    return (
      <div>
        <div className={s.pageHeader}>
          <div>
            <h1 className={s.pageTitle}>Asados</h1>
            <p className={s.pageDesc}>0 torneos registrados</p>
          </div>
          <button onClick={() => setShowNewForm(!showNewForm)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10,
              border: 'none', background: 'linear-gradient(135deg, #f17b20, #e26014)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            <IconPlus size={18} />
            Nuevo Asado
          </button>
        </div>
        {error && <p style={{ color: '#f44', marginBottom: 12, fontSize: '0.85rem' }}>{error}</p>}
        {showNewForm && <NewAsadoForm players={players} onClose={() => setShowNewForm(false)} onError={setError} />}
        <div className={s.emptyState}>
          <IconFlame size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No hay asados registrados</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Asados</h1>
          <p className={s.pageDesc}>{asados.length} torneo{asados.length !== 1 ? 's' : ''} registrados</p>
        </div>
        <button onClick={() => setShowNewForm(!showNewForm)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10,
            border: 'none',
            background: showNewForm ? 'rgba(100,100,100,0.3)' : 'linear-gradient(135deg, #f17b20, #e26014)',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'background 0.2s' }}>
          <IconPlus size={18} />
          {showNewForm ? 'Cancelar' : 'Nuevo Asado'}
        </button>
      </div>

      {error && <p style={{ color: '#f44', marginBottom: 12, fontSize: '0.85rem' }}>{error}</p>}
      {showNewForm && <NewAsadoForm players={players} onClose={() => setShowNewForm(false)} onError={setError} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {asados.map(a => {
          const isOpen = expandedId === a.id
          const detail = asadoDetails[a.id]
          return (
            <div key={a.id} style={{
              background: 'rgba(28,20,16,0.7)',
              border: isOpen ? '1px solid rgba(241,123,32,0.3)' : '1px solid rgba(244,152,67,0.12)',
              borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              <button onClick={() => toggle(a.id)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', color: '#fef7ee', textAlign: 'left' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(241,123,32,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {a.isActive ? <IconBallFootball size={20} style={{ color: '#4caf50' }} /> : <IconTrophy size={20} style={{ color: '#f17b20' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{a.date}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(251,217,173,0.5)', marginTop: 2 }}>
                    {detail?.matches?.length || 0} partidos · {a.playerIds?.length || 0} jugadores ·
                    <span style={{ color: a.isActive ? '#4caf50' : 'rgba(251,217,173,0.5)' }}> {a.isActive ? 'Activo' : 'Finalizado'}</span>
                  </div>
                </div>
                {isOpen ? <IconChevronUp size={18} style={{ color: '#f17b20', flexShrink: 0 }} />
                  : <IconChevronDown size={18} style={{ color: 'rgba(251,217,173,0.4)', flexShrink: 0 }} />}
              </button>

              {isOpen && detail && (
                <div style={{ borderTop: '1px solid rgba(244,152,67,0.08)', padding: '0 20px 20px' }}>
                  <AsadoDetail asado={a} detail={detail} playerMap={playerMap} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

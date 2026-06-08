'use client'
import Image from 'next/image'
import { useState } from 'react'
import {
  IconBallFootball,
  IconWorld,
  IconSwords,
  IconX,
} from '@tabler/icons-react'
import s from './ao.module.css'

const TEAM_AVATARS = {
  '5ee34512-1df1-48bf-a236-00f2d2aebdad': '/teams/mansfieldtown.png',
  '5ae24da6-2b7c-4f23-afce-c5a9cf0f5d79': '/teams/swindontown.png',
  'f67a4e49-0ec8-4983-a647-65703697c5db': '/teams/tranmererovers.png',
  'd0552b10-0b9c-45dd-9fab-39481025c64e': '/teams/walsal.png',
}

const Avatar = ({ playerId, avatarUrl, size = 32, className = '' }) => {
  const src = avatarUrl || TEAM_AVATARS[playerId]
  if (!src) return null
  return (
    <Image
      src={src}
      alt="team"
      width={size}
      height={size}
      className={`${s.avatar} ${className}`}
      unoptimized
    />
  )
}

const TABS = [
  { key: 'global', label: 'Global', icon: IconWorld },
  { key: 'asados', label: 'Por AO', icon: IconBallFootball },
  { key: 'h2h', label: 'Cara a Cara', icon: IconSwords },
]

const getEloBadgeProps = (elo) => {
  if (elo < 1400) return { className: s.eloBronze, icon: 'Bronze' }
  if (elo < 1500) return { className: s.eloSilver, icon: 'Silver' }
  if (elo < 1600) return { className: s.eloGold, icon: 'Gold' }
  if (elo < 1700) return { className: s.eloEpic, icon: 'Epic' }
  return { className: s.eloLegendary, icon: 'Legendary' }
}

export default function AORendering({ stats }) {
  const [activeTab, setActiveTab] = useState('global')
  const [selectedAsadoId, setSelectedAsadoId] = useState(stats.asados?.[0]?.asadoId || '')
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const currentAsado = stats.asados?.find(a => a.asadoId === selectedAsadoId)
  const playersByPoints = [...(stats.global?.players || [])].sort((a, b) => b.totalPoints - a.totalPoints)
  const g = stats.global

  return (
    <div className={s.aoPage}>
      <div className={s.container}>
        <header className={s.header}>
          <div className={s.logo}><IconBallFootball size={32} /></div>
          <h1 className={s.title}>AO & FIFA Stats</h1>
          <p className={s.subtitle}>Estadisticas oficiales de los asados</p>
        </header>

        <nav className={s.tabs}>
          {TABS.map(tab => (
            <button
                key={tab.key}
                className={activeTab === tab.key ? s.tabActive : s.tab}
                onClick={() => setActiveTab(tab.key)}
             >
              <tab.icon size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'global' && (
          <>
            {g?.mvpHistorico && (
              <div className={s.mvpCard}>
                <Avatar playerId={g.mvpHistorico.playerId} avatarUrl={g.mvpHistorico.avatarUrl} size={56} className={s.mvpAvatar} />
                <div className={s.mvpInfo}>
                  <div className={s.mvpLabel}>MVP Historico</div>
                  <div className={s.mvpName}>{g.mvpHistorico.name}</div>
                  <div className={s.mvpStat}>{g.mvpHistorico.mvpCount} vez{g.mvpHistorico.mvpCount !== 1 ? 'es' : ''} MVP</div>
                </div>
              </div>
            )}

            {g?.topScorer && (
              <div className={s.mvpCard}>
                <Avatar playerId={g.topScorer.playerId} avatarUrl={g.topScorer.avatarUrl} size={56} className={s.mvpAvatar} />
                <div className={s.mvpInfo}>
                  <div className={s.mvpLabel}>Goleador Historico</div>
                  <div className={s.mvpName}>{g.topScorer.name}</div>
                  <div className={s.mvpStat}>{g.topScorer.goalsScored} goles anotados</div>
                </div>
              </div>
            )}

            {g?.mayorGoleada && (
              <div className={s.goleadaCard}>
                <div className={s.goleadaLabel}>Mayor Goleada Historica</div>
                <div className={s.goleadaContent}>
                  <div className={s.goleadaTeams}>
                    <span className={s.bold}>{g.mayorGoleada.winnerName}</span> {g.mayorGoleada.winnerGoles} - {g.mayorGoleada.loserGoles} <span className={s.bold}>{g.mayorGoleada.loserName}</span>
                  </div>
                  {g.mayorGoleada.photoUrl && (
                    <button className={s.viewPhotoBtn} onClick={() => setSelectedPhoto(g.mayorGoleada.photoUrl)}>
                      Ver Foto
                    </button>
                  )}
                </div>
              </div>
            )}

            <h2 className={s.sectionTitle}>
              <span className={s.sectionIcon}>Ranking por Puntos</span>
            </h2>
            <table className={s.rankingTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jugador</th>
                  <th>Record</th>
                  <th>Win Rate</th>
                  <th>Goles (DG)</th>
                  <th>ELO</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {playersByPoints.map((p, i) => (
                  <tr key={p.playerId} className={s.rankingRow}>
                    <td>
                      <span className={`${s.positionBadge} ${i === 0 ? s.pos1 : i === 1 ? s.pos2 : i === 2 ? s.pos3 : s.posDefault}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td>
                      <div className={s.playerCell}>
                        <Avatar playerId={p.playerId} avatarUrl={p.avatarUrl} size={28} />
                        <span className={s.playerName} style={{ color: p.colorHex || undefined }}>{p.name}</span>
                      </div>
                      <div className={s.dominanceRow}>
                        {p.bestVictim && (
                          <span className={`${s.dominanceTag} ${s.victimTag}`}>
                            Victima: {p.bestVictim.name} ({p.bestVictim.wins}G)
                          </span>
                        )}
                        {p.nemesis && (
                          <span className={`${s.dominanceTag} ${s.nemesisTag}`}>
                            Nemesis: {p.nemesis.name} ({p.nemesis.losses}P)
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={s.recordLine}>
                        <span className={s.recordWins}>{p.wins}G</span> / <span className={s.recordLosses}>{p.losses}P</span>
                      </span>
                    </td>
                    <td>
                      <div className={s.winRateBar}>
                        <span className={s.winRateValue}>{p.winRate}%</span>
                        <div className={s.barTrack}>
                          <div className={s.barFill} style={{ width: `${p.winRate}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={s.goalsCell}>
                        <span className={s.goalsVal}>{p.goalsScored} - {p.goalsConceded}</span>
                        <span className={p.goalDiff >= 0 ? s.goalDiffPos : s.goalDiffNeg}>
                          ({p.goalDiff >= 0 ? `+${p.goalDiff}` : p.goalDiff})
                        </span>
                      </div>
                    </td>
                    <td>
                      {(() => {
                        const { className, icon } = getEloBadgeProps(p.elo)
                        return (
                          <span className={`${s.eloBadge} ${className}`}>
                            {icon} {p.elo}
                          </span>
                        )
                      })()}
                    </td>
                    <td><span className={s.pointsValue}>{p.totalPoints}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className={s.sectionTitle}>
              <span className={s.sectionIcon}>Resumen Global</span>
            </h2>
            <div className={s.statsGrid}>
              <div className={s.statCard}>
                <div className={s.statLabel}>Total Partidos</div>
                <div className={s.statValue}>
                  {g?.players?.reduce((sum, p) => sum + p.wins, 0) || 0}
                </div>
              </div>
              <div className={s.statCard}>
                <div className={s.statLabel}>Jugadores</div>
                <div className={s.statValue}>{g?.players?.length || 0}</div>
              </div>
              <div className={s.statCard}>
                <div className={s.statLabel}>Promedio Puntos</div>
                <div className={s.statValue}>{g?.players?.[0]?.averagePoints || 0}</div>
                <div className={s.statExtra}>lider del ranking</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'asados' && (
          <>
            <div className={s.asadoSelector}>
              {stats.asados?.map(a => (
                <button
                  key={a.asadoId}
                  className={selectedAsadoId === a.asadoId ? s.asadoChipActive : s.asadoChip}
                  onClick={() => setSelectedAsadoId(a.asadoId)}
                >
                  {a.date}
                </button>
              ))}
            </div>

            {currentAsado && (
              <>
                {currentAsado.mvp && (
                  <div className={s.mvpCard}>
                    <Avatar playerId={currentAsado.mvp.playerId} avatarUrl={currentAsado.mvp.avatarUrl} size={56} className={s.mvpAvatar} />
                    <div className={s.mvpInfo}>
                      <div className={s.mvpLabel}>MVP del Asado</div>
                      <div className={s.mvpName}>{currentAsado.mvp.name}</div>
                      <div className={s.mvpStat}>{currentAsado.mvp.wins} victorias / {currentAsado.totalMatches} partidos</div>
                    </div>
                  </div>
                )}

                {currentAsado.mayorGoleada && (
                  <div className={s.goleadaCard}>
                    <div className={s.goleadaLabel}>Mayor Goleada del Asado</div>
                    <div className={s.goleadaContent}>
                      <div className={s.goleadaTeams}>
                        <span className={s.bold}>{currentAsado.mayorGoleada.winnerName}</span> {currentAsado.mayorGoleada.winnerGoles} - {currentAsado.mayorGoleada.loserGoles} <span className={s.bold}>{currentAsado.mayorGoleada.loserName}</span>
                      </div>
                      {currentAsado.mayorGoleada.photoUrl && (
                        <button className={s.viewPhotoBtn} onClick={() => setSelectedPhoto(currentAsado.mayorGoleada.photoUrl)}>
                          Ver Foto
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <h2 className={s.sectionTitle}>
                  <span className={s.sectionIcon}>Ranking / {currentAsado.date}</span>
                </h2>
                <table className={s.rankingTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Jugador</th>
                      <th>Record</th>
                      <th>Partidos</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAsado.ranking?.map(r => (
                      <tr key={r.playerId} className={s.rankingRow}>
                        <td>
                          <span className={`${s.positionBadge} ${r.position === 1 ? s.pos1 : r.position === 2 ? s.pos2 : r.position === 3 ? s.pos3 : s.posDefault}`}>
                            {r.position}
                          </span>
                        </td>
                        <td>
                          <div className={s.playerCell}>
                            <Avatar playerId={r.playerId} avatarUrl={r.avatarUrl} size={28} />
                            <span className={s.playerName} style={{ color: r.colorHex || undefined }}>{r.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={s.recordLine}>
                            <span className={s.recordWins}>{r.wins}G</span> / <span className={s.recordLosses}>{r.losses}P</span>
                          </span>
                        </td>
                        <td>{r.played}</td>
                        <td><span className={s.pointsValue}>{r.points}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {currentAsado.matches && currentAsado.matches.length > 0 && (
                  <div className={s.matchesSection}>
                    <h2 className={s.sectionTitle}>
                      <span className={s.sectionIcon}>Partidos Jugados</span>
                    </h2>
                    <div className={s.matchesList}>
                      {currentAsado.matches.map(m => (
                        <div key={m.id} className={s.matchCard}>
                          <div className={s.matchMain}>
                            <div className={`${s.matchTeam} ${s.winnerTeam}`}>
                              <Avatar playerId={m.winnerId} avatarUrl={m.winnerAvatarUrl} size={32} />
                              <span className={s.matchPlayerName}>{m.winnerName}</span>
                            </div>
                            <div className={s.matchScore}>
                              <span className={s.scoreVal}>{m.winnerGoles !== null && m.winnerGoles !== undefined ? m.winnerGoles : '-'}</span>
                              <span className={s.scoreSep}>-</span>
                              <span className={s.scoreVal}>{m.loserGoles !== null && m.loserGoles !== undefined ? m.loserGoles : '-'}</span>
                            </div>
                            <div className={`${s.matchTeam} ${s.loserTeam}`}>
                              <span className={s.matchPlayerName}>{m.loserName}</span>
                              <Avatar playerId={m.loserId} avatarUrl={m.loserAvatarUrl} size={32} />
                            </div>
                          </div>
                          {(m.comment || m.photoUrl) && (
                            <div className={s.matchDetails}>
                              {m.comment && <p className={s.matchComment}>{m.comment}</p>}
                              {m.photoUrl && (
                                <div className={s.matchPhotoWrapper}>
                                  <img
                                    src={m.photoUrl}
                                    alt="Final de partido"
                                    className={s.matchPhoto}
                                    onClick={() => setSelectedPhoto(m.photoUrl)}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={s.statsGrid}>
                  <div className={s.statCard}>
                    <div className={s.statLabel}>Total Partidos</div>
                    <div className={s.statValue}>{currentAsado.totalMatches}</div>
                  </div>
                  <div className={s.statCard}>
                    <div className={s.statLabel}>Jugadores</div>
                    <div className={s.statValue}>{currentAsado.ranking?.length || 0}</div>
                  </div>
                  <div className={s.statCard}>
                    <div className={s.statLabel}>Mayor Ganador</div>
                    <div className={s.statValue}>{currentAsado.ranking?.[0]?.wins || 0}G</div>
                    <div className={s.statExtra}>{currentAsado.ranking?.[0]?.name}</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'h2h' && (
          <>
            <h2 className={s.sectionTitle}>
              <span className={s.sectionIcon}>Cara a Cara</span>
            </h2>
            <div className={s.h2hGrid}>
              {g?.players?.map(player => (
                <div key={player.playerId} className={s.h2hCard}>
                  <div className={s.h2hCardHeader}>
                    <div className={s.h2hPlayerInfo}>
                      <Avatar playerId={player.playerId} avatarUrl={player.avatarUrl} size={36} />
                      <span className={s.h2hPlayerName} style={{ color: player.colorHex || undefined }}>{player.name}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className={s.recordLine}>
                        <span className={s.recordWins}>{player.wins}G</span> / <span className={s.recordLosses}>{player.losses}P</span>
                      </span>
                      {(() => {
                        const { className, icon } = getEloBadgeProps(player.elo)
                        return (
                          <span className={`${s.eloBadgeSmall} ${className}`}>
                            {icon} {player.elo} ELO
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                  {player.headToHead?.map(h => {
                    const isDominator = h.wins > h.losses
                    const isNemesis = h.losses > h.wins
                    return (
                      <div key={h.opponentId} className={s.h2hMatchup}>
                        <span className={s.h2hOpponent}>
                          <Avatar playerId={h.opponentId} avatarUrl={h.opponentAvatarUrl} size={20} className={s.avatarInline} />
                          vs {h.opponentName}
                          {isDominator && <span className={`${s.h2hBadge} ${s.badgeDominator}`}> domina</span>}
                          {isNemesis && <span className={`${s.h2hBadge} ${s.badgeNemesis}`}> nemesis</span>}
                        </span>
                        <span className={s.h2hScore}>
                          <span className={s.h2hWins}>{h.wins}G</span>
                          <span className={s.h2hSep}>/</span>
                          <span className={s.h2hLosses}>{h.losses}P</span>
                        </span>
                      </div>
                    )
                  })}
                  <div className={s.dominanceRow} style={{ marginTop: 12 }}>
                    {player.bestVictim && (
                      <span className={`${s.dominanceTag} ${s.victimTag}`}>
                        Victima: {player.bestVictim.name}
                      </span>
                    )}
                    {player.nemesis && (
                      <span className={`${s.dominanceTag} ${s.nemesisTag}`}>
                        Nemesis: {player.nemesis.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedPhoto && (
        <div className={s.photoModal} onClick={() => setSelectedPhoto(null)}>
          <div className={s.photoModalContent} onClick={e => e.stopPropagation()}>
            <button className={s.closeModal} onClick={() => setSelectedPhoto(null)}><IconX size={20} /></button>
            <img src={selectedPhoto} alt="Partido completo" className={s.modalImage} />
          </div>
        </div>
      )}
    </div>
  )
}

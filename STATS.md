# Sistema de Stats — Fuente de Verdad

## ELO

- Rating inicial: **1500**
- K-factor: **32**
- Formula estandar: `Ea = 1 / (1 + 10^((Rb - Ra) / 400))`
- **Penalidad por inasistencia**: -16 ELO por cada asado que el jugador no asiste (solo si su ELO actual != 1500, piso 1400)
- No se procesan partidos donde winner o loser no esten en `asado.playerIds`
- Implementaciones:
  - Server: `apps/web/src/app/api/ao/route.js` → `calculateElo()`
  - Android: `EloCalculator.kt` → `calculateHistoricalElos()`
  - Shared package solo _lee_ el campo `elo` del Player, no lo calcula

## Ranking por Asado

### Criterio de orden (tiebreakers)
1. Mas wins
2. Menos losses
3. Head-to-head directo en ese asado

### Puntos
```
buildPointScale(n):
  n <= 0 → []
  n == 1 → [10]
  n > 1  → [max(1, round(10 - 9*i/(n-1))) for i in 0..n-1]
```

Ej: 5 jugadores → `[10, 8, 5, 3, 1]`

### Posiciones
- Se asignan con **posiciones compartidas** en caso de empate
- Si dos jugadores tienen el mismo record, ambos obtienen la misma posicion
- La posicion siguiente saltea los puestos intermedios (ej: 1, 1, 3)
- Los puntos se asignan segun la posicion (1-based), no el indice
- MVP del asado = jugador en posicion 1

### Implementaciones
- Shared TS: `packages/shared/src/stats.ts` → `computeAsadoRanking()`
- Android: `RankingEngine.kt` → `calculatePerAsadoRankings()`
- Web dashboard: `dashboard/asados/asados-client.jsx` → usa `computeAsadoRanking` del shared package

## Stats Globales

### Por jugador
- `played`, `wins`, `losses` → contados de todos los matches
- `goalsScored`, `goalsConceded` → sumados de todos los matches
- `winRate` → `round(wins / played * 10000) / 100` (2 decimales, porcentaje)
- `avgGoalsScored` → `round((goalsScored / played) * 100) / 100`
- `goalDiff` → `goalsScored - goalsConceded`
- `totalPoints` → suma de puntos de todos los asados en los que participo
- `averagePoints` → `round((totalPoints / asadosPlayed) * 100) / 100`
- `elo` → del ELO historico computado
- `mvpCount` → cantidad de asados donde quedo 1ro
- `bestVictim` → oponente contra el que tiene mas wins
- `nemesis` → oponente contra el que tiene mas losses

### Implementaciones
- Shared TS: `packages/shared/src/stats.ts` → `processStatsData()`
- Android: `RankingEngine.kt` → `processAllStats()`

## Asistencias

- Al crear un asado se seleccionan los jugadores que asisten (`asado.playerIds`)
- Solo los jugadores en `playerIds` pueden jugar partidos en ese asado
- Si un match tiene winner o loser fuera de `playerIds`, el server lo rechaza con error
- Los jugadores que no asisten pierden 16 ELO
- No hay penalidad para jugadores creados despues de la fecha del asado

## Planes

| Plan | Partidos | Asados | Precio |
|---|---|---|---|
| free | 10 | 1 | $0 |
| asado | ∞ | ∞ | $3/mes |
| parrillero | ∞ | ∞ | $10/mes |
| asador_mayor | ∞ | ∞ | $20/mes |
| bar_lounge | ∞ | ∞ | — |
| liga | ∞ | ∞ | — |

- El plan lo define el **grupo**, no el usuario
- Todos los miembros del grupo comparten el plan
- Solo el `ownerId` puede cambiar el plan (via Mercado Pago)
- Lógica: `apps/web/src/lib/plan-gates.ts`

## Permisos de Grupo

- `ownerId` = creador del grupo (unico que puede upgradear)
- `memberIds` = resto de miembros (solo lectura de datos del grupo)
- Cualquiera con el slug puede unirse sin aprobacion
- No hay roles intermedios (admin, moderator, etc.)

## Flujo de Datos

```
Android (Room local)
  → sync (POST /api/ao con snapshot completo)
    → server normaliza, valida, calcula ELO
    → guarda en MongoDB legacy (ao_snapshots)
    → sync a V2 (players, asados, matches collections en asao_v2)
      → web dashboard lee de V2 via getDashboardData()
      → /stats page: intenta V2 del grupo, fallback a snapshot legacy
```

## Archivos Clave

| Archivo | Rol |
|---|---|
| `packages/shared/src/stats.ts` | Core stats: computePlayerStats, computeAsadoRanking, processStatsData, buildPointScale, findMayorGoleada |
| `packages/shared/src/types.ts` | Schemas: Player, Asado, Match, Group, Plan |
| `apps/web/src/app/api/ao/route.js` | POST /api/ao: normaliza, valida asistencia, calcula ELO |
| `apps/web/src/lib/plan-gates.ts` | Plan limits y getUserGroup |
| `apps/web/src/lib/dashboard-data.ts` | Data fetching para web dashboard |
| `apps/web/src/lib/legacy-migration.ts` | Fallback a snapshot V1 |
| `apps/android/.../domain/logic/EloCalculator.kt` | ELO + penalidad por inasistencia |
| `apps/android/.../domain/logic/RankingEngine.kt` | processAllStats, calculatePerAsadoRankings |
| `apps/android/.../domain/logic/TournamentEngine.kt` | Logica de torneos (liga, winner stays, 1v1) |

# AO Stats — Contexto del Proyecto

## Visión General

Registrar resultados de partidas de FIFA (o cualquier juego de goles) entre amigos mientras se come un asado. Lleva estadísticas, rankings, ELO, MVPs, enfrentamientos cara a cara, y organización de torneos en vivo.

## Stack

| Capa | Tecnología |
|------|------------|
| **Web** | Next.js 15 (App Router), React 19 RC, CSS Modules |
| **Auth** | NextAuth v5 (Google OAuth + MongoDB adapter) |
| **DB principal** | MongoDB — colección `asao.ao_snapshots` |
| **DB escudos** | MongoDB — colección `teams_crest.ao_teams` |
| **Imágenes** | Cloudinary (fotos de partidos + escudos de equipos) |
| **Android** | Kotlin, Jetpack Compose, Room, Retrofit, Hilt manual |
| **Workspace** | pnpm monorepo — `apps/web` + `apps/android` |

## Data Model

```
Snapshot (cada sync es un snapshot completo)
├── players: Player[]
│   ├── id: string
│   ├── name: string
│   ├── avatarUrl: string? (URL de escudo de equipo)
│   ├── colorHex: string?
│   └── elo: number (calculado server-side en POST)
├── asados: Asado[]
│   ├── id: string
│   ├── date: string (YYYY-MM-DD)
│   ├── playerIds: string[]
│   ├── comment: string?
│   ├── isActive: boolean
│   └── tournamentConfig: TournamentConfig?
│       ├── mode: none | winner_stays | league | one_vs_one
│       ├── status: not_started | in_progress | finished
│       ├── participants: string[] (jugadores presentes ahora)
│       ├── winnerStaysConfig: { currentWinnerId, nextChallengerId, queue }
│       ├── leagueConfig: { fixtures: TournamentMatch[] }
│       └── oneVsOneConfig: { player1Id, player2Id, wins, targetWins }
└── matches: Match[]
    ├── id: string
    ├── asadoId: string
    ├── winnerId: string
    ├── loserId: string
    ├── winnerGoles: int?
    ├── loserGoles: int?
    ├── photoUrl: string? (Cloudinary URL)
    └── createdAt: string?
```

## Arquitectura — Flujo de Datos

```
┌──────────────┐     sync manual     ┌──────────────┐     read      ┌─────────────┐
│  Android App │ ──────────────────► │  Server API  │ ◄──────────── │  Web App    │
│  (Room DB)   │    POST /api/ao     │  (MongoDB)   │   GET /api/ao │  (Next.js)  │
│              │   snapshot JSON     │  ao_snapshots│               │             │
│  entrada de  │                     │  collection  │               │ landing +   │
│  datos ppal  │                     │              │               │ stats +     │
│              │                     │              │               │ dashboard   │
└──────────────┘                     └──────────────┘               └─────────────┘
```

### Puntos clave del flujo:
1. **Android es la fuente de datos primaria** — permite crear asados, registrar partidos, sacar fotos, todo offline
2. **El sync es manual** — el usuario sube un snapshot completo a `POST /api/ao`
3. **El servidor no hace merge** — cada POST guarda un documento nuevo en `ao_snapshots`
4. **Web siempre lee el último snapshot** — via `GET /api/ao` o directamente desde MongoDB
5. **ELO se calcula server-side** en cada POST, procesando todos los asados cronológicamente
6. **Stats se computan en read-time** via `processStatsData()` en `statsUtils.js`

## Endpoints API

| Ruta | Método | Auth | Propósito |
|------|--------|------|-----------|
| `/api/ao` | GET | - | Último snapshot crudo |
| `/api/ao` | POST | - | Recibe nuevo snapshot (5MB max) |
| `/api/ao/v1/stats` | GET | Secret header | Stats procesados (rate-limited) |
| `/api/ao/teams` | GET | - | Lista de equipos (local + MongoDB) |
| `/api/ao/teams/upload` | POST | - | Subir escudo a Cloudinary |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth | Handlers de auth |

## Rutas Web

| Ruta | Tipo | Auth | Descripción |
|------|------|------|-------------|
| `/` | SSR | - | Landing page promocional |
| `/stats` | SSR + Client | - | Estadísticas globales, por asado, cara a cara |
| `/auth/login` | CSR | - | Login con Google |
| `/upload` | CSR | - | Subir escudos de equipos |
| `/dashboard/*` | SSR | ✅ Protegido | Panel admin: jugadores, asados, partidos, escudos |

## Android — Capas

```
AoApplication (Retrofit → https://nejca.com.ar/)
├── data/
│   ├── local/ (Room: PlayerDao, AsadoDao, MatchDao)
│   ├── remote/ (AoApiService, CloudinaryManager)
│   └── repository/ (AoRepository — orquesta local + remote)
├── domain/
│   ├── model/ (Player, Asado, Match, Snapshot, Tournament*)
│   └── logic/ (RankingEngine, EloCalculator, TournamentEngine)
├── ui/
│   ├── screens/ (AsadoScreen, ActiveAsadoScreen, StatsScreen, etc.)
│   ├── viewmodel/ (AsadoViewModel, MainViewModel)
│   └── theme/ (Color, Theme, PlayerIcons)
└── update/ (GithubModels, UpdateManager, UpdateService, UpdateDialog)
```

### Modos de Torneo (Android)
- **Winner Stays** — el ganador se queda, el próximo de la cola desafía
- **League** — todos contra todos con fixture generado round-robin
- **1 vs 1** — mejor de N partidas (default: mejor de 5)

## Estadísticas Calculadas

Global (en `statsUtils.js` / `RankingEngine.kt`):
- Partidos jugados, wins, losses, win rate
- Goles a favor/en contra/diferencia, promedios
- Puntos por asado (escala 10..1 según posición)
- Puntos totales + promedio + MVPs ganados
- ELO (K=32, baseline 1500, cronológico)
- Cara a cara (best victim / nemesis)
- Mayor goleada histórica
- Rankings por puntos, win rate, ELO

Por asado:
- Ranking con tiebreakers: wins → losses → H2H directo
- MVP del asado
- Mayor goleada del asado
- Todos los partidos con scores y fotos

## Cómo Escalar — Directrices

### 1. DB: Salir del "snapshot único"
- **Ahora**: un documento en `ao_snapshots` contiene TODO. Si crece mucho, leer/transmitir todo es ineficiente.
- **Progresión**: crear colecciones normalizadas (`players`, `asados`, `matches`) y solo usar snapshots como respaldo/cache.

### 2. API: Versionar
- `/api/ao` es v1 implícita. Mover a `/api/v1/` y mantener backward compat.
- `/api/ao/v1/stats` ya está versionada.
- Documentar contratos con tipos compartidos (ideal: OpenAPI).

### 3. Sync: De "reemplazo total" a "incremental"
- Ahora Android sube TODO cada vez. 
- Próximo paso: endpoint PATCH para sync incremental (últimos cambios desde timestamp X).
- El servidor debe hacer merge, no reemplazo.

### 4. Android: Limpiar código legacy
- Package name `com.example.myapplication` debe cambiar.
- Room DB migrations están hardcodeadas (MIGRATION_5_6).
- `AoApplication` usa DI manual — considerar Hilt/Koin si crece.

### 5. Testing
- Web: sin tests. Agregar tests para `statsUtils.js` (es lógica pura).
- Android: solo tests dummy de ejemplo.

### 6. Web: TypeScript migration
- Proyecto usa JSX/JSDoc. Migrar a TypeScript progresivamente, arrancando por `statsUtils.js` y API routes.

### 7. Monorepo
- Workspace preparado con pnpm. Pueden sumarse más apps (iOS, CLI, etc).
- Agregar `packages/shared` para tipos/lógica compartida entre web y Android (ideal con zod + typescript).

## Valores y UX
- **Idioma**: español (argentino) — interfaz, comentarios, nombres.
- **Tema visual**: oscuro, naranja (#f17b20 / AoOrange), glassmorphism.
- **Público objetivo**: grupo de amigos compitiendo en FIFA mientras comen asado. La experiencia debe ser rápida, divertida, social.
- **AO** significa "Asado" (no Albion Online como podría pensarse).

# AO Stats — Contexto de desarrollo

## Stack
- Monorepo pnpm con `apps/web` (Next.js 15 App Router, TypeScript), `apps/android` (Kotlin/Compose), `packages/shared` (Zod, stats)
- MongoDB: `asao` (legacy snapshot) y `asao_v2` (normalizado, `MONGODB_AO_URI_V2`)
- Autenticacion: NextAuth v5 con Google OAuth, MongoDB adapter
- UI: dark theme, #f17b20 orange accent, glassmorphism, Tabler icons (NO emojis)
- Pagos: solo Mercado Pago (NO Stripe)

## Progreso

### Base de datos
- Schemas en `packages/shared/src/types.ts`: Player (con groupId), Asado (con groupId), Match (con groupId), Group, Snapshot, Tournament*
- `lib/mongodbV2.ts` — singleton MongoClient para `asao_v2` (movido de `app/api/ao/utils/`)
- `lib/db/collections.ts` — acceso a colecciones V2 + indices
- `lib/db/syncSnapshot.ts` — upserts normalized docs desde un Snapshot, acepta `groupId` opcional
- `lib/db/index.ts` — re-export de collections + syncSnapshotToV2

### API endpoints
- `POST /api/ao` — recibe snapshot, hace dual-write: legacy + V2 (best-effort, detecta grupo via auth)
- `GET /api/ao` — devuelve ultimo snapshot
- `GET /api/v1/players` — jugadores del grupo del usuario (requiere auth + grupo)
- `GET /api/v1/asados` — asados del grupo, limitado por plan (free = 1, pago = infinito)
- `GET /api/v1/matches` — partidos del grupo, limitado por plan (free = 10, pago = infinito)
- `GET /api/v1/groups` — lista grupos del usuario
- `POST /api/v1/groups` — crea grupo (plan='free' por defecto)
- `POST /api/v1/groups/join` — unirse a grupo por slug
- `POST /api/v1/payments/create-preference` — crea preferencia en Mercado Pago
- `POST /api/v1/payments/webhook` — IPN callback que actualiza group.plan al aprobarse

### Feature gates
- `lib/plan-gates.ts` — `getUserGroup()`, `getPlanLimits(plan)` (free: 10 matches, 1 asado)
- Server-side: `GET /api/v1/matches` y `asados` limitan results segun plan, devuelven `{ limited, total }`

### Pagos (Mercado Pago)
- `lib/mercado-pago.ts` — crea preferencia con `mercadopago` SDK, precios fijos (asado $300, parrillero $1000, asador_mayor $2000, lounge $3000, liga $7500)
- `POST /api/v1/payments/create-preference` — solo el owner del grupo puede crear
- `POST /api/v1/payments/webhook` — IPN: si payment.status === 'approved', actualiza group.plan
- `.env.example` — agregado `MP_ACCESS_TOKEN` y `NEXT_PUBLIC_URL`

### Dashboard Web
- Layout con sidebar usando Tabler icons, nav items: Panel, Jugadores, Asados, Partidos, Mi Grupo, Escudos, Cuenta
- Todas las paginas del dashboard leen de V2 con group scoping (via `lib/dashboard-data.ts`)
- NO usan emojis, solo Tabler icons
- `/dashboard` — home con cards de resumen (jugadores, asados, partidos, escudos) desde V2
- `/dashboard/players` — lista de jugadores del grupo desde V2
- `/dashboard/asados` — lista de asados del grupo desde V2, limitado por plan
- `/dashboard/matches` — lista de partidos del grupo desde V2, limitado por plan
- `/dashboard/grupo` — GroupManager (crear grupo, mostrar info, link de invitacion copiable)
- `/dashboard/grupo/unirse?slug=xxx` — pagina para unirse a un grupo
- `/dashboard/account` — AccountManager (ver plan actual, upgrade via MP)
- `/dashboard/crests` — subir escudos
- `/pricing` — landing de planes con features

### Android app
- `AoApiService.kt` — endpoints legacy + V2 agregados
- `AoApplication.kt` — CookieJar agregado a OkHttp para persistir sesion
- `LoginScreen.kt` — WebView que carga `/auth/login`, detecta redirect a dashboard
- `Screen.kt` — agregada pantalla "Cuenta" al bottom nav
- `SyncScreen.kt` — indicador de "Sesion iniciada / Sin sesion"
- La app funciona sin auth para endpoints legacy (POST/GET /api/ao)

### Planes
| Plan | Precio | Limites |
|------|--------|---------|
| Gratis | $0 | 10 partidos, 1 asado |
| Asado | $3/mes | Ilimitado |
| Parrillero | $10/mes | + ELO grafico, CSV, PDF |
| Asador Mayor | $20/mes | + Multi-grupo, API key |
| Bar/Lounge | $30/mes | |
| Liga | $75/mes | |

## Decisiones clave
- V2 es BD separada (`asao_v2`) para no romper prod
- Stats logic vive en `@ao/shared` para compartir entre web y android
- Group es la unidad de pago: uno paga, todos acceden
- Feature gates son server-side (API enforce, no solo UI)
- Solo Mercado Pago, no Stripe
- NO usar emojis, usar `@tabler/icons-react` en web, Material Icons en Android

## MVP Consolidado
El MVP actual cubre:
1. Autenticacion Google OAuth + grupos con miembros
2. Carga de snapshot desde Android a V2 (dual-write)
3. Dashboard web con datos scoped por grupo desde V2
4. Feature gates server-side (free: 10 partidos, 1 asado)
5. Invitacion a grupos via link compartible
6. Upgrade flow via Mercado Pago (pendiente configurar token)
7. Android app con login WebView y soporte de cookies de sesion

## Proximos pasos sugeridos
1. Configurar MP_ACCESS_TOKEN en produccion + testear webhook
2. Agregar `groupId` a los schemas de Tournament* para scoping completo
3. Multi-grupo en Android (selector de grupo al sincronizar)
4. Tests para endpoints V2
5. Dashboard de stats con graficos ELO historico (plan parrillero+)
6. Exportar datos a CSV (plan parrillero+)

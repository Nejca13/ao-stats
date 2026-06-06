# AO Stats — Plan de Desarrollo

> Alineado con `negocio.md` y `context.md`. Prioriza entregar valor comercial rápido sin romper la experiencia actual.

---

## Fase 0 — Fundación Técnica (Sprint 1-2, ~1 mes)
> Base para todo lo que viene. Sin esto, escalar es imposible.

| # | Tarea | Por qué | Área |
|---|-------|---------|------|
| 0.1 | Migrar `statsUtils.js` a TypeScript | Tipado compartido con API, menos bugs | Web |
| 0.2 | Tests para `statsUtils.js` (vitest) | La lógica de stats es el core del producto | Web |
| 0.3 | Tests para endpoints API (vitest + mongodb-memory-server) | Las API son el contrato con Android | Web |
| 0.4 | Normalizar MongoDB: colecciones `players`, `asados`, `matches` + migración de datos | Sin esto no hay consultas eficientes ni feature gates por plan | Web (DB) |
| 0.5 | Endpoint `GET /api/v1/players`, `GET /api/v1/asados`, `GET /api/v1/matches` | API versionada y normalizada | Web |
| 0.6 | `packages/shared` con tipos Zod (Player, Asado, Match, Snapshot) | Contrato único web + Android + API docs | Monorepo |
| 0.7 | Renombrar package Android (`com.example.myapplication` → `com.aostats.app`) | Publicar en Play Store | Android |
| 0.8 | CI básico (GitHub Actions: lint + test web y Android) | Calidad mínima para equipo creciente | Infra |

**Arquitectura objetivo post-Fase 0:**
```
POST /api/ao  →  normaliza  →  upsert en colecciones  →  guarda snapshot histórico
GET  /api/ao  →  lee de colecciones (ya no del snapshot)
```

---

## Fase 1 — Motors de Monetización (Sprint 3-4, ~1 mes)
> Lo mínimo indispensable para empezar a cobrar.

| # | Tarea | Relación negocio | Área |
|---|-------|------------------|------|
| 1.1 | Schema `groups` en MongoDB + UI web para crear grupo | Un grupo = una unidad de pago | Web |
| 1.2 | Schema `plans` + asignar plan a grupo (free / asado / parrillero / asador) | Backend del modelo freemium | Web |
| 1.3 | Feature gates server-side: límite de asados visibles, matches históricos, etc. | El free tier debe doler un poco | Web |
| 1.4 | Integración Mercado Pago (Argentina + Latam) + Stripe (resto) | Los dos métodos de pago del mercado | Web |
| 1.5 | Webhook de pagos + upgrade/downgrade automático | Sin fricción | Web |
| 1.6 | Pricing page en landing (`/pricing`) | La gente necesita ver precios | Web |
| 1.7 | Account page en dashboard (`/dashboard/account`) con plan actual, cambiar plan, historial de pagos | Transparencia | Web |
| 1.8 | Modal "este grupo está en free tier, upgrade para ver más" contextual | Persuasión en el momento justo | Web |

---

## Fase 2 — Lanzamiento Público (Sprint 5-8, ~2 meses)
> Lo que transforma un producto funcional en algo que la gente paga y comparte.

### 2.1 Features del plan Asado (core pago)

| # | Tarea | Área |
|---|-------|------|
| 2.1.1 | Historial de asados ilimitado + scroll infinito en `/stats` | Web |
| 2.1.2 | Exportar estadísticas del grupo a CSV/PDF | Web |
| 2.1.3 | Fotos en partidos visibles sin límite (free: solo 3 fotos) | Web |
| 2.1.4 | Línea de tiempo de ELO histórico (gráfico interactivo) | Web |

### 2.2 Features del plan Parrillero

| # | Tarea | Área |
|---|-------|------|
| 2.2.1 | Badge personalizado del grupo (subir imagen + asignar colores) | Web |
| 2.2.2 | Certificado de Campeón en PDF (exportable, shareable) | Web |
| 2.2.3 | Página pública del grupo (`/grupo/:slug`) compartible sin login | Web |

### 2.3 Features del plan Asador Mayor

| # | Tarea | Área |
|---|-------|------|
| 2.3.1 | Múltiples grupos desde una misma cuenta | Web |
| 2.3.2 | API key generable desde dashboard | Web |

### 2.4 Features sociales (gratis, impulsan viralidad)

| # | Tarea | Área |
|---|-------|------|
| 2.4.1 | Compartir ranking del asado a WhatsApp (imagen generada con HTML→Canvas) | Web |
| 2.4.2 | Compartir tarjeta de "MVP del asado" a Instagram/IG Stories | Web |
| 2.4.3 | Timeline pública de partidos recientes (`/feed`) | Web |

### 2.5 Onboarding

| # | Tarea | Área |
|---|-------|------|
| 2.5.1 | Post-login wizard: crear grupo o unirse con código | Web |
| 2.5.2 | Vista "mi grupo" en dashboard como landing post-login | Web |
| 2.5.3 | Tour interactivo del dashboard para nuevos usuarios | Web |

---

## Fase 3 — Crecimiento y Torneos (Sprint 9-12, ~2 meses)
> Sube el ARPU con torneos online + afiliados.

### 3.1 Torneos Online

| # | Tarea | Área |
|---|-------|------|
| 3.1.1 | Landing de torneos públicos (`/torneos`) con próximos torneos abiertos | Web |
| 3.1.2 | Inscripción a torneo online (seleccionar jugadores de tu grupo, pagar entrada) | Web |
| 3.1.3 | Fixture automático + bracket visual para torneos online | Web |
| 3.1.4 | Live leaderboard del torneo (auto-refrescante) | Web |
| 3.1.5 | Resultados: integración con Android o carga manual desde web | Web + Android |
| 3.1.6 | Ranking global AO Stats (puntuación acumulada entre torneos) | Web |

### 3.2 Afiliados

| # | Tarea | Área |
|---|-------|------|
| 3.2.1 | Sección "Recomendados" en dashboard (joysticks, camisetas, carnes) con links afiliados | Web |
| 3.2.2 | Banner de afiliado contextual (ej: "Necesitás un segundo joystick?" después de crear un asado) | Web |

### 3.3 Premium Android

| # | Tarea | Área |
|---|-------|------|
| 3.3.1 | Reconocimiento de plan del grupo desde Android (API key en settings) | Android |
| 3.3.2 | Sincronización automática (intervalo configurable, sin necesidad de tap manual) | Android |
| 3.3.3 | Notificaciones push cuando alguien del grupo carga un resultado | Android |

---

## Fase 4 — B2B y Escala (Sprint 13-18, ~3 meses)
> Acá se multiplican los ingresos.

### 4.1 Bar / Lounge

| # | Tarea | Área |
|---|-------|------|
| 4.1.1 | Modo "TV Display" — pantalla de líderes a pantalla completa, sin navegación, auto-refresh | Web |
| 4.1.2 | QR dinámico por mesa/consola para que los players vean sus stats en el celular | Web |
| 4.1.3 | Branding del local en la pantalla (logo, colores) | Web |
| 4.1.4 | Gestión de múltiples consolas/mesas desde un dashboard | Web |

### 4.2 Liga Organizada

| # | Tarea | Área |
|---|-------|------|
| 4.2.1 | Múltiples torneos simultáneos con categorías (ej: "Primera", "Ascenso") | Web |
| 4.2.2 | Inscripción de jugadores con datos extra (equipo, camiseta, teléfono) | Web |
| 4.2.3 | Certificado digital descargable por torneo completo | Web |
| 4.2.4 | Importar/exportar fixture en Excel | Web |

### 4.3 Infraestructura

| # | Tarea | Área |
|---|-------|------|
| 4.3.1 | Rate limiting + caching (Redis para leaderboards) | Infra |
| 4.3.2 | API pública documentada (Swagger/OpenAPI) | Web |
| 4.3.3 | Webhooks salientes (ej: notificar a tu web cuando termina un torneo) | Web |
| 4.3.4 | Dashboard de métricas internas (MRR, grupos activos, torneos creados) | Web |

---

## Fase 5 — Evento Real (Sprint 19-20, ~1 mes)
> "Copa Asado de Oro" — el hito de marketing más grande del año.

| # | Tarea | Área |
|---|-------|------|
| 5.1 | Landing del evento con countdown, reglas, premios | Web |
| 5.2 | Sistema de inscripción + pago online | Web |
| 5.3 | Bracket en vivo durante el evento (streamable) | Web |
| 5.4 | Integración OBS overlay para stream (stats en vivo) | Web |
| 5.5 | Post-evento: certificados, stats del torneo, fotos | Web |

---

## Mapa de Dependencias

```
Fase 0 ──────────────────────────────────────────────────────────┐
  │                                                              │
  ├─ 0.4 (normalizar DB) ──► Fase 1 (feature gates, pagos) ──► Fase 2
  │                                                              │
  ├─ 0.6 (shared types) ──► Android + Web sincronizan tipos ──► Fase 3.3
  │                                                              │
  └─ 0.8 (CI) ──► todas las fases siguientes                     │
                                                                 │
Fase 1 ──► Fase 2 ──► Fase 3 ──► Fase 4 ──► Fase 5             │
         (lanza)     (torneos)   (B2B)     (evento)              │
                               ▲                                 │
                               └── Necesita Fase 0.4 (DB normal) │
```

**Regla de oro**: No arrancar Fase 1 sin terminar Fase 0.4 (DB normalizada). El resto puede solaparse.

---

## Stack Técnico a Incorporar

| Tecnología | Para qué | Fase |
|-----------|----------|------|
| **Vitest** | Tests unitarios | 0 |
| **Zod** | Validación + tipos compartidos | 0 |
| **Mercado Pago SDK** | Pagos Latam | 1 |
| **Stripe SDK** | Pagos globales | 1 |
| **HTML2Canvas / @napi-rs/canvas** | Generar imágenes para compartir | 2 |
| **Chart.js / recharts** | Gráfico ELO histórico | 2 |
| **i18n (primer inglés)** | Internacionalización futura | 2+ |
| **Redis** | Caching de leaderboards | 4 |
| **Swagger/OpenAPI** | Documentación API pública | 4 |

---

## Equipo Sugerido

| Rol | Dedicación | Fases |
|-----|-----------|-------|
| 1 Full-stack (Next.js + MongoDB) | 100% | 0-5 |
| 1 Android (Kotlin/Compose) | 50% → 100% en Fase 3 | 0, 3, 4 |
| 1 Diseñador UX/UI | Part-time (landing, pricing, compartir) | 1, 2, 5 |
| 1 Marketing / Growth | Part-time desde Fase 2 | 2-5 |

---

## Estimación de Tiempo Total

| Fase | Sprints | Meses | Horas estimadas (1 dev full-stack) |
|------|---------|-------|-----------------------------------|
| 0 — Fundación | 2 | 1 | 120h |
| 1 — Monetización | 2 | 1 | 80h |
| 2 — Lanzamiento | 4 | 2 | 200h |
| 3 — Crecimiento | 4 | 2 | 160h |
| 4 — B2B y Escala | 6 | 3 | 240h |
| 5 — Evento real | 2 | 1 | 80h |
| **Total** | **20** | **10 meses** | **~880h** |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| La DB normalizada rompe compatibilidad con Android actual | Alta | Alto | Mantener `POST /api/ao` legacy que acepta snapshot y lo normaliza internamente |
| Mercado Pago integración compleja en Argentina | Media | Medio | Tercerizar con un dev con experiencia en MP; tener Stripe como fallback global |
| Poca conversión free→pago | Media | Alto | A/B testing en límites del free tier; encuesta a betas antes de lanzar |
| Android legacy (`com.example`) difícil de renombrar | Media | Bajo | Package rename es cosmético; postergar si frena features core |
| Churn alto post-lanzamiento | Media | Alto | Invertir en features sociales (compartir, feed) que generan stickiness grupal |

---

## Checklist de "Launch Ready"

- [ ] DB normalizada (players, asados, matches)
- [ ] Pagos funcionales (MP + Stripe) en staging y production
- [ ] Feature gates operando (free tier efectivamente limitado)
- [ ] Pricing page publicada
- [ ] Compartir ranking a WhatsApp funcionando
- [ ] Badge personalizado + certificado funcionales
- [ ] Onboarding wizard operativo
- [ ] CI pasando (tests + lint)
- [ ] 3 grupos beta pagando activamente

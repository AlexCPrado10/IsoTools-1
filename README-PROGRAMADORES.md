# README para programadores — rama `feature/filter`

Guía práctica de lo que **debes hacer** para trabajar con la plataforma de eventos que entrega esta rama, en el **orden correcto**. Si es tu primer día, sigue los pasos de arriba hacia abajo sin saltarte ninguno.

> Contexto: este repo es **solo-tools** (sin web ni dashboards). Aquí vive el core de ingesta/consumo de eventos entre tools ISO. La orientación general está en [`README.md`](./README.md); la referencia de la plataforma cloud, en [`PLATAFORMA-CLOUD.md`](./PLATAFORMA-CLOUD.md).

---

## 1. Qué entrega esta rama

`feature/filter` convierte el endpoint de eventos en una **plataforma de consumo sin over-fetch**. Lo nuevo:

| Capacidad | Para qué sirve |
|-----------|----------------|
| **Cursor keyset** (`?since_seq=N`) | Consumo incremental continuo sin re-escanear ni deduplicar en el cliente. |
| **Filtros server-side** | `type`, `module_id`, `asset_id`, `category`, `severity` — el core filtra, el consumidor no descarga de más. |
| **`/events/latest`** | La última data por tipo (`DISTINCT ON`), con **cache + ETag/304** para el poll continuo. |
| **`/events/subscriptions/:toolId`** | Entrega a una tool **solo los tipos que declara consumir** en `tools.json`. |
| **Ingesta idempotente** | Reintentar el mismo `event_id` no duplica ni re-dispara la cadena. |
| **Catálogo público** (`/catalog/*`) | Contrato consultable (sin API key) del Event Standard y de productores/consumidores. |
| **Config central** (`src/config.js`) | Todo lo ajustable por env, leído una sola vez. |
| **Rate limit + cache en proceso** | Protegen el core del poller mal configurado sin infraestructura extra. |
| **Bootstrap de API key** | Crear una key desde `BOOTSTRAP_API_KEY` en entornos nuevos (Railway). |

Degradación con gracia: si una base vieja no tiene la columna `seq` o el índice único de `event_id`, la API **sigue funcionando** en modo compatible (ver `src/db/capabilities.js`).

---

## 2. Requisitos previos

- Node.js 18+ y npm.
- Docker + Docker Compose (para el camino recomendado), o un Postgres accesible.
- `git` con acceso al remoto.

---

## 3. Pasos para levantar el ambiente

### Camino A — con Docker (recomendado)

```bash
# 1. Estás en la rama correcta
git checkout feature/filter

# 2. Dependencias
npm install

# 3. Postgres + API
docker compose --profile api up -d

# 4. Crea una API key (imprime el valor UNA sola vez: cópialo)
npm run apikey:create mi-cliente -- --scopes=events:read,events:write

# 5. Verifica
curl http://localhost:3000/api/v1/health
```

### Camino B — sin Docker

```bash
cp .env.example .env          # ajusta DATABASE_URL a tu Postgres
npm install
npm run db:migrate            # aplica db/init.sql
npm run dev                   # nodemon
```

> El esquema base se crea al arrancar si el Postgres es nuevo. La migración detecta `seq` y el índice único de `event_id` y ajusta las capacidades.

---

## 4. Variables de entorno que debes conocer

Copia `.env.example` y ajusta según tu entorno. Las que más impactan al consumo:

```bash
EVENTS_DEFAULT_LIMIT=100     # tamaño de lote por defecto
EVENTS_MAX_LIMIT=1000        # tope duro (evita ventanas enormes)

CACHE_ENABLED=true           # cache en proceso para /latest y catálogo
CACHE_LATEST_TTL_MS=1500

RATE_LIMIT_ENABLED=true      # cuota por API key (ventana fija en memoria)
RATE_LIMIT_WINDOW_MS=1000
RATE_LIMIT_MAX=50

BUS_CHAIN_TIMEOUT_MS=8000    # tope de la cadena de tools dentro del POST
```

Para provisionar una key en un entorno nuevo (Railway) sin correr scripts a mano:

```bash
BOOTSTRAP_API_KEY=...               # se inserta al arrancar (no se loguea)
BOOTSTRAP_API_KEY_SCOPES=events:read,events:write
# QUITA la variable después de usarla.
```

---

## 5. Cómo PUBLICAR un evento (productor)

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "x-api-key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d @sample-event.json
```

Reglas que debes respetar:

- El payload debe pasar la validación del **Industrial Event Standard** (`src/data/agents/event-standard.json`).
- **Reintenta con el mismo `event_id`** si dudas: es idempotente → responde `200 status:"duplicate"` sin re-disparar la cadena. Un evento nuevo responde `201 status:"accepted"`.
- No dependas de que la cadena de tools termine dentro del POST: si excede `BUS_CHAIN_TIMEOUT_MS`, el evento ya quedó guardado y la cadena termina en segundo plano.

---

## 6. Cómo CONSUMIR eventos (elige el patrón correcto)

Todas las lecturas requieren API key con scope `events:read`.

### 6.1 Consumo incremental continuo → **keyset** (el patrón por defecto)

```bash
# Primer tick: arranca desde 0
curl -H "x-api-key: $KEY" \
  "http://localhost:3000/api/v1/events?since_seq=0&type=quality.inspection.completed"

# La respuesta trae next_seq; úsalo en el siguiente tick
curl -H "x-api-key: $KEY" \
  "http://localhost:3000/api/v1/events?since_seq=<next_seq>&type=quality.inspection.completed"
```

- Devuelve `seq > since_seq` en orden ascendente. **No hay solapes ni necesitas deduplicar.**
- Guarda `next_seq` como tu cursor entre ticks.
- Filtra server-side con `type` (repetido `?type=A&type=B` o CSV `?type=A,B`), `module_id`, `asset_id`, `category`, `severity`.

### 6.2 "Solo la última data por tipo" → **/events/latest** (poll barato)

```bash
curl -H "x-api-key: $KEY" -H 'If-None-Match: W/"42"' \
  "http://localhost:3000/api/v1/events/latest?type=quality.inspection.completed"
```

- Devuelve el evento más reciente por cada `type`.
- Manda el `ETag` que recibiste en `If-None-Match`: si no cambió, responde **304** (cero cuerpo, ahorra ancho de banda en el poll).

### 6.3 "Lo que mi tool consume" → **/events/subscriptions/:toolId**

```bash
curl -H "x-api-key: $KEY" \
  "http://localhost:3000/api/v1/events/subscriptions/manage_nonconformances?since_seq=0"
```

- Entrega solo los tipos que esa tool declara consumir en `tools.json`. **El consumidor no necesita saber quién produce.** También es keyset (`since_seq` / `next_seq`).

### 6.4 Trazabilidad → **/events/chain/:correlationId**

```bash
curl -H "x-api-key: $KEY" \
  "http://localhost:3000/api/v1/events/chain/<correlation_id>"
```

- Cadena causal completa en orden cronológico (evidencia ISO).

### 6.5 Descubrir el contrato → **/catalog** (sin API key)

```bash
curl http://localhost:3000/api/v1/catalog/event-standard
curl http://localhost:3000/api/v1/catalog/events
curl http://localhost:3000/api/v1/catalog/tools/manage_nonconformances
```

---

## 7. Pasos para construir una tool consumidora

1. **Declara qué consume** tu tool en `src/data/agents/tools.json` (array `consumes`). Sin esto, `/subscriptions` no le entrega nada.
2. Crea el handler en `src/tools/` y regístralo en `src/tools/index.js`.
3. Consume con **keyset**: persiste tu `next_seq` y arranca cada tick desde ahí. Usa `/subscriptions/:toolId` para no acoplarte a productores.
4. Respeta el rate limit: si recibes **429**, respeta `Retry-After`. No hagas poll en bucle caliente; usa un intervalo razonable y apóyate en el `ETag` de `/latest`.
5. Si tu cambio afecta un contrato tool↔tool, trabájalo en su rama `comm/<source>__<target>` y **anota la bitácora** en `cerebro/comunicaciones/`.

---

## 8. Pruebas rápidas

```bash
npm run seed:events 50     # inserta eventos de prueba
npm run seed:stream        # envía eventos al endpoint (usa API_KEY)
npm run sim:iso            # simula la cadena del paquete ISO 9001
npm run lint               # eslint
```

Checklist antes de tu PR:

- [ ] `npm run lint` sin errores.
- [ ] Los endpoints que tocas responden con la API key correcta y su scope.
- [ ] Los filtros `type/module_id/asset_id/category/severity` devuelven lo esperado.
- [ ] El cursor `next_seq` avanza y no repite eventos entre ticks.
- [ ] Si cambiaste un contrato, la bitácora del cerebro está actualizada.

---

## 9. Flujo de git en esta rama

```bash
git checkout feature/filter
git pull --ff-only

# trabaja, commitea con mensajes claros (feat/fix/docs …)
git push origin feature/filter
```

Cuando el consumo quede estable, abre **PR `feature/filter` → `main`**. No mezcles cambios de contrato tool↔tool aquí: esos van en su rama `comm/<source>__<target>` (ver [`README.md`](./README.md), sección de ramas).

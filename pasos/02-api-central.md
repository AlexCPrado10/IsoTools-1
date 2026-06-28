# Paso 2 — Crear la API central y conectarse a ella

> [⬅ Volver al roadmap](../README.md)

## Qué vas a lograr en este paso

Tener claras las **dos formas** en que vas a usar la API mientras desarrollas tu tool, y cómo conectarte a la API compartida del equipo:

1. **Local con Docker** — para iterar rápido en tu handler sin internet ni latencia.
2. **API central en Railway** — para probar integración con tools de otros programadores.

Al final del paso vas a tener corriendo la API en local, una API key personal, y la URL de la central para integración.

> 📥 **Plantillas descargables**:
> - [`env-local.example`](../plantillas/env-local.example) — variables de entorno para desarrollo local
> - [`env-central.example`](../plantillas/env-central.example) — variables para conectarte a la API compartida

---

## 2.1 Topología híbrida — qué corre dónde

```
┌───────────────────────────────────────────────────────────┐
│  TU LAPTOP (cada programador)                              │
│                                                            │
│  docker compose --profile api up -d                        │
│       ┌──────────────────────────┐                         │
│       │ IsoTools (Node) │ ◄── tu tool en          │
│       │  puerto 3000             │     src/tools/...       │
│       └────────────┬─────────────┘                         │
│                    ▼                                       │
│       ┌──────────────────────────┐                         │
│       │ Postgres 16 (Docker)     │                         │
│       └──────────────────────────┘                         │
│                                                            │
│  Usar para: iterar el handler, smoke tests, debugging      │
└───────────────────────────────────────────────────────────┘
                            │
                            │ git push
                            ▼
┌───────────────────────────────────────────────────────────┐
│  API CENTRAL — Railway                                     │
│  https://www.expo-programador.com                          │
│                                                            │
│  Proyecto: zealous-perception                              │
│  Auto-deploy en cada push a main                           │
│  Postgres 18 administrado (plugin de Railway)              │
│  Health: /api/v1/health                                    │
│                                                            │
│  Usar para: integración real entre tools, demos, reporte   │
│  ISO con datos compartidos, dashboard del equipo           │
└───────────────────────────────────────────────────────────┘
```

**Regla simple**: desarrollas en local, integras en central.

---

## 2.2 Parte A — Correr la API en local (cada programador)

### Pre-requisitos

- Docker Desktop (Mac/Win) o Docker Engine + Compose (Linux)
- Git
- Node 18+ (opcional, solo si quieres correr scripts fuera de Docker)

### Paso a paso

```bash
# 1. Clonar el repo
git clone <url-del-repo-IsoTools>
cd IsoTools

# 2. Copiar el .env de ejemplo
cp .env.example .env

# 3. Levantar API + Postgres
docker compose --profile api up -d

# 4. Verificar que vive
curl http://localhost:3000/api/v1/health
# Esperado: {"status":"ok"}

# 5. Crear tu API key personal (queda guardada en la DB local)
docker compose exec api npm run apikey:create -- mi-nombre --scopes=events:read,events:write
# Copia la key que aparece. NO se vuelve a mostrar.

# 6. Mandar un evento de prueba
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: <tu-key-local>" \
  -d @sample-event.json
```

> Si necesitas también el dashboard: `docker compose --profile dashboard up -d` y abre `http://localhost:3000/dashboard`.

### Cuándo usas la API local

| Caso | Usa local |
|---|---|
| Estás iterando en el código de tu handler | ✅ |
| Quieres correr smoke tests rápido (sin red) | ✅ |
| Debuggeas un evento que se rompe en ingest | ✅ |
| Sembrar 200 eventos para llenar el dashboard | ✅ (`docker compose --profile seed up`) |

---

## 2.3 Parte B — Deploy de la API central en Railway

> Esta parte la hace **una vez** el admin del proyecto (Carlos). Si tú eres un programador externo, salta a [2.4](#24-parte-c--conectarte-a-la-api-central).

### Por qué Railway

- Ya hay `railway.toml` en el repo → el deploy es prácticamente automático.
- Postgres administrado incluido (no instalas ni respaldas nada manualmente).
- $5-20/mes según uso (suficiente para los primeros 6-12 meses).
- Auto-deploy: cada push a `main` redespliega.
- Si crece el uso a >100k eventos/día sostenidos, ahí sí evalúas migrar a VPS (Hetzner ~$10/mes con misma carga). Por debajo de eso, Railway gana.

### Pasos de deploy (una vez)

1. **Crea cuenta** en [railway.app](https://railway.app) y conecta tu GitHub.
2. **Nuevo proyecto** → `Deploy from GitHub repo` → selecciona `IsoTools`.
3. Railway lee `railway.toml` automáticamente (builder: Dockerfile, healthcheck: `/api/v1/health`).
4. **Añade Postgres**: dentro del proyecto, `+ New` → `Database` → `Add PostgreSQL`. Railway expone `DATABASE_URL` automáticamente al servicio API.
5. **Variables de entorno del servicio API** (Settings → Variables):
   - `PORT=3000`
   - `LOG_LEVEL=info`
   - `DATABASE_URL` ← ya inyectada por Railway, no la pongas a mano
6. **Ejecuta migraciones la primera vez** (desde la consola de Railway o local apuntando a la `DATABASE_URL` pública):
   ```bash
   psql $DATABASE_URL -f db/init.sql
   ```
7. **Genera el dominio público**: Settings → Networking → `Generate Domain`. Obtienes algo como `IsoTools-production.up.railway.app`, o conectas un dominio propio (en este proyecto: `www.expo-programador.com`).
8. **Crea API keys para los programadores** (ver § 2.5).

### Verificar el deploy

```bash
curl https://www.expo-programador.com/api/v1/health
# Esperado: {"status":"ok"}
```

### ⚠️ Gotchas reales de este proyecto (anota antes de operar)

Lecciones aprendidas al hacer el deploy inicial. Si vas a tocar Railway, léelo:

1. **Postgres se rompe si Railway sube de versión mayor.** El proyecto fue creado con PG16; cuando el template auto-actualizó a PG18, el `postgresql.conf` quedó con parámetros nuevos (`autovacuum_worker_slots`) que PG16/17 no entienden. Si ves el servicio Postgres en CRASHED y el log dice `unrecognized configuration parameter`, la opción rápida es volver a la imagen que sí arranca con el volumen. Mutación GraphQL:
   ```graphql
   mutation { serviceInstanceUpdate(
     serviceId: "<id>", environmentId: "<id>",
     input: { source: { image: "ghcr.io/railwayapp-templates/postgres-ssl:18" } }
   ) }
   ```
   Después: `serviceInstanceDeployV2(...)` para forzar el deploy.

2. **El proxy TCP de Postgres (`switchyard.proxy.rlwy.net:14199`) cierra TCP sin razón aparente cuando Postgres está crasheado.** El handshake TCP abre, pero el proceso pg detrás está muerto → ECONNRESET. Si ves esto en `psql`/`pg`, primero revisa que el servicio Postgres esté en SUCCESS, no CRASHED.

3. **`db/init.sql` tiene un `GRANT CONNECT ON DATABASE industrial_events`** que falla en Railway porque la base se llama `railway`, no `industrial_events`. Es no bloqueante (el resto del schema se crea), pero conviene parchar a `current_database()`.

4. **`src/db/index.js` y `scripts/createApiKey.js` NO leen `DATABASE_URL`.** Leen `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`. En Railway hay que crear esas vars como referencias:
   ```
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   DB_NAME=${{Postgres.PGDATABASE}}
   ```
   Sin esto, la API arranca pero falla 500 al primer query con `ECONNREFUSED ::1:5432` (intenta localhost).

5. **Plan sin shell.** Si tu plan de Railway no expone `Shell` en el servicio ni `Data` tab en Postgres, para crear keys o correr migraciones ad-hoc tienes que conectarte por el TCP proxy público desde tu máquina (`docker run --rm postgres:16 psql ...`). El CLI `railway run` requiere shell autenticada que algunos planes no proveen.

---

## 2.4 Parte C — Conectarte a la API central

Si eres un programador externo y vas a integrar con la API ya desplegada:

### Pre-requisitos

- La **URL pública** de la API (te la da el admin, ej. `https://www.expo-programador.com`).
- Tu **API key personal** (te la da el admin, generada con `apikey:create`).

### Configura tu `.env` para apuntar a la central

Crea `.env.central` en la raíz de tu repo local:

```bash
API_BASE_URL=https://www.expo-programador.com
API_KEY=<tu-key-de-railway>
```

> No commitees `.env.central`. Añádelo al `.gitignore`.

### Mandar un evento a la central

```bash
curl -X POST $API_BASE_URL/api/v1/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d @sample-event.json
```

### Consultar eventos en la central

```bash
curl "$API_BASE_URL/api/v1/events?since_id=0" -H "x-api-key: $API_KEY"
```

### Ver la cadena causal de un evento

```bash
curl "$API_BASE_URL/api/v1/events/chain/<correlation-id>" -H "x-api-key: $API_KEY"
```

---

## 2.5 Parte D — Gestión de API keys (una por programador)

**Decisión del proyecto**: cada programador tiene su propia API key. Esto te da:

- Trazabilidad de quién ingestó qué.
- Posibilidad de revocar a un programador sin afectar a los demás.
- Scopes diferenciados (ej. junior solo `events:read`).

### Crear una key (lo hace el admin)

En la API **local**:
```bash
docker compose exec api npm run apikey:create -- carlos --scopes=events:read,events:write
```

En la API **central de Railway** (vía consola web de Railway, en la pestaña "Shell" del servicio API):
```bash
node scripts/createApiKey.js juanperez --scopes=events:read,events:write
```

La salida contiene la key en texto plano **una sola vez**:
```
API key created for label: juanperez
Scopes: events:read, events:write
Save this key securely, it will not be shown again:
abc123xyz...
```

### Scopes disponibles

| Scope | Permite |
|---|---|
| `events:read` | `GET /api/v1/events`, `/chain/:id`, dashboard |
| `events:write` | `POST /api/v1/events` (ingesta) |

Combinaciones típicas:

- **Programador**: `events:read,events:write` (default)
- **Tool/cliente solo-ingest**: `events:write`
- **Dashboard externo / consultor**: `events:read`

### Revocar una key

Hoy es manual contra la DB:

```sql
DELETE FROM api_keys WHERE label = 'nombre-del-programador';
```

> Si esto se vuelve frecuente, agregamos un script `apikey:revoke`. Por ahora rota y avisa.

### Reglas de seguridad

- La key se guarda **hasheada** en la DB (SHA-256). Si la pierdes, no se recupera — generas una nueva.
- **Nunca** comitees una key. `.env*` debe estar en `.gitignore`.
- Si la filtraste, revoca de inmediato y genera otra.

---

## 2.6 Cuándo usar local vs central — tabla decisiva

| Lo que vas a hacer | Local | Central |
|---|---|---|
| Escribir y probar tu handler | ✅ | ❌ |
| Smoke test del handler aislado | ✅ | ❌ |
| Probar que tu tool se dispare con el bus | ✅ (más rápido) | ✅ |
| Integrar con tool de otro programador | ❌ | ✅ |
| Validar que el reporte ISO incluye tu agente | ❌ | ✅ |
| Demo a stakeholders | ❌ | ✅ |
| Seed de 200 eventos para llenar el dashboard | ✅ | Solo si el admin lo aprueba |

---

## 2.7 Solución de problemas comunes

| Síntoma | Causa | Cómo resolver |
|---|---|---|
| `connection refused` al hacer curl local | Docker compose no levantó | `docker compose --profile api up -d` y revisa `docker compose logs api` |
| `401 Unauthorized` | API key faltante o mal escrita | Verifica header `x-api-key` (no `Authorization`), key sin saltos de línea |
| `403 forbidden — missing scope` | Tu key no tiene `events:write` | Regenera con el scope correcto |
| Evento aceptado pero no aparece en `/events` | Falló validación silenciosa o se cayó el worker del bus | `docker compose logs api` o en Railway: pestaña "Deployments" → "View Logs" |
| Railway tarda en redesployar | Build de Docker lento | Normal en el primer deploy. Subsecuentes usan cache y bajan a ~1 min |

---

## Archivos descargables

- 📥 [`env-local.example`](../plantillas/env-local.example) — `.env` para desarrollo local con Docker Compose.
- 📥 [`env-central.example`](../plantillas/env-central.example) — `.env.central` para conectarte a Railway.

---

## Siguiente paso

→ [Paso 3: Cargar los archivos JSON del estándar](./03-archivos-json.md) _(en preparación)_

Si ya tienes la API corriendo y quieres saltar al código: → [Paso 4: Nombrado IES](./04-nombrado-ies.md)

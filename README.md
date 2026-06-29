# IsoTools

Repositorio **único y enfocado** para construir las *tools* de los agentes industriales orientadas a **procedimientos ISO**. Aquí está todo lo necesario para entender, crear, probar y coordinar tools — y **nada más**.

> **Qué NO está aquí (a propósito):** el sitio web, los dashboards, las landings y las vistas Pug. Eso vive en el repo de la plataforma. En IsoTools solo hay el plano de *tools*: handlers, bus de eventos, validación, la API de ingesta, los JSON de configuración y la documentación para programarlas. Así nadie se distrae con código que no le toca.

---

## 🚀 Empieza aquí según quién seas

- **Vas a programar una tool por primera vez** → sigue el roadmap paso a paso en **[`pasos/`](./pasos/)** (1 → 10, sin saltarte ninguno).
- **Necesitas la referencia técnica** → **[`docs/GUIA_TOOLS.md`](./docs/GUIA_TOOLS.md)** (anatomía del handler, reglas de nombrado IES, comunicación, checklist).
- **Quieres ver qué hace cada tool y con quién habla** → abre el **[cerebro Obsidian](./cerebro/)** (`cerebro/index.md`). Cómo usarlo y coordinarte con la otra tool: **[`pasos/10-cerebro-y-colaboracion.md`](./pasos/10-cerebro-y-colaboracion.md)**.
- **Vas a levantar y probar el ambiente** → **[`docs/SIMULACION_PASO_A_PASO.md`](./docs/SIMULACION_PASO_A_PASO.md)**.

---

## Estructura del repo

```
IsoTools/
├── README.md                  ← este archivo
├── pasos/                     ← roadmap del programador (1 → 9)
├── plantillas/                ← esqueletos descargables (handler, meta, regla, placeholder…)
├── recursos/                  ← diagramas y material de apoyo
├── docs/
│   ├── GUIA_TOOLS.md          ← referencia técnica para crear una tool
│   ├── SIMULACION_PASO_A_PASO.md
│   └── postman/               ← colección Postman lista para importar
├── cerebro/                   ← 🧠 segundo cerebro Obsidian (tools + comunicaciones)
├── src/
│   ├── server.js              ← API de ingesta de eventos (SOLO tools, sin web)
│   ├── tools/                 ← un archivo por tool + index.js (registro)
│   ├── data/agents/           ← los 5 JSON de configuración del sistema
│   ├── services/              ← eventBus · eventsService · validationService
│   ├── controllers/           ← eventsController
│   ├── routes/                ← eventsRoutes
│   ├── middleware/            ← apiKeyAuth
│   └── db/                    ← conexión y migración Postgres
├── scripts/
│   ├── createApiKey.js · seedEvents.js · simulateStream.js · test_package_iso.js
│   ├── generar-cerebro.js     ← genera/actualiza las notas del cerebro
│   └── crear-rama-comunicacion.js ← crea la rama de una comunicación tool↔tool
├── db/init.sql
├── docker-compose.yml · Dockerfile · railway.toml
└── .env.example
```

---

## Cómo correr el ambiente (local)

```bash
# 1. Dependencias
npm install

# 2. Postgres + API con Docker Compose
docker compose --profile api up -d

# 3. Crear una API key
npm run apikey:create mi-cliente -- --scopes=events:read,events:write

# 4. Probar
curl http://localhost:3000/api/v1/health
```

Servicios: API en `http://localhost:3000`, Postgres en `localhost:5432` (`industrial`/`industrial`).
Sin Docker: copia `.env.example` → `.env`, ajusta `DATABASE_URL` y corre `npm run dev`.

### Endpoints (autenticados por API key)

| Método | Ruta | Qué hace |
|--------|------|----------|
| `POST` | `/api/v1/events` | Valida, guarda y **dispara la cadena de tools** |
| `GET`  | `/api/v1/events?start=…&end=…` | Consulta de eventos por rango |
| `GET`  | `/api/v1/events/chain/:correlationId` | Cadena causal de un correlation_id |
| `GET`  | `/api/v1/health` | Estado del servicio |

### Scripts útiles

| Script | Uso |
|--------|-----|
| `npm run apikey:create [label] -- --scopes=…` | Crea una API key (imprime el valor una sola vez). |
| `npm run seed:events [n]` | Inserta eventos de prueba en Postgres. |
| `npm run seed:stream` | Envía eventos al endpoint (usa `API_KEY`). |
| `npm run sim:iso` | Simula la cadena del paquete ISO 9001. |
| `npm run cerebro:generar` | Crea/actualiza las notas del cerebro Obsidian. |
| `npm run rama:comm <s>__<t>` | Crea la rama de una comunicación tool↔tool. |

---

## 🧠 El segundo cerebro (Obsidian)

`cerebro/` es un vault de Obsidian con la **memoria viva** de las tools. Hay una nota por tool y **una nota por cada comunicación entre dos tools**. Cada nota de comunicación tiene una **bitácora**: cuando un programador cambia el contrato de su tool, lo anota ahí, y el programador de la tool con la que se comunica lo ve sin tener que leer su código.

Ábrelo en Obsidian apuntando el vault a la carpeta `cerebro/`. Empieza por `cerebro/index.md`. Las reglas de mantenimiento están en `cerebro/CLAUDE.md`.

Para regenerar las notas tras agregar tools o reglas:
```bash
npm run cerebro:generar   # idempotente: nunca pisa lo que ya escribiste
```

---

## 🌿 Estrategia de ramas: una por comunicación

El trabajo entre dos tools que se comunican se hace en **su propia rama**, no en `main`. Convención:

```
comm/<sourceToolId>__<targetToolId>      ej: comm/inspect_product_quality__manage_nonconformances
```

Flujo:

1. **Crea/cambia a la rama de tu comunicación:**
   ```bash
   npm run rama:comm inspect_product_quality__manage_nonconformances
   npm run rama:comm --list     # ver todas las comunicaciones disponibles
   ```
2. **Trabaja el contrato** entre las dos tools en esa rama (código + payload).
3. **Anota el cambio** en la bitácora de `cerebro/comunicaciones/<source>__<target>.md`.
4. **PR de la rama → `main`** cuando el contrato quede estable.

Así `main` siempre refleja contratos acordados, y cada negociación entre dos programadores vive aislada hasta que cierra.

---

## Los 5 JSON de configuración (`src/data/agents/`)

| Archivo | Qué controla |
|---------|--------------|
| `event-standard.json` | El Industrial Event Standard (IES): forma y nombrado de los eventos. |
| `tools.json` | Catálogo de las 125 tools (id, schema de entrada/salida, categoría). |
| `tools-dev-spec.json` | Notas de implementación de cada tool (por qué los inputs, cálculos, UI). |
| `communication-rules.json` | Las 90 reglas: quién dispara a quién, con qué evento y condición. |
| `agents.json` | Los 13 agentes y qué tools agrupa cada uno. |

Quién edita cada uno y cuándo: ver **[`pasos/03-archivos-json.md`](./pasos/03-archivos-json.md)**.

---

## Estado

- **16 tools implementadas** (handler en `src/tools/`): paquete de **calidad ISO 9001**.
- **109 tools en catálogo** listas para implementar.
- **90 comunicaciones** declaradas en `communication-rules.json`.

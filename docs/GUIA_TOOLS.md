# Guía para constructores de tools

Esta guía es **el documento de referencia** para quien implemente cualquiera de las 137 tools del catálogo. Cubre el camino completo: cómo entender la arquitectura, cómo nombrar campos, cómo escribir el código de la tool, cómo registrar su regla de comunicación, cómo arrancar con un placeholder y cómo probarla localmente.

Si vas a escribir una tool, **léela completa antes de tocar código**. No es larga; te ahorra retrabajos.

---

## Índice

1. [Visión general — cómo encaja tu tool en el sistema](#1-visión-general)
2. [La regla mental: el sistema es un *bus*, no un orquestador](#2-la-regla-mental)
3. [Anatomía de un evento (el contrato)](#3-anatomía-de-un-evento)
4. [Reglas de nombrado, campo por campo](#4-reglas-de-nombrado)
5. [Anatomía de una tool (handler + meta)](#5-anatomía-de-una-tool)
6. [Pull vs Push vs In-process — qué hace tu tool](#6-pull-vs-push-vs-in-process)
7. [Cómo declarar la regla de comunicación](#7-regla-de-comunicación)
8. [Empezar con un placeholder](#8-placeholder)
9. [Cómo probar tu tool localmente](#9-pruebas-locales)
10. [Errores comunes](#10-errores-comunes)
11. [Checklist antes de mergear](#11-checklist)

---

## 1. Visión general

El sistema tiene tres capas. Tu tool vive en la capa de en medio.

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAPA 1 — PRODUCTORES                                                 │
│  Simulador, sensores, otras tools                                     │
│  Hacen: POST /api/v1/events                                           │
└────────────────────────────┬──────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│  CAPA 2 — API CENTRAL  (src/app.js)                                   │
│  1. apiKeyAuth         ── verifica la API key                         │
│  2. validationService  ── valida contra event-standard.json           │
│  3. eventsController   ── inserta en industrial_events                │
│  4. eventBus (worker)  ── lee tabla y dispara tools según             │
│                           communication-rules.json                    │
│  5. toolRunner         ── ejecuta el handler de la tool destino       │
└────────────────────────────┬──────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│  CAPA 3 — CONSUMIDORES                                                │
│  Dashboard (/dashboard) · Reporte ISO (/audit-report) · otras tools   │
└──────────────────────────────────────────────────────────────────────┘
```

**Tu tool es un handler que vive en `src/tools/<tool_id>.js`.** Recibe un evento, hace su trabajo, devuelve otro evento (o `null` si no hay nada que emitir). No abre conexiones a otras tools, no llama a webhooks, no hace HTTP. Solo procesa lo que le entra y devuelve lo que sale. El bus se encarga del resto.

---

## 2. La regla mental

**Las tools NO se llaman entre sí.** Nunca.

Si la tool A produce algo que la tool B necesita:

- A devuelve un evento.
- Ese evento se guarda en `industrial_events`.
- El `eventBus` lee `communication-rules.json` y descubre que B reacciona a ese tipo.
- El bus llama a B con el evento de A.

Las tools son ignorantes la una de la otra. Eso es lo que permite agregar, quitar o renombrar tools sin romper nada.

Antipatrón: dentro del handler de A, hacer `import { handler as runB } from './B.js'` y llamarla. **No lo hagas.** Rompe el bus, rompe la trazabilidad, rompe la independencia.

---

## 3. Anatomía de un evento

El contrato lo define `src/data/agents/event-standard.json`. Aquí está lo que tu handler debe respetar al **devolver** un evento, y lo que debe esperar al **recibir** uno.

### 3.1 Estructura base obligatoria

```json
{
  "event_id":         "uuid",
  "timestamp":        "2026-05-19T14:32:10.123Z",
  "platform_version": "2.0",
  "module": {
    "id":      "vision_ai",
    "version": "1.2.0"
  },
  "asset": {
    "asset_id":   "plant_01-assembly-line_2-robot_03",
    "asset_type": "robot",
    "plant_id":   "plant_01",
    "area_id":    "assembly",
    "line_id":    "line_2",
    "location":   "station_4"
  },
  "event": {
    "type":     "defect_detected",
    "category": "quality",
    "severity": "high"
  },
  "data": {
    "defect_class": "scratch",
    "confidence":   0.94,
    "image_ref":    "s3://defects/2026-05-19/abc.jpg"
  },
  "metadata": {
    "shift":        "B",
    "operator_id":  "op_142",
    "batch_id":     "batch-20260519-7"
  },
  "correlation_id": "01HG7Z9KQR5N3M2P4VX8YBWQTC",
  "causation_id":   "01HG7Z9KQR5N3M2P4VX8YBWQXX"
}
```

### 3.2 Qué pone quién

| Campo | Lo pone | Notas |
|---|---|---|
| `event_id` | El productor | UUID v4 o ULID. Único global. Constraint UNIQUE. |
| `timestamp` | El productor | ISO 8601 UTC. Momento del hecho, no de ingesta. |
| `received_at` | La API | Cuando entró al sistema. Se añade automático. |
| `platform_version` | El productor | "2.0" hoy. |
| `module` | El productor | Quién emite. `id` debe coincidir con un `tool_id` válido. |
| `asset` | El productor | Activo afectado. `asset_id` debe existir en el catálogo. |
| `event.type` | El productor | El tipo de evento — ver § 4. |
| `event.category` | El productor | Una de: `quality`, `productivity`, `maintenance`, `energy`, `safety`, `configuration`, `system`. |
| `event.severity` | El productor | Una de: `low`, `medium`, `high`, `critical`. |
| `data` | El productor | Payload específico. Estructura flexible pero documentada. |
| `metadata` | El productor (opcional) | Contexto no crítico: shift, operador, batch. |
| `correlation_id` | El productor o el bus | Raíz de la cadena causal. Ver § 3.3. |
| `causation_id` | El productor o el bus | Padre inmediato. Ver § 3.3. |

### 3.3 Reglas de `correlation_id` y `causation_id`

```
Evento A inicia una cadena              → correlation_id = event_id de A
Evento B reacciona a A                   → correlation_id = correlation_id de A
                                          causation_id   = event_id de A
Evento C reacciona a B                   → correlation_id = correlation_id de B (= A)
                                          causation_id   = event_id de B
```

Resultado: `SELECT * FROM industrial_events WHERE correlation_id = X` te devuelve la cadena completa A→B→C ordenada por timestamp.

**Si el bus es quien llama a tu tool, el bus rellena `correlation_id` y `causation_id` automáticamente.** Tu handler no tiene que tocarlos.

---

## 4. Reglas de nombrado

Estas son **las reglas duras** que evitan que el sistema se vuelva ingobernable. Léelas dos veces.

### 4.1 `event.type`

Formato: **`SCREAMING_SNAKE_CASE`** — todo en MAYÚSCULAS con guion bajo. El nombre describe **qué pasó**, con el resultado en pasado: `..._CAPTURED`, `..._DETECTED`, `..._UPDATED`, `..._ISSUED`, `..._GENERATED`.

> ⚠️ **Importante (corrige versiones previas de esta guía):** el `event.type` **NO** lleva dominio ni puntos, y **NO** es minúsculas. Es un nombre plano en MAYÚSCULAS, único en todo el sistema. El "dominio" de la tool vive aparte, en su campo **`category`** (`quality`, `productivity`, `energy`, …), no dentro del `event.type`.
>
> **Regla de oro:** el `event.type` que tu tool **produce** debe coincidir **carácter por carácter** con el campo `event` de la regla en `communication-rules.json` y con el `consumes` de la tool que reacciona. Si difiere en una sola letra, tu tool **nunca se dispara**.

Ejemplos correctos (son los que el bus realmente enruta hoy):

```
MEASUREMENTS_CAPTURED
CHART_POINTS_UPDATED
OUT_OF_CONTROL_DETECTED
NC_REQUIRES_8D
8D_REPORT_ISSUED
FOLLOWUP_SCHEDULED
DEFECT_FOUND
PRODUCTION_VARIANCE_DETECTED
```

Categorías válidas (campo `category` de la tool, **no** parte del `event.type`):

| Categoría | Para qué |
|---|---|
| `quality` | Defectos, no conformidades, inspecciones, SPC, MSA |
| `productivity` | OEE, desviaciones de producción, KPIs, proyectos |
| `maintenance` | Mantenimiento (órdenes, predicciones, FMEA) |
| `energy` | Consumo, picos, anomalías energéticas |
| `safety` | Incidentes, zonas, HAZOP, SIL |
| `supply_chain` | Cadena de suministro, proveedores, inventario |
| `erp` | KPIs de negocio, ventas, finanzas |
| `aiml` | Predicciones, anomalías ML, scoring |
| `edge` | Salud de equipos edge, conectividad |
| `cybersecurity` | Amenazas, eventos de seguridad OT/IT |

Ejemplos **incorrectos** (no hagas esto):

| Mal | Por qué |
|---|---|
| `DefectFound` | CamelCase. Usa `DEFECT_FOUND`. |
| `defect_found` | Minúsculas. Va en MAYÚSCULAS. |
| `quality.defect.found` | Sin puntos ni dominio en el nombre; el dominio va en `category`. |
| `MEASUREMENTS CAPTURED` | Sin espacios. Usa guion bajo. |
| `getChartPoints` | El `event.type` nombra un hecho ocurrido, no una acción a ejecutar. |

### 4.2 `asset_id`

Formato: `<plant_id>-<area_id>-<line_id>-<asset_type>_<numero>`. Todo en `snake_case` o números, separado por guiones a nivel de jerarquía y guion bajo para el sufijo numérico.

```
plant_01-assembly-line_2-robot_03
plant_01-compressors-line_1-pump_01
plant_03-warehouse-zone_a-sensor_07
```

**Estable de por vida.** Si renombras, pierdes el histórico. Si reemplazas el equipo físico, mismo `asset_id` (es la *posición*); el equipo físico va en `metadata.serial_number`.

Debe existir en la tabla `assets` (o en `src/data/assets.json` si lo manejamos como catálogo). La API rechaza eventos con `asset_id` desconocido.

Nunca uses nombres humanos como id: "Motor del compresor grande" va en `assets.display_name`, no en el id.

### 4.3 `module.id` (a.k.a. tool_id)

Formato: `snake_case`, una sola palabra compuesta, sin guiones intermedios.

```
get_inventory_status
predict_demand
optimize_stock_levels
detect_production_deviation
iso_10816_engine
```

Reglas:

- **Coincide exacto con el `id` de la tool en `src/data/agents/tools.json`.**
- **Coincide con el nombre del archivo**: `src/tools/<module.id>.js`.
- **Una tool, un id**: si corre en 3 réplicas, sigue siendo el mismo id.
- **No metas la versión en el nombre**: nada de `predict_demand_v2`. La versión va en `module.version`.

### 4.4 `module.version`

Formato: SemVer `MAJOR.MINOR.PATCH` como string: `"1.2.0"`. Sube `MAJOR` cuando el contrato de salida cambia (campos en `data` se renombran o cambian de tipo).

### 4.5 `event.category` y `event.severity`

**Enum cerrado.** No inventes valores nuevos sin agregar al `event-standard.json`.

- `category`: `quality` | `productivity` | `maintenance` | `energy` | `safety` | `configuration` | `system`
- `severity`: `low` | `medium` | `high` | `critical`

Tabla de cuándo usar cada severidad:

| Severidad | Cuándo |
|---|---|
| `low` | Información o advertencia menor. No requiere acción. |
| `medium` | Desviación notable. Revisar en el turno. |
| `high` | Anomalía clara. Acción dentro de la hora. |
| `critical` | Riesgo inmediato. Acción ahora. Para línea / dispara protocolo de seguridad. |

### 4.6 Dentro de `data`

- **JSON plano.** Máximo 2 niveles de anidación. Las consultas Postgres se vuelven dolorosas con `data->a->b->c->d`.
- **Unidades en el nombre del campo**: `temperature_c`, `vibration_mm_s`, `pressure_bar`, `duration_ms`, `cost_usd`. Esto elimina el clásico "¿esto eran °F o °C?".
- **`snake_case`** en todas las claves.
- **No repitas IDs**: si ya está en `asset.asset_id` arriba, no lo pongas también en `data`.
- **Sin JSON serializado**: nada de `"data": { "payload": "{\"x\":1}" }`. JSON nativo siempre.

### 4.7 `event_id` y `correlation_id`

- Formato **ULID** recomendado (ordenable por tiempo, ej. `01HG7Z9KQR5N3M2P4VX8YBWQTC`).
- UUID v4 también válido si tu tool ya genera UUIDs.
- Nunca lo reutilices, nunca lo modifiques una vez emitido.

---

## 5. Anatomía de una tool

Una tool es **un archivo en `src/tools/<tool_id>.js`** que exporta dos cosas: `meta` y `handler`. Eso es todo.

### 5.1 El esqueleto exacto

```js
// src/tools/detect_production_deviation.js

export const meta = {
  id:          'detect_production_deviation',
  name:        'Detect Production Deviation',
  version:     '1.0.0',
  consumes:    ['PRODUCTION_METRICS_SNAPSHOT'],
  produces:    ['PRODUCTION_DEVIATION_DETECTED'],
  category:    'productivity',
  description: 'Compara producción planificada vs real y emite alerta si la desviación supera 5%.',
};

export async function handler(inputEvent) {
  const { planned, actual } = inputEvent.data;
  const deviationPct = ((actual - planned) / planned) * 100;

  if (Math.abs(deviationPct) < 5) {
    return null; // no hay nada que emitir
  }

  return {
    event: {
      type:     'PRODUCTION_DEVIATION_DETECTED',
      category: 'productivity',
      severity: Math.abs(deviationPct) > 15 ? 'high' : 'medium',
    },
    asset: inputEvent.asset, // hereda el activo del evento entrante
    data: {
      planned,
      actual,
      deviation_pct: Number(deviationPct.toFixed(2)),
    },
  };
}
```

### 5.2 Reglas del handler

1. **Firma fija**: `async function handler(inputEvent)`.
2. **Retorno**: un objeto con (al menos) `event`, `asset`, `data`. O un array si emite varios. O `null` si no emite nada.
3. **Lo que NO devuelves**: `event_id`, `timestamp`, `module`, `platform_version`, `correlation_id`, `causation_id`. El bus los rellena automático.
4. **Sin efectos secundarios externos**: no llames a otras tools, no escribas en la DB, no hagas HTTP saliente. Tu único output es el `return`.
5. **Síncrono respecto a I/O propio**: si necesitas leer un archivo de catálogo o calcular algo, hazlo. Pero no toques recursos compartidos.
6. **Errores**: lanza `throw new Error('mensaje')`. El bus lo captura, corta esa rama de la cadena y registra la falla como una entrada `{ tool, error, triggered_by }` en el `chain` de la respuesta (el resto de la cadena sigue). No silencies excepciones.
7. **Idempotente**: si te llaman dos veces con el mismo input, debes producir el mismo output.

### 5.3 Casos válidos de retorno

```js
// Caso 1 — un solo evento
return { event: {...}, asset: {...}, data: {...} };

// Caso 2 — múltiples eventos
return [
  { event: {...}, asset: {...}, data: {...} },
  { event: {...}, asset: {...}, data: {...} },
];

// Caso 3 — no emitir nada
return null;
```

### 5.4 Qué hay en `meta`

| Campo | Obligatorio | Para qué |
|---|---|---|
| `id` | Sí | Identificador único. Igual al nombre del archivo. |
| `name` | Sí | Nombre legible. |
| `version` | Sí | SemVer. |
| `consumes` | Sí | Array de `event.type` a los que reacciona. Vacío si solo se invoca manualmente. |
| `produces` | Sí | Array de `event.type` que puede emitir. |
| `category` | Sí | Una de las 7 categorías del enum. |
| `description` | Sí | Una línea. Para el dashboard de tools. |
| `inputSchema` | Recomendado | JSON Schema de `data` que espera. |
| `outputSchema` | Recomendado | JSON Schema de `data` que produce. |

> **Dónde vive cada cosa:** el `meta` del handler (`src/tools/<id>.js`) lleva `id`, `name`, `version`, `category`, `consumes`, `produces`, `description`. El **contrato de datos** —`inputSchema` / `outputSchema`, además de `produces` / `consumes` e `isoEvent`— vive en la entrada de tu tool en **`src/data/agents/tools.json`** (es el catálogo que consume el dashboard y la validación). Mantén ambos consistentes: `meta.consumes/produces` del handler deben coincidir con los de `tools.json` y con las reglas.

---

## 6. Pull vs Push vs In-process

Hay tres formas teóricas de que tu tool reciba eventos. En este proyecto **solo usamos la tercera**. Las otras dos están aquí para que entiendas el contraste.

### 6.1 Pull (no lo usamos)

La tool pregunta cada N segundos: `GET /api/v1/events?since_id=X`. Útil si la tool corre en otro servidor y procesa en lotes.

### 6.2 Push externo (webhook HTTP) — no lo usamos

La API hace `POST https://<tool>/run` cuando llega un evento que le interesa. Útil si la tool corre en otro servicio.

### 6.3 Push in-process — **lo que usamos**

La tool es una función dentro del mismo proceso Node. El bus la importa y la llama directamente cuando hay un evento que coincide con sus reglas. Sin red, sin auth, sin polling. Es lo más simple y lo más rápido (microsegundos).

```
evento llega ─► industrial_events ─► eventBus ─► toolRunner.runTool('mi_tool', evento)
                                                       │
                                                       ▼
                                             handler() de mi_tool
                                                       │
                                                       ▼
                                             return outputEvent
                                                       │
                                                       ▼
                                          se reinyecta como evento nuevo
```

**Implicación para ti como autor**: no piensas en redes, ni en endpoints, ni en auth. Solo escribes una función pura.

---

## 7. Regla de comunicación

Para que tu tool se ejecute automáticamente cuando entra cierto tipo de evento, debes registrar una regla en `src/data/agents/communication-rules.json`.

### 7.1 Formato de la regla

```json
{
  "id":               "rule-prod-014",
  "sourceToolId":     "production_metrics_collector",
  "targetToolId":     "detect_production_deviation",
  "event":            "PRODUCTION_METRICS_SNAPSHOT",
  "protocol":         "internal",
  "topic":            "tool/detect_production_deviation",
  "triggerCondition": "always",
  "description":      "Las métricas de producción alimentan al detector de desviación."
}
```

### 7.2 Campo por campo

| Campo | Qué va |
|---|---|
| `id` | `rule-<dominio>-<numero>`. Único. |
| `sourceToolId` | `module.id` de la tool que **emite** el evento. |
| `targetToolId` | `module.id` de la tool que **reacciona**. Es la tuya. |
| `event` | El `event.type` que dispara la regla. **Debe coincidir** con uno de los `produces` de la source y uno de los `consumes` de la target. |
| `protocol` | `internal` para push in-process (lo que usamos). Otros valores (`MQTT`, `HTTPS`, `REST`) son legacy del diseño anterior. |
| `topic` | Para `internal`, convención `tool/<targetToolId>`. |
| `triggerCondition` | `always` o una expresión JS evaluable sobre el evento. Ver § 7.3. |
| `description` | Una línea en español que explique el flujo. |

### 7.3 `triggerCondition`

Permite filtrar **cuándo** se dispara la regla, no solo por tipo.

| Ejemplo | Significado |
|---|---|
| `"always"` | Siempre que llegue el evento. |
| `"event.severity === 'critical'"` | Solo si la severidad es crítica. |
| `"data.deviation_pct > 10"` | Solo si la desviación pasa 10%. |
| `"data.autoApprove === true"` | Solo si el campo `autoApprove` del payload es true. |
| `"asset.plant_id === 'plant_01'"` | Solo eventos de la planta 1. |

La expresión recibe el evento completo como contexto. Lo que esté en el `event-standard.json` está disponible.

### 7.4 Patrones de comunicación válidos

**Fan-out** (una tool dispara varias):

```
production_metrics_collector ──► detect_production_deviation
                            └──► forecast_production_delays
                            └──► identify_bottlenecks
```

Se logra con tres reglas, una por destino. Las tres tienen el mismo `sourceToolId` y `event`.

**Fan-in** (varias tools alimentan una):

```
detect_production_deviation ──┐
forecast_production_delays  ──┼──► generate_maintenance_kpis
identify_bottlenecks        ──┘
```

Tres reglas con distinto `sourceToolId` y `event`, mismo `targetToolId`.

**Cadena**:

```
A ─► B ─► C ─► D
```

Cuatro reglas, una por par consecutivo. El `correlation_id` se propaga automático.

### 7.5 Lo que NO debes hacer en reglas

- Crear ciclos sin condición de corte: `A → B → A → B …` infinito. Si necesitas un loop, asegúrate que la `triggerCondition` corta eventualmente.
- Reglas duplicadas (mismo source, target y event).
- Apuntar a un `targetToolId` que no existe en `tools.json`.
- Mencionar un `event` que no aparece en los `produces` de la source.

---

## 8. Placeholder

Mientras tu lógica real no esté lista, **publica un placeholder funcional**. No dejes la tool sin existir; el sistema entero se ve mejor con 137 tools placeholder respondiendo coherente que con 5 reales y 132 desconectadas.

### 8.1 Estructura de un placeholder

```js
// src/tools/forecast_production_delays.js

export const meta = {
  id:       'forecast_production_delays',
  name:     'Forecast Production Delays',
  version:  '0.1.0-placeholder',
  consumes: ['PRODUCTION_METRICS_SNAPSHOT'],
  produces: ['PRODUCTION_DELAY_FORECASTED'],
  category: 'productivity',
  description: '[PLACEHOLDER] Pronostica retrasos de producción.',
};

export async function handler(inputEvent) {
  return {
    event: {
      type:     'PRODUCTION_DELAY_FORECASTED',
      category: 'productivity',
      severity: 'medium',
    },
    asset: inputEvent.asset,
    data: {
      forecast_delay_min: 45,
      confidence:         0.7,
      _placeholder:       true,
    },
  };
}
```

### 8.2 Reglas del placeholder

- `meta.version` empieza con `0.x.x-placeholder`.
- `meta.description` empieza con `[PLACEHOLDER]`.
- El campo `data._placeholder: true` está presente en cada salida, para que el dashboard y el reporte ISO puedan ocultarlos o marcarlos en modo demo.
- Los valores son **plausibles**: si la unidad es minutos, devuelve un número de minutos razonable. No `null`, no `0`, no `"TODO"`.

### 8.3 Cuándo reemplazas el placeholder

Cuando subes a `1.0.0`, quitas el `_placeholder`, quitas el `[PLACEHOLDER]` de la descripción. Nada más cambia. El contrato sigue idéntico, así que ninguna tool downstream necesita actualizarse.

---

## 9. Pruebas locales

### 9.1 Levantar el ambiente

```bash
docker compose --profile api up -d        # API + Postgres
npm run apikey:create my-tool -- --scopes=events:read,events:write
# guarda la API key que aparece en consola
```

### 9.2 Smoke test del handler

Crea `scripts/test_<tool_id>.js`:

```js
import { handler } from '../src/tools/detect_production_deviation.js';

const inputEvent = {
  event_id:  '01HG7Z9KQR5N3M2P4VX8YBWQTC',
  timestamp: '2026-05-19T14:32:10.123Z',
  module:    { id: 'production_metrics_collector', version: '1.0.0' },
  asset:     {
    asset_id:   'plant_01-assembly-line_2-robot_03',
    asset_type: 'robot',
    plant_id:   'plant_01',
    area_id:    'assembly',
    line_id:    'line_2',
  },
  event:     { type: 'PRODUCTION_METRICS_SNAPSHOT', category: 'productivity', severity: 'low' },
  data:      { planned: 100, actual: 82 },
};

const result = await handler(inputEvent);
console.log(JSON.stringify(result, null, 2));
```

Corre: `node scripts/test_detect_production_deviation.js`.

### 9.3 Test end-to-end (con el bus corriendo)

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: <tu-key>" \
  -d @sample-event.json
```

**La respuesta del POST ya trae la cadena** en el campo `chain`: cada elemento es una tool que el bus disparó, con `tool`, el `event` que produjo, `triggered_by` (la regla) y `data` (la salida de su handler). Ahí ves directo si tu tool corrió y qué emitió:

```json
{
  "status": "accepted",
  "triggered": 1,
  "chain": [
    { "tool": "detect_production_deviation", "event": "PRODUCTION_DEVIATION_DETECTED",
      "triggered_by": "rule-prod-014", "data": { "deviation_pct": -18 } }
  ]
}
```

Si `triggered: 0` y `chain: []`, tu tool **no** se disparó → revisa que (a) el `event.type` que mandaste coincide con el `event` de tu regla y (b) el `triggerCondition` se cumple con tus `data`.

### 9.4 Ver la cadena causal

```bash
curl "http://localhost:3000/api/v1/events/chain/01HG7Z9KQR5N3M2P4VX8YBWQTC" \
  -H "x-api-key: <tu-key>"
```

Devuelve todos los eventos de la cadena en orden.

---

## 10. Errores comunes

| Error | Causa | Cómo evitarlo |
|---|---|---|
| Tu tool nunca se ejecuta | Falta regla en `communication-rules.json` o el `event` no coincide con el `produces` de ninguna source | Verifica que existe una regla con tu `targetToolId` y el `event` exacto que esperas. |
| Evento rechazado al ingest | No cumple `event-standard.json` (falta campo, valor fuera del enum) | Corre el smoke test § 9.2; la salida es exactamente lo que el ingest valida. |
| `asset_id desconocido` | El activo no está en el catálogo de assets | Añádelo al catálogo o usa uno existente. No inventes ids. |
| Ciclo infinito | Tu tool emite un evento que vuelve a dispararla | Añade `triggerCondition` que corte, o no consumas el mismo `event.type` que produces. |
| Eventos duplicados | El productor reusa `event_id` en reintentos | El productor debe generar un `event_id` nuevo por intento *único*. El reintento sí usa el mismo id (eso es lo que da idempotencia). |
| Pierdes el `correlation_id` | Tu handler crea un evento manualmente sin dejar que el bus lo procese | Solo devuelve el objeto desde el handler. El bus rellena `correlation_id` y `causation_id`. |
| Severidad inconsistente | Uno usa `'CRITICAL'`, otro `'critical'` | Solo `low` / `medium` / `high` / `critical`. Minúsculas. |
| Unidad ambigua | `data.temperature: 75` (¿F? ¿C?) | Renombra a `temperature_c` o `temperature_f`. |

---

## 11. Checklist antes de mergear

Antes de abrir el PR, recorre esta lista. Si algo está en rojo, no se mergea.

### Código

- [ ] Archivo en `src/tools/<tool_id>.js`.
- [ ] El nombre del archivo coincide exacto con `meta.id`.
- [ ] Exporta `meta` y `handler` (ambos).
- [ ] `meta.consumes` y `meta.produces` listados completos.
- [ ] `handler` es `async`, recibe un solo argumento `inputEvent`, devuelve objeto / array / `null`.
- [ ] Sin `import` de otros archivos en `src/tools/`. Solo de `src/services/` o utilidades.
- [ ] Sin llamadas HTTP, sin escrituras a DB, sin `console.log` en producción (usa el logger central).

### Datos

- [ ] `tools.json` actualizado con la entry de tu tool (id, name, category, descriptionEs/En, inputSchema, outputSchema, **`produces`**, **`consumes`**, **`isoEvent`**).
- [ ] El `outputSchema` de tu tool incluye **todos los campos** que la(s) tool(s) downstream marcan como `required` (y los que lee su `triggerCondition`), para que tu salida **encaje** con la entrada de la siguiente. Verifícalo con `node scripts/align_tools_schemas.js` (dry-run): debe reportar `Huecos restantes: 0`.
- [ ] `communication-rules.json` tiene al menos una regla con tu tool como `targetToolId` (a menos que sea una tool de entrada manual).
- [ ] Si tu tool produce un `event.type` nuevo, está documentado en `event-standard.json`.
- [ ] Si tu tool aplica a un estándar ISO, está mapeada en `src/services/isoMappingService.js`.

### Pruebas

- [ ] `scripts/test_<tool_id>.js` corre y produce salida válida.
- [ ] Smoke test end-to-end vía `curl` muestra el evento de respuesta con `correlation_id` correcto.
- [ ] Dashboard `/dashboard` muestra el evento.
- [ ] Reporte `/audit-report` lo agrega a la norma correspondiente (si aplica).

### Documentación

- [ ] `meta.description` en español, una sola línea, clara.
- [ ] Si es placeholder, lleva `[PLACEHOLDER]` y `version` `0.x.x-placeholder`.

---

## Apéndice — Tabla resumen de campos del evento

| Campo | Tipo | Formato | Lo pone | Ejemplo |
|---|---|---|---|---|
| `event_id` | string | ULID o UUIDv4 | productor | `01HG7Z9KQR5N3M2P4VX8YBWQTC` |
| `timestamp` | string | ISO 8601 UTC | productor | `2026-05-19T14:32:10.123Z` |
| `received_at` | string | ISO 8601 UTC | API | `2026-05-19T14:32:10.567Z` |
| `platform_version` | string | semver | productor | `"2.0"` |
| `module.id` | string | snake_case | productor | `detect_production_deviation` |
| `module.version` | string | semver | productor | `"1.0.0"` |
| `asset.asset_id` | string | jerárquico con guiones | productor | `plant_01-assembly-line_2-robot_03` |
| `asset.asset_type` | string | enum | productor | `robot` |
| `asset.plant_id` | string | snake_case | productor | `plant_01` |
| `asset.area_id` | string | snake_case | productor | `assembly` |
| `asset.line_id` | string | snake_case | productor | `line_2` |
| `event.type` | string | `SCREAMING_SNAKE_CASE` | productor | `PRODUCTION_DEVIATION_DETECTED` |
| `event.category` | string | enum (7 valores) | productor | `productivity` |
| `event.severity` | string | enum (4 valores) | productor | `high` |
| `data` | object | flexible, snake_case | productor | `{ deviation_pct: 12.5 }` |
| `metadata` | object | opcional | productor | `{ shift: 'B' }` |
| `correlation_id` | string | ULID/UUID | productor o bus | `01HG7Z9KQR5N3M2P4VX8YBWQTC` |
| `causation_id` | string | ULID/UUID | bus | `01HG7Z9KQR5N3M2P4VX8YBWQXX` |

---

**Versión de esta guía:** 1.0
**Última actualización:** 2026-05-19
**Para preguntas:** abre un issue o pinga al maintainer del proyecto.

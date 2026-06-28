# Paso 4 — Nombrado según el Estándar de Eventos Industriales (IES)

> [⬅ Volver al roadmap](../README.md)

## Qué vas a lograr en este paso

Aprender **las reglas duras** de cómo se nombran los eventos, activos, módulos y categorías en este sistema. Estas reglas evitan que el sistema se vuelva ingobernable conforme se agregan tools. **Léelas dos veces.**

Al terminar el paso vas a saber, para cualquier campo del evento, exactamente qué valor poner y en qué formato.

> 📥 **Plantilla descargable**: [`event-example.json`](../plantillas/event-example.json) — evento completo de referencia.

---

## ⚠️ Estado actual vs estándar target — léelo antes de seguir

Las reglas de este paso son el **estándar al que apuntamos**, no las que el sistema enforza hoy:

| Lo que el doc prescribe | Lo que el validador (`src/services/validationService.js`) hace hoy |
|---|---|
| Enums de `event.category` y `event.severity` cerrados | Ambos validados como `string, nullable` — acepta cualquier valor o nada |
| `event.type` en `SCREAMING_SNAKE_CASE` (`MEASUREMENTS_CAPTURED`) | Solo valida `string` — acepta `alert`, `DefectFound`, lo que sea |
| `asset_id` con patrón jerárquico `plant_X-area-line_Y-type_NN` | Solo `TEXT NOT NULL` en DB; acepta `robot-01` |
| `correlation_id` y `causation_id` con reglas de cadena | **No existen columnas en `industrial_events`** — no se almacenan |

Prueba: el `sample-event.json` del repo usa `"type":"ALERT"`, `"category":"QUALITY"`, `"severity":"HIGH"` (todo mayúsculas, valores fuera del enum) y **pasa la validación sin error**.

**Implicación para ti**: si emites un evento que viola las reglas de este paso, la API lo va a aceptar y guardar. **No vas a recibir 400.** Pero el dashboard, los reportes ISO y las consultas agregadas se van a romper en silencio o van a devolver basura. Sigue el estándar aunque el validador no te frene — la § final del paso ("Para hacer obligatorio esto") tiene la propuesta para endurecer el validador.

---

## 4.1 Anatomía de un evento — la estructura base obligatoria

El contrato lo define `src/data/agents/event-standard.json`. Esto es lo que tu handler debe **respetar al devolver** un evento, y lo que debe **esperar al recibir** uno:

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

### Qué pone quién

| Campo | Lo pone | Notas |
|---|---|---|
| `event_id` | El productor | UUID v4 o ULID. Único global. Constraint UNIQUE. |
| `timestamp` | El productor | ISO 8601 UTC. Momento del hecho, no de ingesta. |
| `received_at` | La API | Cuando entró al sistema. Se añade automático. |
| `platform_version` | El productor | "2.0" hoy. |
| `module` | El productor | Quién emite. `id` debe coincidir con un `tool_id` válido. |
| `asset` | El productor | Activo afectado. `asset_id` debe existir en el catálogo. |
| `event.type` | El productor | El tipo de evento — ver § 4.3. |
| `event.category` | El productor | Una de: `quality`, `productivity`, `maintenance`, `energy`, `safety`, `configuration`, `system`. |
| `event.severity` | El productor | Una de: `low`, `medium`, `high`, `critical`. |
| `data` | El productor | Payload específico. Estructura flexible pero documentada. |
| `metadata` | El productor (opcional) | Contexto no crítico: shift, operador, batch. |
| `correlation_id` | El productor o el bus | Raíz de la cadena causal. Ver § 4.2. |
| `causation_id` | El productor o el bus | Padre inmediato. Ver § 4.2. |

---

## 4.2 Reglas de `correlation_id` y `causation_id`

> 🚧 **No implementado todavía.** Esta sección describe el estándar target. Hoy `db/init.sql` **no tiene columnas `correlation_id` ni `causation_id`** en `industrial_events`, así que aunque los emitas, **no se guardan**. Antes de que esto sea útil, hay que migrar el schema y modificar el ingest para aceptarlos y persistirlos. Ver § final del paso.

Cuando se implemente, así funcionará:

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

## 4.3 `event.type` — la regla más importante de todo el estándar

Formato: **`SCREAMING_SNAKE_CASE`** — todo en MAYÚSCULAS con guion bajo. Describe **qué pasó**, con el resultado en pasado: `..._CAPTURED`, `..._DETECTED`, `..._UPDATED`, `..._ISSUED`, `..._GENERATED`.

> ⚠️ El `event.type` **NO** lleva dominio ni puntos, y **NO** va en minúsculas. Es un nombre plano en MAYÚSCULAS, único en todo el sistema (ej. `MEASUREMENTS_CAPTURED`, `CHART_POINTS_UPDATED`). El "dominio" vive aparte, en el campo **`category`** de la tool — no dentro del `event.type`.
>
> **Regla de oro:** el `event.type` que tu tool produce debe coincidir **carácter por carácter** con el campo `event` de la regla en `communication-rules.json` y con el `consumes` de la tool que reacciona. Si difiere en una letra, tu tool nunca se dispara.

### Categorías válidas (campo `category`, **no** parte del `event.type`)

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

### ✅ Ejemplos correctos

```
SENSOR_VIBRATION_MEASURED
ISO_10816_ALARM_TRIGGERED
DEFECT_FOUND
MAINT_WORKORDER_CREATED
MAINT_WORKORDER_CLOSED
PRODUCTION_DEVIATION_DETECTED
ENERGY_CONSUMPTION_EXCEEDED
SAFETY_ZONE_VIOLATION_DETECTED
AUDIT_REPORT_GENERATED
```

### ❌ Ejemplos incorrectos — no hagas esto

| Mal | Por qué |
|---|---|
| `DefectFound` | CamelCase. Usa `DEFECT_FOUND`. |
| `defect_found` | Minúsculas. Va en MAYÚSCULAS. |
| `quality.defect.found` | Sin puntos ni dominio; el dominio va en `category`. |
| `MEASUREMENTS CAPTURED` | Sin espacios. Usa guion bajo. |
| `getChartPoints` | Nombra un hecho ocurrido, no una acción a ejecutar. |

---

## 4.4 `asset_id`

> Validador hoy: solo `TEXT NOT NULL`. El patrón a continuación es la regla de equipo, no la del schema. Si emites `robot-01` la API lo acepta — pero `JOIN` con catálogos y reportes ISO van a fallar.

Formato: `<plant_id>-<area_id>-<line_id>-<asset_type>_<numero>`. Todo en `snake_case` o números, separado por **guiones** a nivel de jerarquía y **guion bajo** para el sufijo numérico.

```
plant_01-assembly-line_2-robot_03
plant_01-compressors-line_1-pump_01
plant_03-warehouse-zone_a-sensor_07
```

**Estable de por vida.** Si renombras, pierdes el histórico. Si reemplazas el equipo físico, mismo `asset_id` (es la *posición* en la planta); el equipo físico va en `metadata.serial_number`.

Debe existir en la tabla `assets` (o en `src/data/assets.json` si lo manejamos como catálogo). **La API rechaza eventos con `asset_id` desconocido.**

Nunca uses nombres humanos como id: "Motor del compresor grande" va en `assets.display_name`, **no en el id**.

---

## 4.5 `module.id` (a.k.a. `tool_id`)

Formato: `snake_case`, una sola palabra compuesta, sin guiones intermedios.

```
get_inventory_status
predict_demand
optimize_stock_levels
detect_production_deviation
iso_10816_engine
```

Reglas:

- **Coincide exacto con el `id` de la tool** en `src/data/agents/tools.json`.
- **Coincide con el nombre del archivo**: `src/tools/<module.id>.js`.
- **Una tool, un id**: si corre en 3 réplicas, sigue siendo el mismo id.
- **No metas la versión en el nombre**: nada de `predict_demand_v2`. La versión va en `module.version`.

---

## 4.6 `module.version`

Formato SemVer `MAJOR.MINOR.PATCH` como string: `"1.2.0"`.

Sube `MAJOR` cuando el **contrato de salida cambia** (campos en `data` se renombran o cambian de tipo).

---

## 4.7 `event.category` y `event.severity`

**Enum cerrado por diseño.** No inventes valores nuevos sin agregar al `event-standard.json`.

> Validador hoy: ambos campos son `string, nullable` en Ajv — acepta cualquier valor o nada. Los enums viven solo en `event-standard.json` como documentación. Tu evento con `category: "PIZZA"` pasa la validación. **Síguelos igual** porque el dashboard y los filtros del front asumen estos valores.

- `category`: `quality` | `productivity` | `maintenance` | `energy` | `safety` | `configuration` | `system`
- `severity`: `low` | `medium` | `high` | `critical`

### Cuándo usar cada severidad

| Severidad | Cuándo |
|---|---|
| `low` | Información o advertencia menor. No requiere acción. |
| `medium` | Desviación notable. Revisar en el turno. |
| `high` | Anomalía clara. Acción dentro de la hora. |
| `critical` | Riesgo inmediato. Acción **ahora**. Para línea / dispara protocolo de seguridad. |

---

## 4.8 Dentro de `data`

- **JSON plano.** Máximo 2 niveles de anidación. Las consultas Postgres se vuelven dolorosas con `data->a->b->c->d`.
- **Unidades en el nombre del campo**: `temperature_c`, `vibration_mm_s`, `pressure_bar`, `duration_ms`, `cost_usd`. Esto elimina el clásico "¿esto eran °F o °C?".
- **`snake_case`** en todas las claves.
- **No repitas IDs**: si ya está en `asset.asset_id` arriba, no lo pongas también en `data`.
- **Sin JSON serializado**: nada de `"data": { "payload": "{\"x\":1}" }`. JSON nativo siempre.

---

## 4.9 `event_id` y `correlation_id`

- Formato **ULID** recomendado (ordenable por tiempo, ej. `01HG7Z9KQR5N3M2P4VX8YBWQTC`).
- UUID v4 también válido si tu tool ya genera UUIDs.
- **Nunca lo reutilices**, nunca lo modifiques una vez emitido.

---

## 4.10 Para hacer obligatorio este estándar (PR pendiente)

Este paso describe el target, pero el validador y el schema en producción aún no lo enforzan. Si quieres cerrar la brecha, este es el PR mínimo en `IsoTools`:

### `src/services/validationService.js`

Reemplazar el bloque `event` del `eventSchema` por:

```js
event: {
  type: 'object',
  required: ['type', 'category', 'severity'],
  properties: {
    type: {
      type: 'string',
      pattern: '^[a-z]+(\\.[a-z0-9_]+){2,}$'  // EVENTO_EN_MAYUSCULAS[.subaccion]
    },
    category: {
      type: 'string',
      enum: ['quality', 'productivity', 'maintenance', 'energy',
             'safety', 'configuration', 'system']
    },
    severity: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical']
    }
  },
  additionalProperties: false
}
```

### `db/init.sql`

Agregar columnas para la cadena causal:

```sql
ALTER TABLE industrial_events
  ADD COLUMN IF NOT EXISTS correlation_id TEXT,
  ADD COLUMN IF NOT EXISTS causation_id TEXT;

CREATE INDEX IF NOT EXISTS idx_industrial_events_correlation_id
  ON industrial_events (correlation_id);
```

Y en `src/controllers/eventsController.js` (o donde se inserta), mapear esos campos del payload a las columnas.

### `sample-event.json`

Actualizar para que cumpla el estándar:

```json
{
  "event": {
    "type": "DEFECT_FOUND",
    "category": "quality",
    "severity": "high"
  }
}
```

### Riesgo

Endurecer el validador rechaza eventos previos que ya hayan entrado con `type: "ALERT"` o `severity: "HIGH"`. Antes de mergear: correr una query para ver cuántos eventos viven en la DB con valores fuera del enum y decidir si toleramos un período de transición.

---

## Archivos descargables

- 📥 [`event-example.json`](../plantillas/event-example.json) — Evento completo con todos los campos, para usar como referencia o como base de tus pruebas.

---

## Siguiente paso

→ [Paso 5: Anatomía de una tool (handler + meta)](./05-anatomia-tool.md)

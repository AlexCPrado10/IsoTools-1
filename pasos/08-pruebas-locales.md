# Paso 8 — Probar localmente tu tool

> [⬅ Volver al roadmap](../README.md)

## Qué vas a lograr en este paso

Verificar tu tool en tres niveles: (1) que el handler funciona aislado, (2) que el sistema completo la dispara correctamente vía el bus, y (3) que la cadena causal se propaga con `correlation_id`. Sin esto, no abras un PR.

> 📥 **Plantilla descargable**: [`smoke-test.js`](../plantillas/smoke-test.js) — Script de smoke test listo para adaptar.

---

## ✅ Estado actual — el flujo end-to-end YA funciona

| Capacidad | Estado |
|---|---|
| Smoke test aislado importando de `src/tools/<id>.js` | ✅ Funciona (hay 16 tools de referencia). |
| `POST /api/v1/events` dispara el bus y devuelve la cadena | ✅ La respuesta incluye `chain` con todo lo que reaccionó. |
| `GET /api/v1/events/chain/:correlationId` | ✅ Existe y devuelve la cadena causal en orden. |
| Columnas `correlation_id` / `causation_id` | ✅ Existen en `industrial_events`. |
| Simulación de un clic | ✅ `npm run sim:iso` (o `node scripts/test_package_iso.js <escenario>`). |
| `GET /api/v1/events?since_id=0` | ❌ No existe `since_id`. El listado por fecha usa `start`/`end` ISO. La forma fácil de ver una cadena es `/chain/:correlationId`. |
| Worker asíncrono / `events_dlq` | 🚧 El bus corre **síncrono** dentro del POST; errores van en la respuesta y al log, no a una DLQ. |

> Guía completa con Postman: `docs/SIMULACION_PASO_A_PASO.md`.

---

## 8.1 Levantar el ambiente local

```bash
docker compose --profile api up -d        # Levanta API + Postgres
docker compose exec api npm run apikey:create -- my-tool --scopes=events:read,events:write
# Guarda la API key que aparece en consola (solo se muestra una vez)
```

> ⚠️ El proceso exacto depende de cómo tengan deployada la API central. Ver [Paso 2: Crear la API central](./02-api-central.md) para opciones de deploy.

---

## 8.2 Smoke test del handler (aislado, sin bus)

Crea `scripts/test_<tool_id>.js`:

```js
import { handler } from '../src/tools/compare_planned_vs_actual.js';

const inputEvent = {
  event_id:  '01HG7Z9KQR5N3M2P4VX8YBWQTC',
  timestamp: '2026-05-19T14:32:10.123Z',
  module:    { id: 'mgmt_collector', version: '1.0.0' },
  asset:     {
    asset_id:   'plant_01',
    asset_type: 'plc',
    plant_id:   'plant_01',
  },
  event:     { type: 'KPI_REPORT_GENERATED', category: 'system', severity: 'low' },
  data:      { planned: 1000, actual: 875, module: 'production' },
};

const result = await handler(inputEvent);
console.log(JSON.stringify(result, null, 2));
```

Corre:

```bash
node scripts/test_compare_planned_vs_actual.js
```

Verifica que el output:
- Tiene `event`, `asset`, `data`.
- El `event.type` está entre tus `produces`.
- Los valores del `data` son numéricamente correctos.

---

## 8.3 Test end-to-end (con el bus corriendo)

Manda un evento y **la respuesta misma trae la cadena** que disparó:

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: <tu-key>" \
  -d @sample-event.json
```

Respuesta (201) — fíjate en `triggered` y `chain`:

```json
{
  "status": "accepted",
  "event_id": "…",
  "correlation_id": "17acaa26-…",
  "triggered": 5,
  "chain": [
    { "tool": "calculate_control_charts",      "event": "CHART_POINTS_UPDATED",    "triggered_by": "rule-qual-001" },
    { "tool": "detect_out_of_control_signals",  "event": "OUT_OF_CONTROL_DETECTED", "triggered_by": "rule-qual-002" },
    { "tool": "manage_nonconformances",         "event": "NC_REQUIRES_8D",          "triggered_by": "rule-qual-003" },
    { "tool": "generate_8d_report",             "event": "8D_REPORT_ISSUED",        "triggered_by": "rule-qual-004" },
    { "tool": "automate_followups",             "event": "FOLLOWUP_SCHEDULED",      "triggered_by": "rule-pkg-003" }
  ]
}
```

La forma más rápida de provocar una cadena de ejemplo:

```bash
export API_BASE_URL=http://localhost:3000
export API_KEY=<tu-key>
npm run sim:iso                              # cadena larga SPC
node scripts/test_package_iso.js defect      # cadena de defecto
node scripts/test_package_iso.js variance    # cadena de dirección/KPIs
```

---

## 8.4 Ver la cadena causal completa

✅ **Ya implementado.** Con el `correlation_id` que te devolvió el POST:

```bash
curl "http://localhost:3000/api/v1/events/chain/<correlation_id>" \
  -H "x-api-key: <tu-key>"
```

Devuelve **todos** los eventos de la cadena en orden, cada uno con su `causation_id`
(qué evento lo disparó). Útil para verificar fan-out, fan-in y cadenas largas.

---

## 8.5 Qué hacer si tu tool no se dispara

La sección 8.2 (smoke aislado) verifica el handler solo; lo de abajo es para cuando el bus no la encadena. Revisa, en este orden:

1. ¿Tu archivo existe en `src/tools/<tu_tool_id>.js` y exporta `meta` + `handler`?
2. ¿La importaste y la agregaste al array `TOOLS` en `src/tools/index.js`? (Si no, el bus no la encuentra y la ignora.)
3. ¿Hay una regla en `communication-rules.json` con `targetToolId` = tu `id`?
4. ¿El `event` de esa regla coincide **exacto** (UPPER_SNAKE) con el `event.type` del evento que llega y con tu `meta.consumes`?
5. ¿El `triggerCondition` se cumple? (Si es `"always"`, sí. Si es expresión, evalúala con el `data` del evento — usa nombres de campo pelados, ver paso 6 § 6.3.)
6. ¿La tool anterior realmente **emitió** (no devolvió `null`)? Mira el `chain` en la respuesta del POST.

Si todo lo anterior pasa y aún no se dispara, revisa los logs del worker del bus.

---

## Archivos descargables

- 📥 [`smoke-test.js`](../plantillas/smoke-test.js) — Script base para tus pruebas del handler.

---

## Siguiente paso

→ [Paso 9: Checklist antes de mergear](./09-checklist-merge.md)

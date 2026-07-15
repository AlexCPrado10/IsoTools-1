# README para programadores — vía rápida

Guía corta y **explícita** para conectar tu tool a la plataforma de eventos. Sigue los pasos **en orden**, de arriba hacia abajo. Si es tu primer día, esto es lo único que necesitas leer para empezar; los detalles finos están en [`pasos/`](./pasos/) y en el [Manual de integración del `README.md`](./README.md#manual-de-integración-publicar-y-consumir-eventos).

> **Modelo mental:** la plataforma es un **broker de eventos** ya desplegado. Tu tool solo habla con la plataforma por HTTP (nunca con otra tool). **Publicas** con `POST` y **consumes** con `GET` haciendo *polling* (tú preguntas cada N segundos; no hay push ni webhooks).

---

## 🌐 URL base (memorízala)

```
https://isotools-production.up.railway.app/api/v1
```

Todas las rutas de este documento cuelgan de ahí. Ejemplo: el health es
`https://isotools-production.up.railway.app/api/v1/health`.

---

## Paso 0 — Consigue tu API key (esto es LO PRIMERO)

**Antes de escribir una sola línea de código**, necesitas una API key. Sin ella, todo `POST`/`GET` de eventos responde `401`.

1. **Genera tú mismo un secreto aleatorio.** Cualquiera de estos sirve:
   ```bash
   openssl rand -hex 24        # recomendado
   # o
   uuidgen
   ```
   Guárdalo como un secreto: es TU key y no se vuelve a mostrar.

2. **Pásale al admin (Carlos) dos datos:**
   - el **valor** de la key que generaste, y
   - el **nombre de tu tool** (el *label*, ej. `tool-vision`).

3. **El admin la registra** en Railway → servicio **IsoTools** → **Variables**:
   ```
   BOOTSTRAP_API_KEY        = <la key que generaste>
   BOOTSTRAP_API_KEY_LABEL  = <el nombre de tu tool, ej. tool-vision>
   BOOTSTRAP_API_KEY_SCOPES = events:read,events:write   # opcional
   ```
   Al redesplegar, la plataforma inserta tu key (hasheada, nunca se imprime en logs). Es idempotente: si ya existía, no pasa nada. Después el admin **quita** `BOOTSTRAP_API_KEY` por seguridad.

4. Listo: ya puedes usar tu key en el header **`x-api-key`**.

> **Scopes:** `events:write` para publicar, `events:read` para consumir. Si tu tool hace ambas (lo normal), pide `events:read,events:write`. El catálogo y el health son abiertos (no piden key).

---

## Paso 1 — Configura tu entorno

En tu tool (cualquier lenguaje/stack), define dos variables:

```bash
export CORE_BASE_URL="https://isotools-production.up.railway.app/api/v1"
export API_KEY="<tu-key-del-paso-0>"
```

> La key **jamás** va en el frontend ni se commitea. Vive en tu servidor / en variables de entorno. Añade `.env*` a tu `.gitignore`.

---

## Paso 2 — Verifica que estás conectado

```bash
curl "$CORE_BASE_URL/health"    # -> {"status":"ok"}     (el proceso responde)
curl "$CORE_BASE_URL/ready"     # -> {"status":"ready"}  (además hay base de datos)
```

Si `/health` responde pero un `POST` te da `401`, revisa el header `x-api-key` (no `Authorization`) y que la key no tenga saltos de línea.

---

## Paso 3 — Publica tu primer evento

```bash
curl -X POST "$CORE_BASE_URL/events" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d @sample-event.json
```

- El payload debe cumplir el **Industrial Event Standard (IES)**. El contrato exacto (todos los campos requeridos y su forma) está en el [Manual de integración](./README.md#3-el-payload-de-entrada-el-sobre-ies) y en `src/data/agents/event-standard.json`. Hay un ejemplo listo en [`sample-event.json`](./sample-event.json).
- **Es idempotente:** si reintentas con el mismo `event_id`, no se duplica ni se re-dispara la cadena → responde `200 status:"duplicate"`. Un evento nuevo responde `201 status:"accepted"`.

---

## Paso 4 — Consume eventos (elige el patrón correcto)

Todas las lecturas piden `x-api-key` con scope `events:read`.

### 4.1 Consumo incremental continuo → **cursor `since_seq`** (el patrón por defecto)

```bash
# Primer tick: arranca en 0
curl -H "x-api-key: $API_KEY" \
  "$CORE_BASE_URL/events?since_seq=0&type=CALIBRATION_FAILED"

# La respuesta trae next_seq. Guárdalo y úsalo en el siguiente tick:
curl -H "x-api-key: $API_KEY" \
  "$CORE_BASE_URL/events?since_seq=<next_seq>&type=CALIBRATION_FAILED"
```

Devuelve solo `seq > since_seq` en orden ascendente: **no hay solapes ni necesitas deduplicar.** `next_seq` es tu cursor entre ticks.

### 4.2 "Solo la última data por tipo" → **`/events/latest`** (poll barato con ETag)

```bash
curl -H "x-api-key: $API_KEY" -H 'If-None-Match: W/"42"' \
  "$CORE_BASE_URL/events/latest?type=CALIBRATION_FAILED"
```

Devuelve el evento más reciente por cada `type`. Reenvía el `ETag` que recibiste en `If-None-Match`: si nada cambió, responde `304` (cuerpo vacío, ahorra ancho de banda en el poll).

### 4.3 "Lo que MI tool consume" → **`/events/subscriptions/:toolId`**

```bash
curl -H "x-api-key: $API_KEY" \
  "$CORE_BASE_URL/events/subscriptions/manage_nonconformances?since_seq=0"
```

Entrega solo los tipos que tu tool declara consumir en `tools.json`. **No necesitas saber quién produce.** También usa cursor (`since_seq`/`next_seq`).

### 4.4 Trazabilidad → **`/events/chain/:correlationId`**

```bash
curl -H "x-api-key: $API_KEY" "$CORE_BASE_URL/events/chain/<correlation_id>"
```

Cadena causal completa en orden cronológico (evidencia ISO).

### 4.5 Descubrir el contrato → **`/catalog`** (sin API key)

```bash
curl "$CORE_BASE_URL/catalog/event-standard"
curl "$CORE_BASE_URL/catalog/events"
curl "$CORE_BASE_URL/catalog/tools/manage_nonconformances"
```

---

## Paso 5 — Si además vas a escribir un handler DENTRO de este repo

Si tu tool no es un servicio externo sino un handler que vive en `src/tools/`, sigue el roadmap completo en [`pasos/`](./pasos/) (1 → 10). Resumen de lo que te toca:

1. Declara qué consume/produce tu tool en `src/data/agents/tools.json`.
2. Crea `src/tools/<tu_tool_id>.js` (exporta `meta` + `handler`) y regístralo en `src/tools/index.js`.
3. Registra la regla en `communication-rules.json` que conecta otros eventos con tu tool.
4. Prueba (paso 8) y pasa el checklist (paso 9).

---

## Tabla de endpoints

| Método | Ruta (bajo la URL base) | Scope | Qué hace |
|--------|-------------------------|-------|----------|
| `POST` | `/events` | `events:write` | Publica (idempotente por `event_id`). |
| `GET`  | `/events?since_seq=N` | `events:read` | Consumo incremental por cursor (**recomendado**). |
| `GET`  | `/events?start=&end=` | `events:read` | Rango por fecha (ISO), modo compat. |
| `GET`  | `/events/latest?type=` | `events:read` | Última data por tipo (cache + ETag/304). |
| `GET`  | `/events/subscriptions/:toolId` | `events:read` | Solo los tipos que esa tool consume. |
| `GET`  | `/events/chain/:correlationId` | `events:read` | Cadena causal de un `correlation_id`. |
| `GET`  | `/catalog/*` | — (abierto) | Contrato público: standard, eventos, tools. |
| `GET`  | `/health` · `/ready` | — (abierto) | Liveness · readiness. |

**Filtros de `GET /events`** (server-side, evitan descargar de más): `type` (repetido `?type=A&type=B` o CSV `?type=A,B`), `module_id`, `asset_id`, `category`, `severity`, `limit`.

---

## Errores comunes

| Código | Significa | Qué haces |
|--------|-----------|-----------|
| `401` | Falta o está mal la API key | Revisa el header `x-api-key` (no `Authorization`), sin saltos de línea. |
| `403` | Tu key no tiene el scope | Pide al admin registrar la key con `events:read` y/o `events:write`. |
| `429` | Rate limit excedido (poll muy agresivo) | Respeta el header `Retry-After`; baja la frecuencia y apóyate en el `ETag` de `/latest`. |
| `400` | Payload no cumple el IES | Compara contra `/catalog/event-standard` y el [Manual](./README.md#3-el-payload-de-entrada-el-sobre-ies). |

---

## A dónde seguir

- **Contrato completo (payloads, ejemplos, código de un consumidor):** [Manual de integración en `README.md`](./README.md#manual-de-integración-publicar-y-consumir-eventos).
- **Roadmap para escribir una tool en el repo:** [`pasos/`](./pasos/) (1 → 10).
- **Qué hace cada tool y con quién habla:** cerebro Obsidian en [`cerebro/`](./cerebro/).

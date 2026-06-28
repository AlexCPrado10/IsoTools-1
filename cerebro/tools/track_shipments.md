---
tipo: tool
id: track_shipments
nombre: "Rastrear Envíos"
categoria: supply-chain
agente: cadena-suministro
estado: catalogo
consume: []
produce: [SHIPMENT_DELAYED]
programador:
actualizado: 2026-06-28
tags: [tool, supply-chain, catalogo]
---
# Rastrear Envíos
> `track_shipments` · Cloud · categoría **supply-chain** · estado **catalogo**
> Pertenece al agente [[../agentes/cadena-suministro|Agente de Cadena de Suministro]]
## Qué hace
Rastreo en tiempo real de envíos multimodales (terrestre, aéreo, marítimo) con ETA dinámica y alertas de retraso.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `SHIPMENT_DELAYED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `shipmentIds` como array para consolidar el seguimiento de múltiples envíos en una sola consulta, esencial cuando se coordinan varios transportistas simultáneamente. `transportMode` permite seleccionar las APIs de trazabilidad correctas: terrestre usa GPS del transportista o plataformas como Samsara, aéreo usa IATA y códigos de guía aérea, marítimo usa AIS (Automatic Identification System) e integración con operadores portuarios. `includeETA` activa el cálculo de la fecha estimada de llegada dinámica basada en la posición actual y velocidad promedio histórica del modo de transporte.

**Cálculos:** Consultar la API del proveedor de trazabilidad (GPS/AIS/IATA) para cada `shipmentId`. Obtener la posición actual, hito de ruta más reciente y status del transporte. Calcular `etaDate` dinámicamente: para terrestre, distancia_restante / velocidad_promedio_histórica_de_esa_ruta; para marítimo, distancia_a_puerto / velocidad_actual_AIS. `delayDays` = max(0, (etaDate - fechaEntregaComprometida) en días). Generar `alerts` por condiciones: retraso > 0 días, evento de excepción (detención inesperada > 4 horas, temperatura fuera de rango para carga refrigerada), documentación aduanal pendiente.

**Por qué estos outputs:** `status` y `currentLocation` por envío permiten al agente comunicar proactivamente al cliente antes de que pregunte por su pedido. `etaDate` dinámica es más confiable que la fecha estática del manifesto para planear la recepción en almacén. `delayDays` activa automáticamente la gestión de excepción: si > 0, el agente busca alternativas o notifica al cliente. `alerts` permiten al agente escalar solo los envíos con problemas reales.

**Sugerencia de UI:** Mapa en tiempo real con iconos de camión/barco/avión mostrando la posición actual de cada envío. Lista de envíos con semáforo de puntualidad (verde=en tiempo, amarillo=en riesgo, rojo=retrasado). Panel de detalle con historial de hitos del envío seleccionado. Filtros por modo de transporte y estado. Alerta emergente para envíos con excepciones.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/track_shipments__predict_supply_disruptions]] — `SHIPMENT_DELAYED` → [[predict_supply_disruptions]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

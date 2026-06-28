---
tipo: tool
id: predict_supply_disruptions
nombre: "Predecir Disrupciones de Suministro"
categoria: supply-chain
agente: cadena-suministro
estado: catalogo
consume: [SHIPMENT_DELAYED]
produce: [DISRUPTION_RISK_HIGH]
programador:
actualizado: 2026-06-28
tags: [tool, supply-chain, catalogo]
---
# Predecir Disrupciones de Suministro
> `predict_supply_disruptions` · Cloud · categoría **supply-chain** · estado **catalogo**
> Pertenece al agente [[../agentes/cadena-suministro|Agente de Cadena de Suministro]]
## Qué hace
Analiza señales de riesgo (clima, geopolítica, capacidad de proveedores) para predecir disrupciones y activar planes de contingencia.
## Contrato de eventos
- **Consume:** `SHIPMENT_DELAYED`
- **Produce:** `DISRUPTION_RISK_HIGH`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `supplierId` para identificar al proveedor específico y acceder a su historial de entregas, incidentes previos y ubicación geográfica de sus plantas. `materialIds` permite filtrar el análisis a los materiales críticos que se compran a ese proveedor (no todos los materiales tienen el mismo impacto de ruptura en la producción). `horizonDays` (default 30) define la ventana de predicción: 30 días es relevante para la gestión operativa, mientras que análisis estratégicos pueden requerir 90-180 días.

**Cálculos:** Agregar señales de riesgo del proveedor: historial de entregas (OTIF reciente), noticias de disrupciones en su región geográfica (API de noticias o alertas de riesgo geopolítico), capacidad de producción reportada, alertas climáticas en su ubicación (API meteorológica). Ponderar los factores: OTIF < 85% (40% del score de riesgo), eventos climáticos en la zona del proveedor (20%), noticias de problemas laborales/financieros (20%), tiempo sin incidente previo (20%). Escalar `disruptionRisk` según score: < 25 → low, 25-50 → medium, 50-75 → high, > 75 → critical. `estimatedImpactDays` = días de inventario disponible del material si la entrega se detiene. `alternativeSuppliers` desde la base de datos de proveedores homologados para esos materialIds.

**Por qué estos outputs:** `disruptionRisk` permite al agente priorizar qué proveedores requieren atención proactiva. `riskFactors` explica al comprador el motivo del riesgo para que pueda validar o refutar la predicción. `estimatedImpactDays` traduce el riesgo abstracto a días de parada de producción, el argumento más contundente para activar planes de contingencia. `contingencyRecommendations` y `alternativeSuppliers` son los planes de acción accionables.

**Sugerencia de UI:** Mapa de calor de riesgo de proveedores (tabla con proveedores en filas y categorías de riesgo en columnas). Tarjeta de proveedor con score de riesgo, principales factores de riesgo y alternativas disponibles. Línea de tiempo de días de inventario disponible por material. Botón de activar plan de contingencia que abre el proceso de orden de emergencia a proveedor alternativo.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/predict_supply_disruptions__optimize_delivery_routes]] — `DISRUPTION_RISK_HIGH` → [[optimize_delivery_routes]]
**Esta tool es disparada por:**
- [[track_shipments]] — `SHIPMENT_DELAYED` → [[../comunicaciones/track_shipments__predict_supply_disruptions]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

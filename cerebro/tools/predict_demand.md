---
tipo: tool
id: predict_demand
nombre: "Predecir Demanda"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: [INVENTORY_STATUS_READY]
produce: [DEMAND_FORECAST_READY]
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Predecir Demanda
> `predict_demand` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Predice la demanda de productos usando modelos de series temporales con factores estacionales.
## Contrato de eventos
- **Consume:** `INVENTORY_STATUS_READY`
- **Produce:** `DEMAND_FORECAST_READY`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** skuId identifica el producto específico a predecir (cada SKU tiene su propio patrón de consumo). horizonDays define el alcance temporal: 30 días para reorden semanal, 90 para planificación mensual. includeSeasonality activa factores como temporada alta, picos navideños o ciclos industriales que mejoran la precisión del modelo.

**Cálculos:** Aplicar un modelo de series temporales (ARIMA, Prophet o LSTM según disponibilidad de datos históricos) sobre el historial de ventas/consumo del SKU. Si includeSeasonality=true, multiplicar por el factor estacional calculado con descomposición STL. Calcular el intervalo de confianza al 95% para gestión de riesgo.

**Por qué estos outputs:** predictedUnits es la cantidad que el agente usará para calcular la orden de compra óptima. confidenceInterval permite al agente ser más conservador (usar el valor high) o más agresivo (usar low) según la política de inventario. seasonalityFactor sirve para explicar al operador por qué la demanda varía.

**Sugerencia de UI:** Gráfica de línea temporal con la predicción central y banda sombreada del intervalo de confianza. Eje X con fechas del horizonte, eje Y con unidades. Chip de seasonalityFactor con ícono de calendario y color según la magnitud del factor estacional.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/predict_demand__optimize_stock_levels]] — `DEMAND_FORECAST_READY` → [[optimize_stock_levels]]
**Esta tool es disparada por:**
- [[get_inventory_status]] — `INVENTORY_STATUS_READY` → [[../comunicaciones/get_inventory_status__predict_demand]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

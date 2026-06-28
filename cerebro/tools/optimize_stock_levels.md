---
tipo: tool
id: optimize_stock_levels
nombre: "Optimizar Niveles de Stock"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: [DEMAND_FORECAST_READY]
produce: [STOCK_OPTIMIZATION_COMPLETE]
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Optimizar Niveles de Stock
> `optimize_stock_levels` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Calcula niveles óptimos de reorden minimizando costos de almacenamiento y rupturas de stock.
## Contrato de eventos
- **Consume:** `DEMAND_FORECAST_READY`
- **Produce:** `STOCK_OPTIMIZATION_COMPLETE`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** skuId para identificar el artículo a optimizar. leadTimeDays es crítico: es el tiempo que tarda el proveedor en entregar y define cuándo hacer el pedido. holdingCostPercent es el costo anual de mantener una unidad en bodega (típicamente 20-30% del valor), necesario para calcular el lote económico.

**Cálculos:** Usar la fórmula EOQ (Economic Order Quantity): EOQ = √(2DS/H) donde D=demanda anual, S=costo de orden, H=costo de holding. Calcular el Punto de Reorden = (demanda diaria promedio × leadTimeDays) + stock de seguridad. El stock de seguridad = Z × σ × √leadTimeDays donde Z es el nivel de servicio deseado.

**Por qué estos outputs:** recommendedMinStock es el stock mínimo a mantener para no romper servicio, usado como umbral de alerta. reorderPoint es el momento exacto de lanzar la compra (cuando el stock llega a ese nivel). economicOrderQty es la cantidad óptima a pedir para minimizar costos totales de inventario.

**Sugerencia de UI:** Tarjeta con tres gauges circulares: Stock Mínimo, Punto de Reorden y EOQ. Línea de tiempo horizontal mostrando el ciclo de inventario (consumo → reorden → recepción). Indicador de ahorro estimado vs política actual.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/optimize_stock_levels__recommend_purchase_orders]] — `STOCK_OPTIMIZATION_COMPLETE` → [[recommend_purchase_orders]]
**Esta tool es disparada por:**
- [[predict_demand]] — `DEMAND_FORECAST_READY` → [[../comunicaciones/predict_demand__optimize_stock_levels]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: recommend_purchase_orders
nombre: "Recomendar Órdenes de Compra"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: [STOCK_OPTIMIZATION_COMPLETE]
produce: [ORDER_RECOMMENDED]
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Recomendar Órdenes de Compra
> `recommend_purchase_orders` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Genera recomendaciones de órdenes de compra basadas en demanda predicha y stock actual.
## Contrato de eventos
- **Consume:** `STOCK_OPTIMIZATION_COMPLETE`
- **Produce:** `ORDER_RECOMMENDED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** warehouseId para obtener el inventario actual y las predicciones de demanda de ese almacén específico. maxBudget es la restricción financiera del período — el agente no puede superar este límite al generar órdenes, priorizando los SKUs más críticos si el presupuesto es limitado.

**Cálculos:** Para cada SKU con stock bajo el punto de reorden: calcular la cantidad a pedir (EOQ o diferencia hasta stock máximo). Estimar el costo por proveedor. Ordenar por criticidad (días hasta ruptura). Seleccionar SKUs hasta agotar maxBudget usando un algoritmo greedy por criticidad/costo.

**Por qué estos outputs:** orders es la lista ejecutable de compras que el agente puede convertir directamente en órdenes. totalCost permite verificar que no se excede el presupuesto antes de ejecutar. supplierId en cada orden permite agrupar items por proveedor para consolidar pedidos.

**Sugerencia de UI:** Lista de órdenes recomendadas agrupadas por proveedor con SKU, cantidad y costo estimado por línea. Barra de progreso de presupuesto (totalCost vs maxBudget). Botón 'Aprobar todas' y checkboxes por orden para aprobación selectiva.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/recommend_purchase_orders__generate_purchase_order]] — `ORDER_RECOMMENDED` → [[generate_purchase_order]]
**Esta tool es disparada por:**
- [[optimize_stock_levels]] — `STOCK_OPTIMIZATION_COMPLETE` → [[../comunicaciones/optimize_stock_levels__recommend_purchase_orders]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

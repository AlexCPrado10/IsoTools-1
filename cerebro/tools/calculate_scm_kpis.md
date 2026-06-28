---
tipo: tool
id: calculate_scm_kpis
nombre: "Calcular KPIs de Cadena de Suministro"
categoria: supply-chain
agente: cadena-suministro
estado: catalogo
consume: [WMS_OPERATION_COMPLETE]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, supply-chain, catalogo]
---
# Calcular KPIs de Cadena de Suministro
> `calculate_scm_kpis` · Cloud · categoría **supply-chain** · estado **catalogo**
> Pertenece al agente [[../agentes/cadena-suministro|Agente de Cadena de Suministro]]
## Qué hace
Genera métricas SCOR: OTIF, fill rate, días de inventario (DSI), rotación, lead time y costo logístico como % de ventas.
## Contrato de eventos
- **Consume:** `WMS_OPERATION_COMPLETE`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para delimitar el análisis a los flujos de suministro de esa instalación (pedidos de venta, entregas, inventario). `periodDays` define la ventana de cálculo: OTIF y fill rate se calculan sobre los pedidos del período, mientras que días de inventario requiere el inventario promedio del período. `framework` ('scor' o 'custom') determina las definiciones exactas de cada KPI: el modelo SCOR tiene definiciones estandarizadas que permiten benchmarking con el sector.

**Cálculos:** OTIF = pedidos_entregados_completos_y_en_fecha / pedidos_totales × 100. Fill Rate = líneas_pedido_surtidas_completas / líneas_pedido_totales × 100. `inventoryDays` (DSI) = (inventario_promedio_en_valor / costo_de_ventas_del_período) × días_del_período. `inventoryTurnover` = costo_de_ventas_anualizado / inventario_promedio. `avgLeadTimeDays` = promedio de (fecha_recepción - fecha_pedido_a_proveedor) para todas las órdenes del período. `logisticsCostPercent` = (costo_logístico_total / ventas_netas) × 100; el benchmark de clase mundial es 6-8% para manufactura.

**Por qué estos outputs:** `otifPercent` es el KPI más crítico de la cadena de suministro: refleja la experiencia del cliente y el nivel de servicio. `fillRatePercent` complementa el OTIF identificando si los problemas son de disponibilidad o de transporte. `inventoryDays` y `inventoryTurnover` miden la eficiencia del capital de trabajo inmovilizado en inventario. `avgLeadTimeDays` es el input para el cálculo de inventarios de seguridad. `logisticsCostPercent` benchmarkea la eficiencia operativa de la cadena de suministro.

**Sugerencia de UI:** Dashboard de 6 KPI cards con benchmarks del sector como referencia visual. Gráfico de tendencia mensual de OTIF con línea de objetivo. Semáforo de cada KPI (verde/amarillo/rojo) basado en objetivos definidos por la empresa. Tabla de desglose por cliente, proveedor o familia de producto para los 3 KPIs principales.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[manage_warehouse_wms]] — `WMS_OPERATION_COMPLETE` → [[../comunicaciones/manage_warehouse_wms__calculate_scm_kpis]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

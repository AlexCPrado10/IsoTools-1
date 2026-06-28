---
tipo: tool
id: optimize_production_flow
nombre: "Optimizar Flujo de Producción"
categoria: production
agente: produccion-avanzada
estado: catalogo
consume: [IDLE_TIME_DETECTED]
produce: [FLOW_OPTIMIZED]
programador:
actualizado: 2026-06-28
tags: [tool, production, catalogo]
---
# Optimizar Flujo de Producción
> `optimize_production_flow` · Cloud · categoría **production** · estado **catalogo**
> Pertenece al agente [[../agentes/produccion-avanzada|Agente de Producción Avanzada]]
## Qué hace
Genera el plan de flujo productivo óptimo minimizando WIP, tiempos de espera y cambios de formato.
## Contrato de eventos
- **Consume:** `IDLE_TIME_DETECTED`
- **Produce:** `FLOW_OPTIMIZED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** lineId para obtener la configuración actual de la línea (capacidades, tiempos de setup, restricciones). productionOrders es la lista de órdenes a programar en la línea con la cantidad a producir, la prioridad del cliente y las restricciones de fecha de entrega que el agente debe respetar al optimizar.

**Cálculos:** Enviar el modelo de la línea (capacidades, buffers, tiempos de ciclo) y las órdenes al servicio de optimización del MES o a la plataforma de simulación configurada. Pasar las restricciones operativas y el objetivo de optimización. Obtener el plan de producción optimizado del servicio. No implementar programación lineal en el tool; el solver LP/MIP reside en la plataforma.

**Por qué estos outputs:** optimizedFlow es el plan de producción secuenciado que el MES ejecutará en la línea. estimatedOEE es el KPI que justifica el uso del optimizador ante la dirección. wipReduction cuantifica la reducción de inventario en proceso (WIP) que libera capital de trabajo y reduce el tiempo de ciclo total.

**Sugerencia de UI:** Diagrama de Gantt de la línea con bloques coloreados por orden/producto. KPIs del plan: OEE estimado, WIP promedio, órdenes a tiempo. Comparativa vs plan anterior. Botón de confirmar y enviar al MES. Simulación animada del flujo de producción.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/optimize_production_flow__execute_production_adjustment]] — `FLOW_OPTIMIZED` → [[execute_production_adjustment]]
**Esta tool es disparada por:**
- [[detect_idle_time]] — `IDLE_TIME_DETECTED` → [[../comunicaciones/detect_idle_time__optimize_production_flow]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

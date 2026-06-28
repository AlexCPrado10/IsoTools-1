---
tipo: tool
id: generate_maintenance_kpis
nombre: "Generar KPIs de Mantenimiento"
categoria: maintenance
agente: mantenimiento-cmms
estado: catalogo
consume: []
produce: [MAINTENANCE_KPIS_READY]
programador:
actualizado: 2026-06-28
tags: [tool, maintenance, catalogo]
---
# Generar KPIs de Mantenimiento
> `generate_maintenance_kpis` · Cloud · categoría **maintenance** · estado **catalogo**
> Pertenece al agente [[../agentes/mantenimiento-cmms|Agente de Mantenimiento & CMMS]]
## Qué hace
Genera dashboard de KPIs de mantenimiento: OEE, disponibilidad, MTBF, costo por activo y cumplimiento de PM.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `MAINTENANCE_KPIS_READY`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para delimitar el alcance del reporte al conjunto de activos de esa instalación específica, esencial en organizaciones multi-planta. `periodDays` (default 30) define la ventana temporal para calcular métricas de flujo (OEE, MTBF, costo). `groupBy` determina el nivel de granularidad: 'asset' muestra KPI por equipo individual (útil para mantenimiento), 'area' o 'line' para supervisores de producción, 'plant' para gerencia.

**Cálculos:** Calcular `overallAvailability` = suma(tiempo_operativo) / suma(tiempo_total) para todos los activos del período. `pmCompliancePercent` = (OTs preventivas ejecutadas a tiempo / OTs preventivas programadas) × 100. `maintenanceCostTotal` = suma de costo de todas las OTs cerradas (mano de obra + materiales + servicios externos). `reactiveVsPreventiveRatio` = cantidad_OTs_correctivas / cantidad_OTs_preventivas; el benchmark de clase mundial es <0.2. `topFailingAssets`: ranking de activos ordenados por mayor tiempo de parada no planificada en el período.

**Por qué estos outputs:** `overallAvailability` es el KPI principal para contrastar contra el OEE objetivo de producción. `pmCompliancePercent` mide la disciplina del proceso de mantenimiento y predice la confiabilidad futura. `maintenanceCostTotal` es el insumo para el análisis presupuestal mensual. `reactiveVsPreventiveRatio` diagnostica la madurez del programa de mantenimiento. `topFailingAssets` focaliza los recursos de mejora.

**Sugerencia de UI:** Dashboard con 5 KPI cards en la parte superior: Disponibilidad, Cumplimiento PM, Costo Total, Ratio Reactivo/Preventivo y Top Activos con Fallas. Gráfico de barras apiladas mensual mostrando OTs reactivas vs preventivas. Tabla de activos críticos con su disponibilidad individual y botón para ir al detalle del activo.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/generate_maintenance_kpis__track_asset_lifecycle]] — `MAINTENANCE_KPIS_READY` → [[track_asset_lifecycle]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

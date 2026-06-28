---
tipo: tool
id: schedule_preventive_maintenance
nombre: "Programar Mantenimiento Preventivo"
categoria: maintenance
agente: mantenimiento-cmms
estado: catalogo
consume: [RELIABILITY_DATA_UPDATED, FMEA_CRITICAL_FOUND]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, maintenance, catalogo]
---
# Programar Mantenimiento Preventivo
> `schedule_preventive_maintenance` · Cloud · categoría **maintenance** · estado **catalogo**
> Pertenece al agente [[../agentes/mantenimiento-cmms|Agente de Mantenimiento & CMMS]]
## Qué hace
Genera planes de mantenimiento preventivo optimizados por MTBF, disponibilidad requerida y costo.
## Contrato de eventos
- **Consume:** `RELIABILITY_DATA_UPDATED`, `FMEA_CRITICAL_FOUND`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `assetId` para acceder al historial de fallas, especificaciones del fabricante y frecuencias de mantenimiento definidas en el catálogo CMMS. `horizonDays` (default 90) delimita el período de planificación para que el scheduler no genere órdenes demasiado lejanas que podrían volverse irrelevantes. `availabilityTarget` (0-1) es el parámetro de optimización: si la planta exige 0.95, el algoritmo ajustará la frecuencia de PM para garantizarlo sin sobre-mantener.

**Cálculos:** Recuperar el MTBF histórico del activo desde la tabla de fallas. Calcular la frecuencia óptima de PM usando la función de confiabilidad de Weibull: R(t) = e^(-(t/η)^β). Generar la lista de tareas con fechas usando la fórmula: próxima_fecha = última_ejecución + intervalo_óptimo. Para cada tarea, estimar `estimatedHours` desde el catálogo de mano de obra estándar. Calcular `predictedAvailability` = MTBF / (MTBF + MTTR) con el plan propuesto. Calcular `estimatedCost` sumando (horas_técnico × tarifa_hora) + costo_materiales por tarea.

**Por qué estos outputs:** `scheduledTasks` permite al agente crear automáticamente las órdenes de trabajo preventivas en el CMMS con fecha y tipo definidos. `predictedAvailability` es el KPI de validación: si no alcanza `availabilityTarget`, el agente debe ajustar la frecuencia o reportar la brecha. `estimatedCost` alimenta el presupuesto de mantenimiento y permite comparar costo de PM vs costo esperado de falla.

**Sugerencia de UI:** Calendario mensual (tipo Gantt comprimido) con las tareas PM programadas por activo. Panel lateral con `predictedAvailability` en gauge circular y `estimatedCost` en tarjeta de resumen. Tabla de tareas con columnas: Fecha, Tipo, Horas estimadas y botón para crear OT directamente.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[calculate_mtbf_mttr]] — `RELIABILITY_DATA_UPDATED` → [[../comunicaciones/calculate_mtbf_mttr__schedule_preventive_maintenance]]
- [[analyze_failure_modes]] — `FMEA_CRITICAL_FOUND` → [[../comunicaciones/analyze_failure_modes__schedule_preventive_maintenance]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

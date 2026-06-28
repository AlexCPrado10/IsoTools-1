---
tipo: tool
id: track_safety_kpis
nombre: "Rastrear KPIs de Seguridad"
categoria: safety
agente: seguridad-hse
estado: catalogo
consume: [PERMIT_CLOSED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, safety, catalogo]
---
# Rastrear KPIs de Seguridad
> `track_safety_kpis` · Cloud · categoría **safety** · estado **catalogo**
> Pertenece al agente [[../agentes/seguridad-hse|Agente de Seguridad Industrial & HSE]]
## Qué hace
Monitorea indicadores de seguridad: TRIR, LTIR, días sin accidente, cierre de acciones correctivas y cultura de seguridad.
## Contrato de eventos
- **Consume:** `PERMIT_CLOSED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para delimitar el análisis a los incidentes, observaciones y acciones correctivas de esa instalación específica. `periodDays` define la ventana de los KPIs lagging (TRIR, LTIR se calculan por exposición acumulada en el período). `includeLeadingIndicators` activa los indicadores proactivos: cantidad de observaciones de seguridad, porcentaje de cierre de acciones correctivas en plazo, número de auditorías y simulacros ejecutados; estos indicadores predicen el desempeño futuro de seguridad antes de que ocurran incidentes.

**Cálculos:** Calcular `daysWithoutAccident`: días consecutivos desde el último incidente 'lost_time' o 'fatality'. `trir` (Total Recordable Incident Rate) = (número_incidentes_recordables × 200,000) / horas_hombre_trabajadas_en_período. `ltir` (Lost Time Incident Rate) = (incidentes_con_días_perdidos × 200,000) / horas_hombre_trabajadas; el factor 200,000 normaliza a 100 trabajadores a tiempo completo por año. `openCorrectiveActions`: contar acciones con `dueDate` < hoy y `status` ≠ 'closed'. `safetyObservationsCount`: contar observaciones registradas en el período. `nearMissReportingRate` = near_misses / incidentes_totales; un ratio alto indica cultura de reporte proactiva.

**Por qué estos outputs:** `daysWithoutAccident` es el KPI de visibilidad que refuerza la cultura de seguridad y se publica en el tablero de la planta. `trir` y `ltir` son las métricas estándar de la industria para benchmarking con el sector y reporte a la dirección corporativa. `openCorrectiveActions` es la señal de alerta de gestión: acciones vencidas indican que el sistema de gestión no está funcionando. `nearMissReportingRate` es el indicador más valioso de cultura de seguridad.

**Sugerencia de UI:** Marcador de días sin accidente tipo tablero digital grande (prominente en la pantalla principal del área de seguridad). Gráfico de línea de TRIR y LTIR mensual vs objetivo y benchmark del sector. Semáforo de acciones correctivas vencidas. Radar chart de indicadores líderes (6 ejes) para visualizar la madurez del sistema de gestión HSE.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[manage_work_permits]] — `PERMIT_CLOSED` → [[../comunicaciones/manage_work_permits__track_safety_kpis]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

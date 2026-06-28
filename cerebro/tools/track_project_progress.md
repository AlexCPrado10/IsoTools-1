---
tipo: tool
id: track_project_progress
nombre: "Rastrear Progreso de Proyectos"
categoria: erp
agente: erp-gestion-empresarial
estado: implementada
consume: [KPI_REPORT_GENERATED]
produce: [PROJECT_AT_RISK]
programador:
actualizado: 2026-06-28
tags: [tool, erp, implementada]
---
# Rastrear Progreso de Proyectos
> `track_project_progress` · Cloud · categoría **erp** · estado **implementada**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Monitorea el avance de proyectos industriales, hitos cumplidos y recursos utilizados.
## Contrato de eventos
- **Consume:** `KPI_REPORT_GENERATED`
- **Produce:** `PROJECT_AT_RISK`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** projectId es el único parámetro necesario porque el agente consulta toda la información del proyecto (hitos, tareas, presupuesto, recursos) a partir de ese ID. Esto permite que el agente genere reportes de status automáticos sin que el operador tenga que especificar qué métricas quiere ver.

**Cálculos:** Consultar todos los entregables y hitos del proyecto en la BD de gestión. Calcular completionPercent como (tareas completadas / total de tareas) × 100. Calcular budgetUsedPercent como (gasto real acumulado / presupuesto total) × 100. Determinar status comparando completionPercent y budgetUsedPercent con el progreso esperado a la fecha.

**Por qué estos outputs:** completionPercent es el indicador principal para reportes a stakeholders. milestonesCompleted/Total permite identificar si el proyecto está en riesgo de completar hitos clave a tiempo. budgetUsedPercent combinado con completionPercent detecta sobreejercicio del presupuesto.

**Sugerencia de UI:** Dashboard de proyecto con dos gauges: Avance físico y Avance presupuestal. Timeline de hitos con íconos de completado/en-progreso/pendiente. Indicador de salud del proyecto (En tiempo / En riesgo / Retrasado) con semáforo de color.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/track_project_progress__automate_followups]] — `PROJECT_AT_RISK` → [[automate_followups]]
**Esta tool es disparada por:**
- [[generate_kpis]] — `KPI_REPORT_GENERATED` → [[../comunicaciones/generate_kpis__track_project_progress]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

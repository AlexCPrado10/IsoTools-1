---
tipo: tool
id: generate_kpis
nombre: "Generar KPIs"
categoria: erp
agente: erp-gestion-empresarial
estado: implementada
consume: [PRODUCTION_VARIANCE_DETECTED, BUSINESS_ANOMALY_DETECTED]
produce: [KPI_REPORT_GENERATED]
programador:
actualizado: 2026-06-28
tags: [tool, erp, implementada]
---
# Generar KPIs
> `generate_kpis` · Cloud · categoría **erp** · estado **implementada**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Calcula y consolida KPIs operativos, financieros y de calidad en un reporte unificado.
## Contrato de eventos
- **Consume:** `PRODUCTION_VARIANCE_DETECTED`, `BUSINESS_ANOMALY_DETECTED`
- **Produce:** `KPI_REPORT_GENERATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** plantId para obtener todos los datos operativos de esa planta (producción, calidad, energía, seguridad). period define el granulado del cálculo: 'daily' para revisiones operativas, 'weekly' para reuniones de seguimiento, 'monthly' para reportes a dirección. Cada período tiene diferentes fuentes de datos y niveles de consolidación.

**Cálculos:** Para cada KPI de la planta, consultar los datos fuente (sistemas MES, SCADA, ERP, calidad). Calcular el valor actual del período. Calcular el trend comparando con el período anterior. Clasificar el status comparando con los targets configurados (verde/amarillo/rojo). KPIs típicos: OEE, PPM defectos, Entregas a tiempo, Costo por unidad, LTIF.

**Por qué estos outputs:** kpis es el conjunto de indicadores que el agente presenta en el dashboard de dirección y que dispara alertas automáticas cuando alguno está en rojo. name y unit permiten renderizar el KPI correctamente. trend permite al agente identificar deterioro antes de que el status cambie a rojo.

**Sugerencia de UI:** Grid de tarjetas KPI con valor grande, unidad, trend (flecha arriba/abajo/estable) y color de estado. Panel de semáforo ejecutivo con conteo de KPIs verdes/amarillos/rojos. Selector de período con comparativa vs target y vs período anterior.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/generate_kpis__track_project_progress]] — `KPI_REPORT_GENERATED` → [[track_project_progress]]
**Esta tool es disparada por:**
- [[compare_planned_vs_actual]] — `PRODUCTION_VARIANCE_DETECTED` → [[../comunicaciones/compare_planned_vs_actual__generate_kpis]]
- [[detect_business_anomalies]] — `BUSINESS_ANOMALY_DETECTED` → [[../comunicaciones/detect_business_anomalies__generate_kpis]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

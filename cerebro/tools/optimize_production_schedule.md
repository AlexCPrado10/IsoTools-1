---
tipo: tool
id: optimize_production_schedule
nombre: "Optimizar Programa de Producción"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Optimizar Programa de Producción
> `optimize_production_schedule` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Reoptimiza el programa de producción considerando prioridades, capacidad y fechas de entrega.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** plantId identifica la planta completa con todas sus líneas, recursos y restricciones de capacidad. horizon define el período de planificación (ej: '1w', '2w', '1m') — horizontes cortos dan mayor detalle pero menor flexibilidad; horizontes largos permiten optimizar recursos a mayor escala pero con menor precisión.

**Cálculos:** Enviar las órdenes de producción, capacidades de línea y restricciones al módulo APS del sistema MES/ERP (SAP PP/DS, Siemens Opcenter APS, Preactor, Plex). Pasar el horizonte de planificación y restricciones de capacidad. Obtener la secuencia optimizada que el APS devuelve. Si el sistema no tiene APS integrado, llamar al servicio de optimización de schedules de la plataforma; no implementar metaheurísticas en el tool.

**Por qué estos outputs:** schedule es el plan ejecutable que los operadores de planta y el MES reciben para programar la producción hora a hora. utilizationPercent es el KPI de eficiencia que la dirección monitorea. onTimeDeliveryForecast indica qué porcentaje de órdenes se entregarán a tiempo con este plan.

**Sugerencia de UI:** Diagrama de Gantt interactivo con líneas en el eje Y y tiempo en el eje X. Cada bloque coloreado por producto/orden. Panel lateral con métricas: Utilización promedio, OTD forecast, Conflictos detectados. Botón para exportar el plan al MES.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

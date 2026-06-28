---
tipo: tool
id: plan_production_automatically
nombre: "Planificar Producción Automáticamente"
categoria: production
agente: produccion-avanzada
estado: catalogo
consume: [PATTERNS_IDENTIFIED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, production, catalogo]
---
# Planificar Producción Automáticamente
> `plan_production_automatically` · Cloud · categoría **production** · estado **catalogo**
> Pertenece al agente [[../agentes/produccion-avanzada|Agente de Producción Avanzada]]
## Qué hace
Genera el plan de producción completo de forma automática considerando recursos, materiales y demanda.
## Contrato de eventos
- **Consume:** `PATTERNS_IDENTIFIED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** plantId para obtener todos los recursos de la planta (líneas, máquinas, operadores, materiales disponibles). horizon es el número de días que cubre el plan — planes cortos (5-10 días) para producción de alta variabilidad, planes largos (30 días) para producción repetitiva. demandForecast es el input del plan: las cantidades a producir por producto y fecha.

**Cálculos:** Consultar la demanda y los materiales disponibles desde el ERP. Enviar la solicitud de planificación al módulo MRP/CRP del ERP (SAP MRP, Oracle MPS, Infor M3 MPS). Obtener el plan de producción propuesto por el ERP, incluyendo órdenes planificadas y cuellos de botella de capacidad identificados. No reimplementar MRP/CRP; consumir el resultado del módulo de planificación del ERP.

**Por qué estos outputs:** productionPlan es el plan maestro que los planificadores de producción reciben para revisar y aprobar antes de enviarlo al MES. resourceUtilization permite identificar recursos sobreutilizados (cuellos de botella) y subutilizados (capacidad disponible para nuevos pedidos). onTimeDeliveryRate es el compromiso de servicio al cliente que el agente puede comunicar al área comercial.

**Sugerencia de UI:** Vista de calendario de producción con bloques de órdenes por línea y día. Panel de KPIs del plan: OTD, utilización promedio, costo de producción estimado. Alertas de conflictos (material faltante, sobre capacidad). Botón de aprobar y publicar el plan al MES.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[identify_idle_time_patterns]] — `PATTERNS_IDENTIFIED` → [[../comunicaciones/identify_idle_time_patterns__plan_production_automatically]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

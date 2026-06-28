---
tipo: tool
id: identify_idle_time_patterns
nombre: "Identificar Patrones de Tiempo Muerto"
categoria: production
agente: produccion-avanzada
estado: catalogo
consume: []
produce: [PATTERNS_IDENTIFIED]
programador:
actualizado: 2026-06-28
tags: [tool, production, catalogo]
---
# Identificar Patrones de Tiempo Muerto
> `identify_idle_time_patterns` · Cloud · categoría **production** · estado **catalogo**
> Pertenece al agente [[../agentes/produccion-avanzada|Agente de Producción Avanzada]]
## Qué hace
Analiza datos históricos para identificar patrones recurrentes de tiempo muerto y sus causas.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `PATTERNS_IDENTIFIED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** lineId para analizar el historial de paros de esa línea específica con sus causas registradas. periodDays define el historial a analizar — análisis de un período largo (30-90 días) permite identificar patrones recurrentes que no son visibles en datos de una semana.

**Cálculos:** Consultar todos los registros de paro de la línea en el período con causa, duración, turno y hora de inicio. Agrupar por causa de paro. Calcular la distribución temporal de paros por hora del día y día de la semana para identificar patterns recurrentes. Sumar el totalIdleTimeHours del período para cuantificar el impacto.

**Por qué estos outputs:** patterns es el análisis estadístico que permite al equipo de manufactura diseñar contramedidas específicas para los paros más frecuentes. topCauses es el Pareto de causas de paro para priorizar los esfuerzos de mejora continua. totalIdleTimeHours cuantifica la oportunidad de mejora en horas de producción perdidas.

**Sugerencia de UI:** Mapa de calor de paros por hora del día vs día de la semana (intensidad = duración de paros). Gráfica de Pareto de causas de paro. KPI de tiempo muerto total y % del tiempo disponible. Tabla de patrones identificados con frecuencia y acción recomendada.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/identify_idle_time_patterns__plan_production_automatically]] — `PATTERNS_IDENTIFIED` → [[plan_production_automatically]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

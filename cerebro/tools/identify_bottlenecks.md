---
tipo: tool
id: identify_bottlenecks
nombre: "Identificar Cuellos de Botella"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Identificar Cuellos de Botella
> `identify_bottlenecks` · Cloud · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Identifica cuellos de botella en la línea de producción que limitan el throughput global.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** lineId identifica la línea de producción a analizar con todas sus estaciones y tiempos de ciclo históricos. analysisWindow define el período de datos a analizar ('1shift', '1week', '1month') — ventanas cortas detectan cuellos de botella coyunturales, ventanas largas identifican cuellos de botella estructurales.

**Cálculos:** Obtener los tiempos de ciclo por estación de trabajo para cada orden procesada en analysisWindow. Calcular la utilización de cada estación: utilizationPercent = (tiempo_ciclo_real / tiempo_ciclo_disponible) × 100. La estación con mayor utilización es el cuello de botella según la Teoría de las Restricciones (TOC) de Goldratt. Calcular theoreticalCapacityIncrease estimando cuánto aumentaría el throughput si se elimina el cuello de botella.

**Por qué estos outputs:** bottlenecks lista las estaciones ordenadas por utilización, con los datos que el equipo de ingeniería necesita para el análisis de capacidad. theoreticalCapacityIncrease cuantifica el beneficio de resolver el cuello de botella. waitTimeMs muestra el tiempo de espera acumulado de los trabajos bloqueados.

**Sugerencia de UI:** Diagrama de flujo de la línea con cada estación como caja, coloreada por utilización (verde/amarillo/rojo). Gráfica de barras de utilización por estación con línea de 100%. KPI de capacidad teórica incrementada. Recomendaciones de balanceo de línea accionables.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

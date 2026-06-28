---
tipo: tool
id: simulate_bottlenecks
nombre: "Simular Cuellos de Botella"
categoria: production
agente: produccion-avanzada
estado: catalogo
consume: [IDLE_PATTERN_DETECTED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, production, catalogo]
---
# Simular Cuellos de Botella
> `simulate_bottlenecks` · Cloud · categoría **production** · estado **catalogo**
> Pertenece al agente [[../agentes/produccion-avanzada|Agente de Producción Avanzada]]
## Qué hace
Simula escenarios de cuello de botella en la línea para evaluar impacto antes de cambios reales.
## Contrato de eventos
- **Consume:** `IDLE_PATTERN_DETECTED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** lineId identifica la línea de producción con su configuración actual de capacidades por estación. scenario define el escenario what-if a simular: capacityChange es el cambio de capacidad en una estación específica (positivo para ampliar, negativo para reducir), demandIncrease es el aumento de pedidos que se quiere evaluar si la línea puede absorber.

**Cálculos:** Enviar el modelo de la línea y los cambios de escenario al motor de simulación de planta (Arena, Plant Simulation de Siemens, FlexSim, o el gemelo digital configurado). Pasar las variaciones de capacidad y carga de trabajo del escenario. Obtener los resultados: throughput proyectado, utilización por estación y cuello de botella identificado por el simulador.

**Por qué estos outputs:** throughputChange cuantifica el impacto del escenario en la producción (ej: '+15% si se añade una máquina paralela en la estación 3'). oeeDelta muestra el efecto en la eficiencia global. recommendation es la conclusión del análisis: qué inversión o cambio operativo genera el mayor beneficio para la línea.

**Sugerencia de UI:** Diagrama de flujo de la línea antes/después del escenario con throughput por estación. Comparativa de OEE actual vs simulado con gauge. Panel de escenarios guardados para comparar múltiples alternativas. Análisis de sensibilidad: cómo varía el resultado según la capacidad añadida.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[detect_idle_time]] — `IDLE_PATTERN_DETECTED` → [[../comunicaciones/detect_idle_time__simulate_bottlenecks]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

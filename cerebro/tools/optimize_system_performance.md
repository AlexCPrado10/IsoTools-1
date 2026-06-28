---
tipo: tool
id: optimize_system_performance
nombre: "Optimizar Rendimiento del Sistema"
categoria: digital-twin
agente: digital-twin
estado: catalogo
consume: [SIMULATION_COMPLETE]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, digital-twin, catalogo]
---
# Optimizar Rendimiento del Sistema
> `optimize_system_performance` · Cloud · categoría **digital-twin** · estado **catalogo**
> Pertenece al agente [[../agentes/digital-twin|Agente de Digital Twin]]
## Qué hace
Aplica optimización global del sistema basada en resultados del gemelo digital.
## Contrato de eventos
- **Consume:** `SIMULATION_COMPLETE`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** twinId identifica el gemelo digital del sistema a optimizar — debe tener un fidelityScore alto para que las recomendaciones sean confiables. optimizationObjective define qué maximizar/minimizar: 'throughput' para maximizar producción, 'energy' para minimizar consumo energético, 'cost' para minimizar costo total de producción.

**Cálculos:** Solicitar una corrida de optimización al motor del gemelo digital, pasando `twinId`, los parámetros del proceso a optimizar y las restricciones operativas. El gemelo digital ejecuta el proceso de optimización internamente (Bayesian, PSO u otro según configuración del modelo) y devuelve los parámetros óptimos sugeridos y el `expectedImprovementPercent`. No implementar el optimizador en el tool; delegar en el motor del gemelo digital.

**Por qué estos outputs:** recommendations es la lista concreta de cambios de setpoints que el agente debe ejecutar (vía execute_local_control_action) para llevar el sistema al punto óptimo. optimizationId permite rastrear qué optimización generó qué recomendaciones. expectedImprovementPercent justifica ante la dirección la inversión en el sistema de gemelo digital.

**Sugerencia de UI:** Gráfica de superficie de optimización (heatmap 2D del espacio de parámetros con el óptimo marcado). Panel de recomendaciones con parámetro actual vs óptimo por cada ajuste. Indicador de mejora esperada por KPI. Botón de aplicar todas las recomendaciones con simulación previa.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[simulate_operations]] — `SIMULATION_COMPLETE` → [[../comunicaciones/simulate_operations__optimize_system_performance]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

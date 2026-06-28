---
tipo: tool
id: simulate_operations
nombre: "Simular Operaciones"
categoria: digital-twin
agente: digital-twin
estado: catalogo
consume: [TWIN_READY]
produce: [SIMULATION_COMPLETE]
programador:
actualizado: 2026-06-28
tags: [tool, digital-twin, catalogo]
---
# Simular Operaciones
> `simulate_operations` · Cloud · categoría **digital-twin** · estado **catalogo**
> Pertenece al agente [[../agentes/digital-twin|Agente de Digital Twin]]
## Qué hace
Corre simulaciones what-if en el gemelo digital sin afectar la producción real.
## Contrato de eventos
- **Consume:** `TWIN_READY`
- **Produce:** `SIMULATION_COMPLETE`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** twinId identifica el gemelo digital sobre el que correr la simulación (debe estar en syncStatus='synced' con datos recientes). scenarios es el array de escenarios what-if a evaluar: cada uno tiene un nombre descriptivo y sus parámetros de cambio. horizonHours define cuántas horas hacia adelante simular.

**Cálculos:** Solicitar la ejecución del escenario de simulación al motor del gemelo digital (Azure Digital Twins, AWS IoT TwinMaker, Siemens Industrial Edge, o el modelo FMU/FMI registrado). Pasar `twinId`, el escenario de simulación y los cambios de parámetros. Obtener los KPIs proyectados y alertas del motor de simulación; no ejecutar la simulación dentro del tool.

**Por qué estos outputs:** results con los KPIs de cada escenario permite al equipo de ingeniería comparar alternativas objetivamente antes de implementar cambios en la línea real. bestScenarioId es la recomendación del agente. projectedImprovement cuantifica el beneficio esperado del mejor escenario para el reporte a la dirección.

**Sugerencia de UI:** Tabla comparativa de escenarios con KPIs en columnas y código de color (mejor=verde, peor=rojo). Gráfica de radar comparando todos los escenarios en múltiples dimensiones. Animación del proceso simulado en el gemelo 3D. Botón de implementar el mejor escenario.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/simulate_operations__optimize_system_performance]] — `SIMULATION_COMPLETE` → [[optimize_system_performance]]
**Esta tool es disparada por:**
- [[generate_digital_twin]] — `TWIN_READY` → [[../comunicaciones/generate_digital_twin__simulate_operations]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

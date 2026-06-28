---
tipo: tool
id: detect_energy_waste
nombre: "Detectar Desperdicio Energético"
categoria: energy
agente: energia-sustentabilidad
estado: catalogo
consume: [ENPI_CALCULATED]
produce: [ENERGY_WASTE_FOUND]
programador:
actualizado: 2026-06-28
tags: [tool, energy, catalogo]
---
# Detectar Desperdicio Energético
> `detect_energy_waste` · Cloud · categoría **energy** · estado **catalogo**
> Pertenece al agente [[../agentes/energia-sustentabilidad|Agente de Energía & Sustentabilidad]]
## Qué hace
Identifica consumos anómalos, equipos funcionando en vacío, consumo en horas no productivas y cargas fantasma.
## Contrato de eventos
- **Consume:** `ENPI_CALCULATED`
- **Produce:** `ENERGY_WASTE_FOUND`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para acceder a todos los medidores y el calendario de producción de esa planta. `analysisWindow` (día/semana/mes) determina la granularidad del análisis: 'day' detecta desperdicios en turno no productivo de la noche, 'week' identifica el consumo del fin de semana, 'month' detecta tendencias de consumo anómalas. `productionCalendar` es el objeto que define los horarios de producción programada, necesario para separar el consumo productivo del consumo en horas no productivas (turno vacío, fin de semana, festivos).

**Cálculos:** Para consumo en horas no productivas: cruzar los registros de energía con el `productionCalendar`; calcular el consumo promedio por hora en períodos sin producción vs períodos con producción; si el consumo en vacío supera el 15% del consumo en producción, marcar como 'idle_consumption'. Para equipos en vacío: identificar medidores con consumo constante (varianza < 5%) durante períodos de producción variable (indicio de equipo sin carga útil). Para cargas fantasma: detectar consumos que no se apagan fuera de horario laboral. Para cada anomalía, calcular `estimatedWasteKWh` y `estimatedCostSavings` usando el precio promedio del kWh.

**Por qué estos outputs:** `wasteOpportunities` permite al agente priorizar las acciones de ahorro de mayor impacto económico. `estimatedCostSavings` por oportunidad es el argumento de negocio para que el gerente de planta autorice los cambios operativos. `recommendation` por oportunidad es la instrucción concreta (ej: 'Instalar temporizador en compresor C-01 para apagado automático a las 18:00 h'). `totalSavingsOpportunity` justifica el ROI del programa de gestión energética.

**Sugerencia de UI:** Lista priorizada de oportunidades de desperdicio ordenada por ahorro potencial descendente. Tarjeta por oportunidad con: tipo de desperdicio, medidor afectado, kWh estimados, costo estimado y recomendación. Gráfico de Pareto de oportunidades. Mapa de calor de consumo por hora/día superpuesto con el calendario de producción.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/detect_energy_waste__optimize_energy_loads]] — `ENERGY_WASTE_FOUND` → [[optimize_energy_loads]]
**Esta tool es disparada por:**
- [[calculate_energy_kpis]] — `ENPI_CALCULATED` → [[../comunicaciones/calculate_energy_kpis__detect_energy_waste]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

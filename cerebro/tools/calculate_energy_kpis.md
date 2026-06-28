---
tipo: tool
id: calculate_energy_kpis
nombre: "Calcular KPIs de Energía (EnPI)"
categoria: energy
agente: energia-sustentabilidad
estado: catalogo
consume: [ENERGY_READING_AVAILABLE]
produce: [ENPI_CALCULATED, CONSUMPTION_DATA_READY, ENPI_PERIOD_CLOSED]
programador:
actualizado: 2026-06-28
tags: [tool, energy, catalogo]
---
# Calcular KPIs de Energía (EnPI)
> `calculate_energy_kpis` · Cloud · categoría **energy** · estado **catalogo**
> Pertenece al agente [[../agentes/energia-sustentabilidad|Agente de Energía & Sustentabilidad]]
## Qué hace
Calcula indicadores de desempeño energético (EnPI) según ISO 50001: intensidad energética, consumo específico y línea base.
## Contrato de eventos
- **Consume:** `ENERGY_READING_AVAILABLE`
- **Produce:** `ENPI_CALCULATED`, `CONSUMPTION_DATA_READY`, `ENPI_PERIOD_CLOSED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para delimitar el alcance del análisis energético a los medidores y procesos de esa instalación. `productionUnits` es el denominador del EnPI de intensidad energética (kWh por unidad producida); sin esta variable, el KPI no puede calcularse y los consumos absolutas no son comparables entre períodos de diferente producción. `baselineYear` define el año de referencia ISO 50001 contra el cual se compara el desempeño actual; si se omite, se usa el año anterior como baseline por defecto.

**Cálculos:** Sumar el consumo de todos los medidores del `plantId` en el `periodDays`: `totalEnergyKWh`. Calcular `energyIntensity` = totalEnergyKWh / productionUnits. Recuperar `energyIntensity_baseline` del año `baselineYear`. `vsBaselinePercent` = ((energyIntensity - energyIntensity_baseline) / energyIntensity_baseline) × 100; negativo = mejora. `energySavingsKWh` = (energyIntensity_baseline - energyIntensity) × productionUnits. `costSavings` = energySavingsKWh × precio_kWh_promedio_del_período. `enpiTrend`: comparar intensidad de los últimos 3 meses vs los 3 meses anteriores; si mejora > 2% → 'improving'.

**Por qué estos outputs:** `energyIntensity` es el EnPI principal ISO 50001 que normaliza el consumo por producción, haciendo comparables períodos con diferente nivel de actividad. `vsBaselinePercent` es la métrica de reporte de sustentabilidad que debe presentarse ante organismos de certificación. `energySavingsKWh` y `costSavings` cuantifican el impacto económico de las mejoras para justificar inversiones ante la dirección.

**Sugerencia de UI:** Gráfico de línea dual mostrando EnPI mensual vs línea base horizontal. Flecha de tendencia anual con porcentaje de mejora o deterioro. KPI cards: Consumo Total kWh, Intensidad kWh/unidad, Ahorro vs Baseline kWh, Ahorro en costo ($). Selector de período con comparación vs mismo período del año anterior.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/calculate_energy_kpis__detect_energy_waste]] — `ENPI_CALCULATED` → [[detect_energy_waste]]
- [[../comunicaciones/calculate_energy_kpis__calculate_carbon_footprint]] — `CONSUMPTION_DATA_READY` → [[calculate_carbon_footprint]]
- [[../comunicaciones/calculate_energy_kpis__generate_iso50001_report]] — `ENPI_PERIOD_CLOSED` → [[generate_iso50001_report]]
**Esta tool es disparada por:**
- [[monitor_energy_meters]] — `ENERGY_READING_AVAILABLE` → [[../comunicaciones/monitor_energy_meters__calculate_energy_kpis]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

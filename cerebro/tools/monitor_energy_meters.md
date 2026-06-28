---
tipo: tool
id: monitor_energy_meters
nombre: "Monitorear Medidores de Energía"
categoria: energy
agente: energia-sustentabilidad
estado: catalogo
consume: []
produce: [ENERGY_READING_AVAILABLE]
programador:
actualizado: 2026-06-28
tags: [tool, energy, catalogo]
---
# Monitorear Medidores de Energía
> `monitor_energy_meters` · Edge · categoría **energy** · estado **catalogo**
> Pertenece al agente [[../agentes/energia-sustentabilidad|Agente de Energía & Sustentabilidad]]
## Qué hace
Lee medidores de energía eléctrica, gas, vapor y agua con resolución de 15 minutos para análisis energético.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `ENERGY_READING_AVAILABLE`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `meterIds` como array para consolidar múltiples puntos de medición (electricidad de diferentes circuitos, medidores de gas de diferentes quemadores) en una sola consulta, lo que es esencial para calcular balances energéticos de una planta completa. `energyType` determina las unidades esperadas y los factores de conversión: electricidad en kWh, gas en m³ o MJ, vapor en toneladas o GJ. `resolutionMinutes` (default 15 min) es el intervalo de lectura: 15 minutos es el estándar de las tarifas eléctricas de demanda máxima y permite calcular la demanda de forma compatible con las facturas de la CFE.

**Cálculos:** Leer los registros de cada medidor en el rango de tiempo requerido. Convertir todas las lecturas a unidades base (kWh, m³). Calcular `totalConsumption` = suma de los valores de todos los medidores en el período. `peakDemand` = valor máximo de potencia promedio en intervalos de 15 minutos (kW), que es el parámetro que determina el cargo por demanda de la tarifa eléctrica. `powerFactor` = promedio de factor de potencia de los medidores eléctricos (energía activa / energía aparente); valores < 0.9 generan cargos adicionales en tarifa GDMTH.

**Por qué estos outputs:** `readings` por medidor permite al agente identificar los consumidores individuales más significativos y detectar anomalías en medidores específicos. `totalConsumption` es el input para calcular el EnPI del período. `peakDemand` es el dato más crítico para la optimización tarifaria: reducir el pico reduce el cargo de demanda directamente. `powerFactor` bajo activa recomendaciones de corrección con banco de capacitores.

**Sugerencia de UI:** Gráfico de tendencia de consumo energético por hora del día (perfil de carga) con área sombreada. Mapa de calor de consumo por hora vs día de la semana para identificar patrones. KPI cards de consumo total, demanda pico y factor de potencia. Tabla de medidores con su lectura actual y contribución porcentual al consumo total.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/monitor_energy_meters__calculate_energy_kpis]] — `ENERGY_READING_AVAILABLE` → [[calculate_energy_kpis]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

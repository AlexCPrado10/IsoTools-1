---
tipo: tool
id: calculate_carbon_footprint
nombre: "Calcular Huella de Carbono"
categoria: energy
agente: energia-sustentabilidad
estado: catalogo
consume: [CONSUMPTION_DATA_READY]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, energy, catalogo]
---
# Calcular Huella de Carbono
> `calculate_carbon_footprint` · Cloud · categoría **energy** · estado **catalogo**
> Pertenece al agente [[../agentes/energia-sustentabilidad|Agente de Energía & Sustentabilidad]]
## Qué hace
Calcula emisiones de CO₂ equivalente por alcance 1, 2 y 3 según GHG Protocol e ISO 14064 para reportes de sustentabilidad.
## Contrato de eventos
- **Consume:** `CONSUMPTION_DATA_READY`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para acceder a todos los datos de consumo de energía y procesos de esa instalación. `periodDays` (default 365) define el período de reporte: las normas ISO 14064 y GHG Protocol requieren reportes anuales, aunque se pueden hacer períodos parciales. `includeScope3` activa el cálculo de emisiones de cadena de valor (materias primas, transporte de distribución, residuos), que son el 70-90% de la huella de la mayoría de empresas manufactureras pero requieren datos de proveedores. `emissionFactorSource` selecciona los factores de emisión: 'cfe_mexico' usa el factor de la red eléctrica mexicana publicado por la CFE, 'iea' usa factores internacionales para comparación.

**Cálculos:** Alcance 1 (emisiones directas): consumo_gas_natural × factor_emisión_gas (2.2 kg CO₂e/m³) + consumo_diesel × factor_emisión_diesel (2.68 kg CO₂e/litro) + refrigerantes (equivalente CO₂ × GWP del refrigerante). Alcance 2 (electricidad comprada): consumo_kWh × factor_emisión_red_eléctrica (CFE 2024: ~0.385 kg CO₂e/kWh). Alcance 3 (si `includeScope3`): emisiones de materias primas + transporte de distribución. `totalTco2e` = scope1 + scope2 + scope3. `vsLastYearPercent` = ((total_año_actual - total_año_anterior) / total_año_anterior) × 100. `carbonIntensity` = totalTco2e / productionUnits.

**Por qué estos outputs:** `scope1tCO2e`, `scope2tCO2e`, `scope3tCO2e` desglosan las emisiones por alcance para orientar las estrategias de reducción (Alcance 2 se reduce con energías renovables, Alcance 1 con eficiencia en combustión). `totalTco2e` es el dato de reporte para mercados de carbono, reportes ESG y clientes que exigen neutralidad de carbono en su cadena de suministro. `carbonIntensity` normaliza las emisiones por producción para comparaciones justas.

**Sugerencia de UI:** Gráfico de dona mostrando distribución de emisiones por alcance (Scope 1, 2, 3). KPI cards: Total tCO₂e, Intensidad (tCO₂e/unidad), Variación vs año anterior (%). Gráfico de barras mensual de emisiones. Comparación visual con el objetivo de descarbonización de la empresa.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[calculate_energy_kpis]] — `CONSUMPTION_DATA_READY` → [[../comunicaciones/calculate_energy_kpis__calculate_carbon_footprint]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

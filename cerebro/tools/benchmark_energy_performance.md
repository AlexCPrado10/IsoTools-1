---
tipo: tool
id: benchmark_energy_performance
nombre: "Benchmark de Desempeño Energético"
categoria: energy
agente: energia-sustentabilidad
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, energy, catalogo]
---
# Benchmark de Desempeño Energético
> `benchmark_energy_performance` · Cloud · categoría **energy** · estado **catalogo**
> Pertenece al agente [[../agentes/energia-sustentabilidad|Agente de Energía & Sustentabilidad]]
## Qué hace
Compara el desempeño energético de la planta contra benchmarks del sector y plantas similares para identificar brechas.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para recuperar el EnPI actual de la planta para comparación. `sector` es obligatorio porque los benchmarks energéticos varían drásticamente entre industrias: una planta de cemento consume ~90 kWh/ton mientras que una farmacéutica puede consumir >10,000 kWh/ton de producto. `companySize` afina el benchmark ya que las economías de escala hacen que las plantas grandes tengan mejor intensidad energética que las pequeñas en el mismo sector.

**Cálculos:** Recuperar el EnPI actual de `plantId` del período más reciente. Consultar la base de datos de benchmarks sectoriales (alimentada con datos de CONUEE, IEA, organismos sectoriales) filtrada por `sector` y `companySize`. Calcular `sectorMedianEnPI` y `sectorBestPracticeEnPI` (percentil 25 del sector = mejor cuartil). `gapToMedianPercent` = ((plantEnPI - sectorMedianEnPI) / sectorMedianEnPI) × 100; negativo significa que la planta está por debajo de la mediana (mejor). `gapToBestPercent` = diferencia vs el percentil 25. `improvementPotentialKWh` = (plantEnPI - sectorBestPracticeEnPI) × producción_anual.

**Por qué estos outputs:** `plantEnPI` vs `sectorMedianEnPI` posiciona la planta en el contexto competitivo del sector. `gapToBestPercent` cuantifica el potencial máximo de mejora alcanzable siguiendo las mejores prácticas. `improvementPotentialKWh` traduce la brecha técnica a kWh y costo recuperable, el argumento de negocio más poderoso para inversiones en eficiencia energética.

**Sugerencia de UI:** Gráfico de rango (bullet chart) mostrando el EnPI de la planta contra el rango del sector (mínimo, mediana, máximo). Cuadrante de posicionamiento competitivo. KPI cards de brecha vs mediana y vs mejor práctica. Tabla de mejores prácticas del sector con tecnologías y acciones específicas para cerrar la brecha.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

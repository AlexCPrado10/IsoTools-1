---
tipo: tool
id: calculate_control_charts
nombre: "Calcular Cartas de Control SPC"
categoria: quality
agente: calidad-spc
estado: implementada
consume: [MEASUREMENTS_CAPTURED, MSA_VALIDATED]
produce: [CHART_POINTS_UPDATED]
programador:
actualizado: 2026-06-28
tags: [tool, quality, implementada]
---
# Calcular Cartas de Control SPC
> `calculate_control_charts` · Cloud · categoría **quality** · estado **implementada**
> Pertenece al agente [[../agentes/calidad-spc|Agente de Calidad & SPC]]
## Qué hace
Genera cartas de control Xbar-R, Xbar-S, I-MR y p/np para monitoreo estadístico de proceso en tiempo real.
## Contrato de eventos
- **Consume:** `MEASUREMENTS_CAPTURED`, `MSA_VALIDATED`
- **Produce:** `CHART_POINTS_UPDATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `characteristicId` para vincular la carta a la característica del producto o proceso y cargar sus límites de especificación (LSE, LIE) para comparación. `chartType` determina el algoritmo de cálculo: Xbar-R es para subgrupos pequeños (n=2-9), Xbar-S para subgrupos mayores, IMR para mediciones individuales, p/np para atributos. `measurements` son los datos crudos de la característica medida. `subgroupSize` (default 5) define cómo agrupar las mediciones para calcular la estadística de la carta.

**Cálculos:** Para Xbar-R: calcular la media de cada subgrupo (X̄) y el rango (R). UCL_X = X̄̄ + A₂·R̄, LCL_X = X̄̄ - A₂·R̄ (factores A₂, D₃, D₄ de tablas SPC según subgroupSize). Para IMR: MR_i = |x_i - x_{i-1}|; UCL_I = X̄ + 2.66·MR̄; UCL_MR = 3.267·MR̄. Para cartas p: p̄ = defectuosos_totales/inspecciones_totales; UCL = p̄ + 3·√(p̄·(1-p̄)/n). Calcular `plotPoints` como array de los estadísticos calculados. Identificar `outOfControlPoints`: índices donde plotPoints[i] > UCL o < LCL. `inControl`: true si outOfControlPoints está vacío.

**Por qué estos outputs:** `ucl`, `lcl` y `centerLine` son las líneas de referencia que el agente usa para evaluar nuevas mediciones sin recalcular desde cero. `plotPoints` es el input directo para renderizar la carta en el UI. `outOfControlPoints` (índices) permite al agente señalar exactamente qué muestras deben investigarse. `inControl` es el flag booleano que dispara o suprime alertas de calidad.

**Sugerencia de UI:** Carta de control interactiva (tipo line chart) con UCL, LCL y línea central en colores distintos. Puntos fuera de control marcados en rojo con tooltip mostrando valor y número de muestra. Selector de tipo de carta y tamaño de subgrupo en la cabecera. Botón de exportar la carta como imagen para reportes de auditoría.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/calculate_control_charts__detect_out_of_control_signals]] — `CHART_POINTS_UPDATED` → [[detect_out_of_control_signals]]
**Esta tool es disparada por:**
- [[collect_quality_measurements]] — `MEASUREMENTS_CAPTURED` → [[../comunicaciones/collect_quality_measurements__calculate_control_charts]]
- [[run_msa_analysis]] — `MSA_VALIDATED` → [[../comunicaciones/run_msa_analysis__calculate_control_charts]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

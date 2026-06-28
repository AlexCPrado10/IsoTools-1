---
tipo: tool
id: run_msa_analysis
nombre: "Ejecutar Análisis de Sistema de Medición (MSA)"
categoria: quality
agente: calidad-spc
estado: implementada
consume: [NEW_DEVICE_REGISTERED]
produce: [MSA_VALIDATED]
programador:
actualizado: 2026-06-28
tags: [tool, quality, implementada]
---
# Ejecutar Análisis de Sistema de Medición (MSA)
> `run_msa_analysis` · Cloud · categoría **quality** · estado **implementada**
> Pertenece al agente [[../agentes/calidad-spc|Agente de Calidad & SPC]]
## Qué hace
Ejecuta estudios Gage R&R, linealidad y sesgo para validar que los sistemas de medición son adecuados para el proceso.
## Contrato de eventos
- **Consume:** `NEW_DEVICE_REGISTERED`
- **Produce:** `MSA_VALIDATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `gaugeId` para identificar el instrumento de medición específico y recuperar su calibración vigente y metadatos. `studyType` determina el análisis: 'gage_rr' cuantifica repetibilidad y reproducibilidad, 'linearity' evalúa el sesgo a lo largo del rango de medición, 'bias' compara las mediciones con un patrón trazable. `measurements` es el array de objetos con las mediciones reales del estudio (estructura: {partId, operatorId, trial, value}). `operators` lista los operadores participantes para calcular la componente de reproducibilidad separada de la repetibilidad.

**Cálculos:** Para Gage R&R por método ANOVA: calcular sumas de cuadrados para partes (SS_parts), operadores (SS_operators) y error (SS_error). Repeatability = σ²_error. Reproducibility = σ²_operators. Gage R&R total = √(σ²_error + σ²_operators). `gageRRPercent` = (Gage R&R / variación_total_del_estudio) × 100. `ndc` (número de categorías distintas) = 1.41 × (σ_parts / σ_gauge_rr); debe ser ≥ 5 para el gauge ser útil. `verdict`: 'acceptable' si gageRRPercent < 10%, 'marginal' si 10-30%, 'unacceptable' si > 30%.

**Por qué estos outputs:** `gageRRPercent` es el indicador principal: valores altos significan que el sistema de medición consume demasiada parte del presupuesto de variación total, haciendo insensibles los análisis de proceso. `repeatability` y `reproducibility` indican si el problema es del instrumento (repetibilidad) o del operador (reproducibilidad), orientando la acción correctiva. `ndc` cuantifica la resolución efectiva del gauge. `verdict` permite al agente decidir si los datos de medición de este gauge son confiables para alimentar las cartas de control.

**Sugerencia de UI:** Gráfico de análisis R&R con variación por operador y por parte (tipo stacked bar). Diagrama de dispersión de valores por operador mostrando consistencia. KPI cards para gageRRPercent, Repeatability, Reproducibility y NDC. Badge de veredicto con color (verde/amarillo/rojo) y recomendación textual de acción.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/run_msa_analysis__calculate_control_charts]] — `MSA_VALIDATED` → [[calculate_control_charts]]
**Esta tool es disparada por:**
- [[manage_device_registry]] — `NEW_DEVICE_REGISTERED` → [[../comunicaciones/manage_device_registry__run_msa_analysis]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

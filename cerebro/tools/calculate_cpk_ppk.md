---
tipo: tool
id: calculate_cpk_ppk
nombre: "Calcular Cpk y Ppk"
categoria: quality
agente: calidad-spc
estado: implementada
consume: [MEASUREMENTS_CAPTURED]
produce: [CAPABILITY_BELOW_TARGET]
programador:
actualizado: 2026-06-28
tags: [tool, quality, implementada]
---
# Calcular Cpk y Ppk
> `calculate_cpk_ppk` · Cloud · categoría **quality** · estado **implementada**
> Pertenece al agente [[../agentes/calidad-spc|Agente de Calidad & SPC]]
## Qué hace
Calcula índices de capacidad de proceso Cp, Cpk (corto plazo) y Pp, Ppk (largo plazo) con histograma de distribución.
## Contrato de eventos
- **Consume:** `MEASUREMENTS_CAPTURED`
- **Produce:** `CAPABILITY_BELOW_TARGET`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `characteristicId` para identificar la característica y recuperar metadatos como nombre, unidad y si es CTQ. `measurements` es el conjunto de datos sobre el cual se calculará la distribución: se recomienda mínimo 30 datos para estimaciones estables. `usl` y `lsl` (límites de especificación) son obligatorios porque los índices de capacidad no tienen sentido sin una especificación de referencia; la precisión de estos valores impacta directamente el resultado.

**Cálculos:** Calcular media (X̄) y desviación estándar (s) de `measurements`. Para Cp = (usl - lsl) / (6s). Cpk = min[(usl - X̄)/(3s), (X̄ - lsl)/(3s)]. Para Pp y Ppk usar la desviación estándar total (largo plazo), calculada desde todos los datos sin agrupación por subgrupos. `sigmaLevel` = Cpk × 3. `ppmDefects` = (1 - P(lsl < X < usl)) × 1,000,000 usando la distribución normal acumulada. `status`: 'capable' si Cpk >= 1.33, 'marginal' si 1.00-1.33, 'not_capable' si < 1.00.

**Por qué estos outputs:** `cpk` es el índice más crítico porque considera el centrado del proceso respecto a la especificación; un Cpk bajo con Cp alto indica descentrado que el agente debe corregir ajustando el setpoint. `ppk` (largo plazo) siempre será menor que Cpk y refleja el desempeño real incluyendo variación entre turnos y días. `ppmDefects` traduce la capacidad estadística a impacto de negocio (defectos por millón). `status` permite al agente decidir si liberar producción o escalar para acción correctiva.

**Sugerencia de UI:** Histograma de distribución de mediciones con curva normal superpuesta y líneas verticales de LSL, Nominal y USL. Panel derecho con KPI cards para Cp, Cpk, Pp, Ppk, Sigma Level y PPM. Badge de status (verde=capable, amarillo=marginal, rojo=not_capable). Indicador de centrado del proceso (distancia de X̄ al nominal en % del rango de tolerancia).
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/calculate_cpk_ppk__manage_product_specs]] — `CAPABILITY_BELOW_TARGET` → [[manage_product_specs]]
**Esta tool es disparada por:**
- [[collect_quality_measurements]] — `MEASUREMENTS_CAPTURED` → [[../comunicaciones/collect_quality_measurements__calculate_cpk_ppk]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

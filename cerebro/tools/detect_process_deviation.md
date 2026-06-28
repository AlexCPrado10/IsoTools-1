---
tipo: tool
id: detect_process_deviation
nombre: "Detectar Desviación de Proceso"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: [ANOMALY_CONFIRMED]
produce: [DEVIATION_DETECTED]
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Detectar Desviación de Proceso
> `detect_process_deviation` · Cloud · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Detecta desviaciones en parámetros de proceso industrial usando control estadístico de proceso.
## Contrato de eventos
- **Consume:** `ANOMALY_CONFIRMED`
- **Produce:** `DEVIATION_DETECTED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** processId identifica el proceso industrial específico (mezcla, laminado, tratamiento térmico, etc.) con sus parámetros de control configurados. parameters es el snapshot actual de los parámetros de proceso (temperatura, presión, velocidad, pH, etc.) que el agente compara contra los límites de control establecidos.

**Cálculos:** Comparar cada parámetro en parameters contra sus límites de control (UCL, LCL) definidos en el plan de control del proceso. Aplicar reglas de Nelson para detectar tendencias: punto fuera de control, 7 puntos consecutivos del mismo lado de la media. Calcular el índice Cpk = min((USL-µ)/(3σ), (µ-LSL)/(3σ)) para cada parámetro.

**Por qué estos outputs:** deviationDetected dispara una alerta para que el operador revise y corrija el proceso antes de producir defectos. outOfControlParameters lista exactamente qué parámetros están fuera de control para que el operador sepa qué ajustar. cpkValue cuantifica la capacidad del proceso: Cpk > 1.33 es aceptable, < 1.0 requiere acción inmediata.

**Sugerencia de UI:** Gráficas de control (control charts) en tiempo real para cada parámetro con UCL, LCL y media. Puntos fuera de control resaltados en rojo. Tabla de parámetros con Cpk y estado. Alarma visual y sonora cuando deviationDetected=true.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/detect_process_deviation__optimize_production_sequence]] — `DEVIATION_DETECTED` → [[optimize_production_sequence]]
**Esta tool es disparada por:**
- [[detect_real_time_anomalies]] — `ANOMALY_CONFIRMED` → [[../comunicaciones/detect_real_time_anomalies__detect_process_deviation]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

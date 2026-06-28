---
tipo: tool
id: analyze_control_loop_performance
nombre: "Analizar Desempeño de Lazo de Control"
categoria: control
agente: control-scada
estado: catalogo
consume: [HISTORIAN_BATCH_READY]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, control, catalogo]
---
# Analizar Desempeño de Lazo de Control
> `analyze_control_loop_performance` · Cloud · categoría **control** · estado **catalogo**
> Pertenece al agente [[../agentes/control-scada|Agente de Control & SCADA]]
## Qué hace
Evalúa el desempeño de lazos PID: índice de variabilidad, tiempo en manual, saturación del controlador y sintonía óptima.
## Contrato de eventos
- **Consume:** `HISTORIAN_BATCH_READY`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `loopId` para identificar el lazo PID específico y acceder a su configuración (Kp, Ki, Kd actuales, rango de PV, setpoint histórico). `historianData` permite proveer datos pre-cargados desde el historiador sin requerirle al tool que haga la consulta directa, haciéndolo más modular y testeable. `periodHours` (default 24 h) define la ventana de análisis: períodos muy cortos pueden no capturar el comportamiento en todos los modos operativos del proceso.

**Cálculos:** Calcular `variabilityIndex` = desviación estándar de la PV normalizada por el rango del tag × 100. Calcular `timeInManualPercent` = (tiempo_en_modo_manual / tiempo_total) × 100. Detectar saturación del controlador: porcentaje de tiempo con output = 0% o 100% (indica desajuste de sintonía). Comparar variabilidad actual vs benchmarks de clase mundial para ese tipo de lazo. Determinar `performanceIndex` (0-100) ponderando: variabilidad (40%), tiempo en manual (30%), saturación (30%). Para sintonía sugerida: aplicar método IMC-PID (Internal Model Control) o método de Cohen-Coon a partir de la respuesta al escalón identificada en los datos históricos. `classification`: excellent si PI > 80, acceptable si 60-80, poor si 40-60, needs_retuning si < 40.

**Por qué estos outputs:** `performanceIndex` es el KPI sintético que permite al agente priorizar lazos que requieren atención sin analizar cada variable individualmente. `timeInManualPercent` es el indicador más importante de problemas operativos: un lazo en manual frecuentemente indica desconfianza del operador en el controlador. Los parámetros sugeridos `suggestedKp`, `suggestedKi`, `suggestedKd` habilitan al agente a proponer re-sintonía en un solo paso.

**Sugerencia de UI:** Gráfico de dispersión PV vs Setpoint con densidad de puntos para visualizar variabilidad. Gauge circular de `performanceIndex` con clasificación textual. Tabla comparativa: parámetros actuales vs sugeridos con botón de aplicar cambios con confirmación. Gráfico de barras mostrando distribución del tiempo por modo (Auto/Manual/Cascada).
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[log_process_historian]] — `HISTORIAN_BATCH_READY` → [[../comunicaciones/log_process_historian__analyze_control_loop_performance]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

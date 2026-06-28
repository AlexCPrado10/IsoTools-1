---
tipo: tool
id: predict_machine_failure
nombre: "Predecir Falla de Máquina"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: [VIBRATION_PATTERN_ANALYZED]
produce: [FAILURE_PREDICTED]
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Predecir Falla de Máquina
> `predict_machine_failure` · Cloud · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Predice fallas de máquina con días de anticipación usando modelos LSTM entrenados con histórico.
## Contrato de eventos
- **Consume:** `VIBRATION_PATTERN_ANALYZED`
- **Produce:** `FAILURE_PREDICTED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** assetId identifica el activo industrial (bomba, motor, compresor, CNC) con su historial de mantenimiento y fallas previas. sensorReadings es el snapshot actual de sensores críticos del activo (temperatura, vibración, corriente, presión de aceite) que alimentan el modelo predictivo. horizonHours define cuánto tiempo hacia adelante predecir.

**Cálculos:** Consultar el servicio de mantenimiento predictivo configurado para el tipo de activo (IBM Maximo APM, SAP PM Predictive, AWS Lookout for Equipment, o el servicio local de ML). Enviar las lecturas de sensores actuales de `sensorReadings`. Obtener `failureProbability`, `estimatedTimeToFailureHours` y el tipo de falla más probable del servicio; no cargar ni ejecutar modelos ML directamente en el tool.

**Por qué estos outputs:** failureProbability permite al agente priorizar qué activos atender primero en el plan de mantenimiento. estimatedTimeToFailureHours define la ventana disponible para programar el mantenimiento sin afectar la producción. failureType permite al técnico llevar los repuestos correctos. recommendedAction es la instrucción concreta para el equipo de mantenimiento.

**Sugerencia de UI:** Tarjeta de activo con gauge de probabilidad de falla (0-100%) y color de riesgo. Línea temporal mostrando el estimatedTimeToFailure. Gráficas de tendencia de sensores clave en el tiempo. Panel de acción recomendada con tipo de mantenimiento y repuestos sugeridos.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/predict_machine_failure__generate_digital_twin_model]] — `FAILURE_PREDICTED` → [[generate_digital_twin_model]]
**Esta tool es disparada por:**
- [[analyze_vibration_patterns]] — `VIBRATION_PATTERN_ANALYZED` → [[../comunicaciones/analyze_vibration_patterns__predict_machine_failure]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

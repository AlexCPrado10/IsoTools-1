---
tipo: tool
id: detect_real_time_anomalies
nombre: "Detectar Anomalías en Tiempo Real"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: [SIGNALS_READY]
produce: [ANOMALY_CONFIRMED]
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Detectar Anomalías en Tiempo Real
> `detect_real_time_anomalies` · Edge · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Detecta anomalías en señales de proceso en tiempo real usando modelos de umbral adaptativo.
## Contrato de eventos
- **Consume:** `SIGNALS_READY`
- **Produce:** `ANOMALY_CONFIRMED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** signalId identifica la señal industrial a monitorear (temperatura, presión, vibración, corriente). value es el valor actual de la señal en el instante actual — el agente llama a esta tool en cada ciclo de muestreo para detección en tiempo real. windowSize define cuántos valores históricos usar para calcular la estadística de referencia adaptativa.

**Cálculos:** Mantener un buffer circular de los últimos windowSize valores de la señal. Calcular µ (media) y σ (desviación estándar) del buffer. Calcular Z-score = (value - µ) / σ. Si |Z-score| > adaptiveThreshold, marcar anomalyDetected=true. El umbral adaptativo se ajusta automáticamente según la tasa de falsas alarmas histórica. Calcular la severidad: low (3σ), medium (4σ), high (5σ).

**Por qué estos outputs:** anomalyDetected es el flag que dispara la acción inmediata del agente (alerta, ajuste de proceso, paro preventivo). zscore cuantifica qué tan anómalo es el valor actual — el agente lo usa para priorizar cuál de múltiples anomalías simultáneas atender primero. adaptiveThreshold permite al operador calibrarlo manualmente si es necesario. severity determina la respuesta del agente.

**Sugerencia de UI:** Gráfica de señal en tiempo real con banda de control (µ ± nσ) en transparente. Punto actual resaltado si es anomalía. Gauge de Z-score con zonas de color. Contador de anomalías en el turno con tasa de falsas alarmas. Panel de configuración del umbral adaptativo.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/detect_real_time_anomalies__detect_process_deviation]] — `ANOMALY_CONFIRMED` → [[detect_process_deviation]]
**Esta tool es disparada por:**
- [[collect_process_signals]] — `SIGNALS_READY` → [[../comunicaciones/collect_process_signals__detect_real_time_anomalies]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

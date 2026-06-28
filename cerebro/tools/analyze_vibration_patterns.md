---
tipo: tool
id: analyze_vibration_patterns
nombre: "Analizar Patrones de Vibración"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: [VIBRATION_SAMPLES_READY]
produce: [VIBRATION_PATTERN_ANALYZED]
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Analizar Patrones de Vibración
> `analyze_vibration_patterns` · Cloud · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Analiza espectros de frecuencia de vibraciones para identificar firmas de falla específicas.
## Contrato de eventos
- **Consume:** `VIBRATION_SAMPLES_READY`
- **Produce:** `VIBRATION_PATTERN_ANALYZED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** assetId para cargar el historial de vibración del activo y los umbrales de alarma configurados para ese tipo de máquina. vibrationData es la señal de vibración cruda capturada por el acelerómetro (array de muestras en g). samplingRateHz es la frecuencia de muestreo que permite calcular el espectro de frecuencias correctamente (debe cumplir el criterio de Nyquist).

**Cálculos:** Enviar los datos de vibración `vibrationData` y la frecuencia de muestreo al servicio de análisis de vibraciones configurado (SKF Enlight, Emerson AMS, Brüel & Kjær Insight, o el módulo de análisis de señales de la plataforma). Obtener: espectro de frecuencias, valor RMS, frecuencia dominante y `failureSignature` identificada por el servicio (BPFO/BPFI/BSF para rodamientos, frecuencias de engranajes, desbalanceo). No implementar FFT en el tool; delegar en el servicio de análisis de señales.

**Por qué estos outputs:** dominantFrequency y failureSignature permiten al técnico de mantenimiento identificar el componente específico que está fallando sin necesidad de desmontar la máquina. rmsValue es el KPI de condición que se monitorea en tendencia: un rmsValue creciente indica deterioro acelerado. severity determina la urgencia de la intervención.

**Sugerencia de UI:** Gráfica de espectro de frecuencias (FFT) con marcadores en las frecuencias características del activo. Gráfica de señal temporal de vibración. Indicador de RMS con histórico y tendencia. Tabla de frecuencias características con estado (normal/alerta/crítico).
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/analyze_vibration_patterns__predict_machine_failure]] — `VIBRATION_PATTERN_ANALYZED` → [[predict_machine_failure]]
**Esta tool es disparada por:**
- [[collect_vibration_data]] — `VIBRATION_SAMPLES_READY` → [[../comunicaciones/collect_vibration_data__analyze_vibration_patterns]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

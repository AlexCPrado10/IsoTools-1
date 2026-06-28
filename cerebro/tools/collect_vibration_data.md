---
tipo: tool
id: collect_vibration_data
nombre: "Recolectar Datos de Vibración"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: []
produce: [VIBRATION_SAMPLES_READY]
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Recolectar Datos de Vibración
> `collect_vibration_data` · Edge · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Adquiere señales de sensores de vibración MEMS/piezoelétricos a alta frecuencia de muestreo.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `VIBRATION_SAMPLES_READY`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** sensorId identifica el acelerómetro específico instalado en el activo (rodamiento, carcasa, eje) — cada sensor tiene su propia posición y orientación que determina qué fallas puede detectar. samplingRateHz debe ser al menos el doble de la frecuencia máxima de interés (criterio de Nyquist). durationMs define cuánto tiempo capturar para obtener suficientes ciclos de vibración para el análisis FFT.

**Cálculos:** Comunicar con el acelerómetro usando su protocolo de adquisición (USB, Ethernet, módulo DAQ). Configurar la tasa de muestreo y la duración. Capturar el array de muestras de aceleración en unidades de g (gravedad). Verificar la calidad de los datos (sin saturación, sin ruido excesivo). El array se pasa a analyze_vibration_patterns para el análisis FFT.

**Por qué estos outputs:** samples es el array de datos crudos que analyze_vibration_patterns necesita para calcular el espectro FFT y detectar firmas de falla. samplingRateHz se incluye en la salida porque es necesario para interpretar correctamente el espectro de frecuencias resultante. timestamp permite sincronizar la medición con el estado operativo del activo.

**Sugerencia de UI:** Gráfica de señal temporal de vibración en tiempo real durante la captura. Indicador de calidad de señal (saturación, ruido). Historial de capturas recientes por sensor. Botón de captura manual y configuración de captura periódica automática.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/collect_vibration_data__analyze_vibration_patterns]] — `VIBRATION_SAMPLES_READY` → [[analyze_vibration_patterns]]
- [[../comunicaciones/collect_vibration_data__run_local_inference]] — `VIBRATION_SAMPLES_READY` → [[run_local_inference]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

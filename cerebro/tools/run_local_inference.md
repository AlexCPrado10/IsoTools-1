---
tipo: tool
id: run_local_inference
nombre: "Ejecutar Inferencia Local"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: [VIBRATION_SAMPLES_READY]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Ejecutar Inferencia Local
> `run_local_inference` · Edge · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Ejecuta modelos ML embebidos (ONNX/TensorFlow Lite) en el edge con latencia < 10ms.
## Contrato de eventos
- **Consume:** `VIBRATION_SAMPLES_READY`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** modelId identifica el modelo de ML desplegado en el edge (previamente entrenado en el cloud y descargado al dispositivo edge). inputTensor es el vector de características numéricas preparado para el modelo (datos de sensores normalizados, features de vibración, etc.). modelFormat especifica el runtime de inferencia: ONNX Runtime para modelos multi-framework, TFLite para dispositivos con recursos muy limitados.

**Cálculos:** Cargar el modelo desde el repositorio local usando modelId. Verificar que el inputTensor tiene la forma correcta (dimensiones esperadas por el modelo). Ejecutar el motor de inferencia correspondiente a modelFormat (ONNX Runtime o TFLite Interpreter). Medir el tiempo de inferencia para monitorear la latencia. Devolver la predicción en el formato de salida del modelo.

**Por qué estos outputs:** prediction contiene el resultado del modelo (ej: {failure_class: 'bearing', probability: 0.87, recommended_action: 'schedule_maintenance'}). inferenceTimeMs es crítico para verificar que la inferencia cumple los requisitos de latencia en tiempo real (< 50ms para muchas aplicaciones de control). modelVersion permite auditar qué versión del modelo tomó cada decisión.

**Sugerencia de UI:** Panel de inferencia con entrada (tensor de sensores) y salida (predicción) en formato tarjeta. Indicador de latencia de inferencia con umbral configurable. Historial de predicciones recientes con timestamp y confianza. Alerta si la latencia supera el umbral máximo.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[collect_vibration_data]] — `VIBRATION_SAMPLES_READY` → [[../comunicaciones/collect_vibration_data__run_local_inference]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

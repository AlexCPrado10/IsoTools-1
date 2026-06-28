---
tipo: tool
id: train_vision_model
nombre: "Entrenar Modelo de Visión"
categoria: vision
agente: vision-artificial-industrial
estado: catalogo
consume: [PATTERN_ANALYSIS_COMPLETE]
produce: [MODEL_TRAINED]
programador:
actualizado: 2026-06-28
tags: [tool, vision, catalogo]
---
# Entrenar Modelo de Visión
> `train_vision_model` · Cloud · categoría **vision** · estado **catalogo**
> Pertenece al agente [[../agentes/vision-artificial-industrial|Agente de Visión Artificial Industrial]]
## Qué hace
Entrena modelos CNN en la nube con nuevas imágenes de defectos para mejorar la detección.
## Contrato de eventos
- **Consume:** `PATTERN_ANALYSIS_COMPLETE`
- **Produce:** `MODEL_TRAINED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** datasetId identifica el dataset de imágenes etiquetadas en el sistema de gestión de datos — puede incluir imágenes de defectos nuevos capturados en producción. baseModelId es el modelo preentrenado a usar como punto de partida (transfer learning) para acelerar el entrenamiento. epochs define cuántas pasadas completas sobre el dataset realizará el entrenamiento.

**Cálculos:** Enviar la solicitud de entrenamiento al servicio de ML configurado (Azure Machine Learning, AWS SageMaker, NVIDIA TAO Toolkit, o la plataforma MLOps del entorno). Pasar `modelType`, `datasetId` y `trainingConfig`. El servicio gestiona pre-procesamiento, data augmentation, entrenamiento y evaluación. Obtener el `modelId` del modelo entrenado junto con las métricas `accuracy` y `mAP` reportadas por la plataforma; no implementar el ciclo de entrenamiento en el tool.

**Por qué estos outputs:** modelId es la referencia que se usa en inspect_product_quality para cargar este modelo en el edge. accuracy y mAP determinan si el modelo está listo para producción. trainingTimeMinutes es informativo para planificar los ciclos de reentrenamiento.

**Sugerencia de UI:** Panel de entrenamiento con gráficas de loss y accuracy por epoch (curvas de entrenamiento y validación). Métricas finales: accuracy, mAP, tiempo de entrenamiento. Comparativa con el modelo anterior. Botón de desplegar al edge si métricas superan el umbral.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/train_vision_model__improve_detection_model]] — `MODEL_TRAINED` → [[improve_detection_model]]
**Esta tool es disparada por:**
- [[analyze_visual_patterns]] — `PATTERN_ANALYSIS_COMPLETE` → [[../comunicaciones/analyze_visual_patterns__train_vision_model]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

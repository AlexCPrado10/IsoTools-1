---
tipo: tool
id: improve_detection_model
nombre: "Mejorar Modelo de Detección"
categoria: vision
agente: vision-artificial-industrial
estado: catalogo
consume: [MODEL_TRAINED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, vision, catalogo]
---
# Mejorar Modelo de Detección
> `improve_detection_model` · Cloud · categoría **vision** · estado **catalogo**
> Pertenece al agente [[../agentes/vision-artificial-industrial|Agente de Visión Artificial Industrial]]
## Qué hace
Aplica transfer learning y fine-tuning para mejorar un modelo de detección existente.
## Contrato de eventos
- **Consume:** `MODEL_TRAINED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** modelId identifica el modelo en producción que se quiere mejorar con nuevos datos recopilados. newSamplesCount indica cuántos ejemplos nuevos se han añadido al dataset (defectos nuevos, casos difíciles, otras condiciones de iluminación) para evaluar si vale la pena reentrenar.

**Cálculos:** Enviar la solicitud de fine-tuning incremental al mismo servicio de ML que `train_vision_model`. Pasar el `modelId` base y el `datasetId` con los nuevos ejemplos. El servicio ejecuta el fine-tuning preservando el conocimiento previo del modelo base. Obtener el nuevo `modelId`, las métricas de mejora y el flag `deployReady` del resultado de la plataforma ML; no implementar fine-tuning en el tool.

**Por qué estos outputs:** newModelId es el identificador del modelo mejorado que reemplazará al anterior en producción. accuracyImprovement cuantifica el beneficio del reentrenamiento. deployReady es el flag que autoriza el despliegue automático al edge sin intervención humana.

**Sugerencia de UI:** Comparativa visual: modelo actual vs nuevo con métricas side-by-side. Ejemplos de imágenes donde el nuevo modelo mejora la detección. Botón de aprobar despliegue con indicador de impacto esperado. Historial de versiones del modelo con accuracy histórica.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[train_vision_model]] — `MODEL_TRAINED` → [[../comunicaciones/train_vision_model__improve_detection_model]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

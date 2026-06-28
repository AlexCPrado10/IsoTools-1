---
tipo: tool
id: capture_video_stream
nombre: "Capturar Stream de Video"
categoria: vision
agente: vision-artificial-industrial
estado: catalogo
consume: []
produce: [FRAME_CAPTURED, CONVEYOR_FRAME]
programador:
actualizado: 2026-06-28
tags: [tool, vision, catalogo]
---
# Capturar Stream de Video
> `capture_video_stream` · Edge · categoría **vision** · estado **catalogo**
> Pertenece al agente [[../agentes/vision-artificial-industrial|Agente de Visión Artificial Industrial]]
## Qué hace
Captura y preprocesa frames de cámaras industriales GigE Vision / USB3 Vision para análisis.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `FRAME_CAPTURED`, `CONVEYOR_FRAME`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** cameraId identifica la cámara fuente en el sistema de gestión de cámaras (ONVIF, RTSP). fps define la tasa de captura — mayor fps captura movimientos rápidos pero consume más ancho de banda y CPU. resolution define la calidad de imagen requerida: mayor resolución para detectar defectos pequeños, menor para conteo de personas.

**Cálculos:** Conectar al stream de la cámara usando el protocolo configurado (RTSP, ONVIF, GStreamer). Capturar un frame según los parámetros fps/resolution. Comprimir el frame (JPEG/WebP) para transmisión eficiente. Asignar un frameId único (timestamp + cameraId). Calcular sizeKb del frame comprimido para monitorear el ancho de banda utilizado.

**Por qué estos outputs:** frameId permite a las tools de visión (inspect_product_quality, detect_safety_violations) referenciar el frame específico en los resultados. timestamp sincroniza el frame con otros sensores para análisis multimodal. width, height y sizeKb permiten al sistema verificar que la calidad de imagen es suficiente antes de ejecutar inferencia.

**Sugerencia de UI:** Vista en vivo del stream con overlay de metadatos (cameraId, fps, resolución). Indicador de latencia del stream. Selector de calidad (resolución/fps). Botón de snapshot que guarda el frame actual con su frameId.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/capture_video_stream__inspect_product_quality]] — `FRAME_CAPTURED` → [[inspect_product_quality]]
- [[../comunicaciones/capture_video_stream__detect_safety_violations]] — `FRAME_CAPTURED` → [[detect_safety_violations]]
- [[../comunicaciones/capture_video_stream__count_items_on_conveyor]] — `CONVEYOR_FRAME` → [[count_items_on_conveyor]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

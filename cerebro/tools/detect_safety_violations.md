---
tipo: tool
id: detect_safety_violations
nombre: "Detectar Violaciones de Seguridad"
categoria: vision
agente: vision-artificial-industrial
estado: catalogo
consume: [FRAME_CAPTURED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, vision, catalogo]
---
# Detectar Violaciones de Seguridad
> `detect_safety_violations` · Edge · categoría **vision** · estado **catalogo**
> Pertenece al agente [[../agentes/vision-artificial-industrial|Agente de Visión Artificial Industrial]]
## Qué hace
Detecta violaciones de EPP (casco, chaleco, gafas) y zonas restringidas en tiempo real.
## Contrato de eventos
- **Consume:** `FRAME_CAPTURED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** cameraId identifica la cámara de seguridad instalada en la zona de trabajo. checkItems lista los EPPs a verificar para esa zona específica (zona de soldadura requiere casco + visera + guantes; zona de químicos requiere traje completo). El agente solo verifica lo que es relevante para cada área.

**Cálculos:** Detectar personas en el frame usando un detector de personas (YOLOv8 o similar). Para cada persona detectada, analizar si porta cada item de checkItems usando un clasificador específico por EPP. Si algún EPP requerido está ausente, marcar violationDetected=true.

**Por qué estos outputs:** violationDetected dispara una alerta inmediata (alarma sonora, notificación al supervisor, registro fotográfico). violationType especifica qué EPP falta para que la alerta sea accionable. personId (si el sistema tiene identificación facial) permite notificar al trabajador específico. zoneId permite correlacionar violaciones por área para identificar zonas de alto riesgo.

**Sugerencia de UI:** Vista de cámara con overlay: bounding box verde para personas correctas, rojo con ícono del EPP faltante para violaciones. Panel de alertas activas con foto del incidente, zona y tipo. Histórico de violaciones por zona y turno. Botón de notificar al supervisor.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[capture_video_stream]] — `FRAME_CAPTURED` → [[../comunicaciones/capture_video_stream__detect_safety_violations]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: monitor_worker_posture
nombre: "Monitorear Postura del Trabajador"
categoria: vision
agente: vision-artificial-industrial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, vision, catalogo]
---
# Monitorear Postura del Trabajador
> `monitor_worker_posture` · Edge · categoría **vision** · estado **catalogo**
> Pertenece al agente [[../agentes/vision-artificial-industrial|Agente de Visión Artificial Industrial]]
## Qué hace
Analiza la postura ergonómica de trabajadores para prevenir lesiones musculoesqueléticas.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** cameraId para capturar el video del trabajador. workerId permite personalizar los umbrales de riesgo según el historial de salud del trabajador y el tipo de tarea que está realizando — un ergónomo puede configurar umbrales más estrictos para trabajadores con historial de lesiones musculoesqueléticas.

**Cálculos:** Aplicar un estimador de pose corporal (MediaPipe Pose o OpenPose) para detectar los 33 keypoints del cuerpo. Calcular ángulos articulares: ángulo de cuello, ángulo de espalda, ángulo de hombros. Aplicar el método RULA o REBA para calcular un score de riesgo ergonómico global (0-100). Generar recommendations basadas en las articulaciones en posición de riesgo.

**Por qué estos outputs:** postureScore es el indicador que el sistema de seguridad usa para acumular tiempo de exposición ergonómica por trabajador. riskLevel determina si el agente debe interrumpir la actividad (critical), alertar al supervisor (high) o solo registrar (low/medium). recommendations son instrucciones específicas que el agente puede mostrar al trabajador en tiempo real.

**Sugerencia de UI:** Esqueleto 3D animado del trabajador con articulaciones coloreadas por nivel de riesgo (verde/amarillo/rojo). Gauge de postureScore y riskLevel. Lista de recomendaciones ergonómicas con íconos. Histórico de exposición acumulada por articulación en el turno.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

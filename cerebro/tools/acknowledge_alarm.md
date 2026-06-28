---
tipo: tool
id: acknowledge_alarm
nombre: "Reconocer Alarma"
categoria: control
agente: control-scada
estado: catalogo
consume: [ALARM_ACTIVATED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, control, catalogo]
---
# Reconocer Alarma
> `acknowledge_alarm` · Edge · categoría **control** · estado **catalogo**
> Pertenece al agente [[../agentes/control-scada|Agente de Control & SCADA]]
## Qué hace
Permite al operador reconocer, shelving o suprimir alarmas con trazabilidad de acción según ISA-18.2.
## Contrato de eventos
- **Consume:** `ALARM_ACTIVATED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `alarmId` para identificar exactamente qué alarma se está gestionando de entre las múltiples que pueden estar activas simultáneamente. `action` distingue entre reconocer (la alarma sigue activa pero el operador está informado), shelving (supresión temporal con duración definida) y suppress (supresión permanente hasta habilitación explícita), cada una con impacto diferente en la seguridad del proceso. `operatorId` es obligatorio para la trazabilidad ISA-18.2: toda acción sobre una alarma debe quedar registrada con el responsable. `comment` captura el contexto del operador (qué acción tomó, por qué suprimió) para el análisis posterior de la gestión de alarmas.

**Cálculos:** Recuperar el estado actual de la alarma (`previousState`). Validar que la transición de estado solicitada es válida según la máquina de estados ISA-18.2 (ej: no se puede shelve una alarma ya acknowledged sin desacknowledge primero). Para 'shelve': registrar duración de shelving (default 8 horas, configurable). Actualizar `newState` en la base de datos de alarmas. Registrar en el log de acciones de alarmas: alarmId, operatorId, action, comment, actionTimestamp. Para 'acknowledge': si la condición ya no existe, pasar a estado 'clear'; si persiste, pasar a 'acknowledged'.

**Por qué estos outputs:** `previousState` y `newState` permiten al agente verificar que la transición fue la esperada y actualizar su modelo del estado del proceso. `actionTimestamp` es el punto de referencia para medir el tiempo de respuesta del operador (KPI de gestión de alarmas). `logged: true` confirma la integridad del registro para auditorías de seguridad de proceso.

**Sugerencia de UI:** Modal de confirmación de acción de alarma con: detalle de la alarma (tag, valor, tiempo activo), selector de acción (ACK/Shelve/Suppress) con descripción de cada opción, campo de comentario obligatorio y confirmación. Toast de éxito con el nuevo estado. Historial de acciones de la alarma visible en un panel lateral.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[trigger_process_alarm]] — `ALARM_ACTIVATED` → [[../comunicaciones/trigger_process_alarm__acknowledge_alarm]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

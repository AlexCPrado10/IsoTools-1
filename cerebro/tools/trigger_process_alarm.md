---
tipo: tool
id: trigger_process_alarm
nombre: "Disparar Alarma de Proceso"
categoria: control
agente: control-scada
estado: catalogo
consume: [TAG_LIMIT_EXCEEDED]
produce: [ALARM_ACTIVATED]
programador:
actualizado: 2026-06-28
tags: [tool, control, catalogo]
---
# Disparar Alarma de Proceso
> `trigger_process_alarm` · Edge · categoría **control** · estado **catalogo**
> Pertenece al agente [[../agentes/control-scada|Agente de Control & SCADA]]
## Qué hace
Genera y prioriza alarmas de proceso según ISA-18.2: HIHI, HI, LO, LOLO, con supresión de shelving y gestión de inundación.
## Contrato de eventos
- **Consume:** `TAG_LIMIT_EXCEEDED`
- **Produce:** `ALARM_ACTIVATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `tagId` para identificar la variable de proceso que dispara la alarma y vincularla al P&ID correcto. `alarmType` (HIHI, HI, LO, LOLO, deviation, rate_of_change) determina la prioridad según ISA-18.2: HIHI y LOLO son alarmas críticas de seguridad, HI y LO son de proceso. `value` es el valor actual de la variable en el momento del disparo, necesario para calcular la desviación respecto al threshold y generar el mensaje de alarma contextual. `threshold` permite validar si la condición persiste o fue transitoria antes de activar la alarma.

**Cálculos:** Verificar que `value` cruza `threshold` en la dirección correcta (HI: value > threshold, LO: value < threshold, rate_of_change: |delta/dt| > threshold). Aplicar histéresis del 2% del rango para evitar chatter de alarma. Asignar `priority` según jerarquía ISA-18.2: HIHI/LOLO → critical, HI/LO → high, deviation → medium, rate_of_change → low. Verificar si la alarma ya existe y está activa (deduplicación). Aplicar lógica de shelving si el tag está en lista de supresión temporal. Registrar `activatedAt` con timestamp preciso. Determinar `requiredAction` desde tabla de respuesta a alarmas del P&ID. Enviar notificación (OWS, SMS, email) según árbol de escalado.

**Por qué estos outputs:** `alarmId` es la referencia para el subsecuente acknowledge y para correlacionar con la causa en el sistema de análisis de alarmas. `priority` guía la urgencia de respuesta del operador; el agente puede actuar autónomamente solo en alarmas low y medium, escalando critical y high al operador. `requiredAction` es la instrucción operacional pre-definida. `notificationSent` confirma que el equipo fue alertado.

**Sugerencia de UI:** Banner de alarma activa en la parte superior de la pantalla con color por prioridad (rojo parpadeante=critical, naranja=high). Lista de alarmas activas ordenadas por prioridad con columnas: Tag, Tipo, Valor, Threshold, Tiempo activo y Acción requerida. Botón de reconocimiento (ACK) en cada fila. Contador de alarmas activas por prioridad en la barra de navegación.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/trigger_process_alarm__acknowledge_alarm]] — `ALARM_ACTIVATED` → [[acknowledge_alarm]]
**Esta tool es disparada por:**
- [[monitor_scada_tags]] — `TAG_LIMIT_EXCEEDED` → [[../comunicaciones/monitor_scada_tags__trigger_process_alarm]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

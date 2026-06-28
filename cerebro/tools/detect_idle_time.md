---
tipo: tool
id: detect_idle_time
nombre: "Detectar Tiempo Muerto"
categoria: production
agente: produccion-avanzada
estado: catalogo
consume: [MACHINE_STATE_UPDATED]
produce: [IDLE_TIME_DETECTED, IDLE_PATTERN_DETECTED]
programador:
actualizado: 2026-06-28
tags: [tool, production, catalogo]
---
# Detectar Tiempo Muerto
> `detect_idle_time` · Edge · categoría **production** · estado **catalogo**
> Pertenece al agente [[../agentes/produccion-avanzada|Agente de Producción Avanzada]]
## Qué hace
Detecta y registra tiempos muertos en máquinas, clasificando automáticamente la causa.
## Contrato de eventos
- **Consume:** `MACHINE_STATE_UPDATED`
- **Produce:** `IDLE_TIME_DETECTED`, `IDLE_PATTERN_DETECTED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** machineId para consultar las señales de la máquina y determinar si está produciendo o no. minIdleSeconds define el tiempo mínimo de inactividad para considerar que es un paro real vs una microparada normal entre piezas — en líneas de alta velocidad pueden haber interrupciones breves que no son paros reales.

**Cálculos:** Monitorear la señal de ciclo de producción del machineId (señal digital del PLC que pulsa cada vez que completa una pieza). Si la señal no pulsa durante más de minIdleSeconds, marcar idleDetected=true y comenzar a contar idleDurationSeconds. Consultar el sistema SCADA para intentar determinar la cause: si hay una alarma activa = cause de la alarma, si no hay alarma pero está parada = 'sin causa registrada'.

**Por qué estos outputs:** idleDetected dispara una notificación inmediata al supervisor del área para que investigue el paro. idleDurationSeconds permite al agente escalar la alerta: paros < 5 min son normales, paros > 30 min son inusuales y requieren intervención de mantenimiento. cause permite al agente tomar acción específica o registrar automáticamente el paro con su causa en el sistema MES.

**Sugerencia de UI:** Indicador prominente de PARADA con tiempo acumulado en formato MM:SS. Botón de registrar causa de paro con lista de causas predefinidas. Histórico de paros del turno con duración por evento. Alerta escalada visualmente según la duración (amarillo > 5min, rojo > 30min).
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/detect_idle_time__optimize_production_flow]] — `IDLE_TIME_DETECTED` → [[optimize_production_flow]]
- [[../comunicaciones/detect_idle_time__simulate_bottlenecks]] — `IDLE_PATTERN_DETECTED` → [[simulate_bottlenecks]]
**Esta tool es disparada por:**
- [[track_machine_state]] — `MACHINE_STATE_UPDATED` → [[../comunicaciones/track_machine_state__detect_idle_time]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: track_machine_state
nombre: "Rastrear Estado de Máquina"
categoria: production
agente: produccion-avanzada
estado: catalogo
consume: [PRODUCTION_DATA_CAPTURED]
produce: [MACHINE_STATE_UPDATED]
programador:
actualizado: 2026-06-28
tags: [tool, production, catalogo]
---
# Rastrear Estado de Máquina
> `track_machine_state` · Edge · categoría **production** · estado **catalogo**
> Pertenece al agente [[../agentes/produccion-avanzada|Agente de Producción Avanzada]]
## Qué hace
Rastrea el estado operativo de máquinas (produciendo, en pausa, en falla, setup) en tiempo real.
## Contrato de eventos
- **Consume:** `PRODUCTION_DATA_CAPTURED`
- **Produce:** `MACHINE_STATE_UPDATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** machineId identifica la máquina cuyo estado se quiere consultar en tiempo real. Esta tool no requiere más parámetros porque el estado se determina directamente desde la máquina a través de sus señales digitales (señal de producción, señal de alarma, señal de mantenimiento) ya registradas en el sistema.

**Cálculos:** Consultar las señales digitales del PLC o sistema SCADA de machineId: la combinación de señales determina el estado: señal de ciclo activa + sin alarma = 'running', sin señal de ciclo + sin alarma = 'idle', señal de alarma = 'fault', flag de mantenimiento = 'maintenance'. Calcular stateDurationMs como la diferencia entre el timestamp actual y stateStartedAt.

**Por qué estos outputs:** state es el dato fundamental para el cálculo del OEE (componente Availability). stateDurationMs indica cuánto tiempo lleva la máquina en ese estado — una máquina en 'fault' por más de 10 minutos sin intervención dispara una escalación automática. El agente usa state para decidir si ejecutar acciones (no se ejecutan ajustes en máquinas en 'fault').

**Sugerencia de UI:** Ícono de máquina con color dinámico según estado: verde (running), gris (idle), rojo (fault), naranja (maintenance). Tiempo en el estado actual con contador en tiempo real. Histórico de estados del turno como timeline de colores. Dashboard de planta con estado de todas las máquinas.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/track_machine_state__detect_idle_time]] — `MACHINE_STATE_UPDATED` → [[detect_idle_time]]
**Esta tool es disparada por:**
- [[collect_production_data]] — `PRODUCTION_DATA_CAPTURED` → [[../comunicaciones/collect_production_data__track_machine_state]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

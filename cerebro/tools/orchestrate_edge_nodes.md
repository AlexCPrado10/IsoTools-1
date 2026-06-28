---
tipo: tool
id: orchestrate_edge_nodes
nombre: "Orquestar Nodos Edge"
categoria: infrastructure
agente: infraestructura-edge
estado: catalogo
consume: [SIGNAL_DIGITIZED, DEVICE_STATE_CHANGED]
produce: [NODE_STATUS_REPORT]
programador:
actualizado: 2026-06-28
tags: [tool, infrastructure, catalogo]
---
# Orquestar Nodos Edge
> `orchestrate_edge_nodes` · Edge · categoría **infrastructure** · estado **catalogo**
> Pertenece al agente [[../agentes/infraestructura-edge|Agente de Infraestructura & Edge]]
## Qué hace
Coordina múltiples nodos edge, gestiona su ciclo de vida y balancea carga de trabajo.
## Contrato de eventos
- **Consume:** `SIGNAL_DIGITIZED`, `DEVICE_STATE_CHANGED`
- **Produce:** `NODE_STATUS_REPORT`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** clusterName identifica el clúster de nodos edge (ej: 'planta-monterrey-linea-1') para gestionar un conjunto lógico de dispositivos edge de forma unificada. nodes lista los nodos del clúster con su rol: algunos son nodos de procesamiento (inference), otros de recolección (data collectors), otros de actuación (actuators).

**Cálculos:** Enviar health checks a cada nodeId listado en nodes (ping, API check, verificación de procesos activos). Determinar qué nodos están activos (responden en < timeout) vs offline. Calcular clusterHealth: 'healthy' si todos los nodos críticos están online, 'degraded' si hay nodos no críticos offline, 'critical' si hay nodos críticos offline. Registrar el estado en el sistema de monitoreo.

**Por qué estos outputs:** activeNodes/totalNodes permite calcular el porcentaje de disponibilidad del clúster edge. clusterHealth es el estado que el agente usa para decidir si puede continuar operando en modo autónomo o necesita escalar al equipo de IT. En estado 'critical', el agente puede automáticamente redirigir cargas de trabajo a nodos alternativos.

**Sugerencia de UI:** Mapa de planta con nodos edge representados como puntos en su ubicación física, coloreados por estado (verde=online, rojo=offline, amarillo=degradado). Panel de clúster con contadores y clusterHealth. Lista de nodos con última vez visto online y causa del offline si aplica.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/orchestrate_edge_nodes__monitor_edge_health]] — `NODE_STATUS_REPORT` → [[monitor_edge_health]]
**Esta tool es disparada por:**
- [[digitize_analog_signals]] — `SIGNAL_DIGITIZED` → [[../comunicaciones/digitize_analog_signals__orchestrate_edge_nodes]]
- [[manage_edge_devices]] — `DEVICE_STATE_CHANGED` → [[../comunicaciones/manage_edge_devices__orchestrate_edge_nodes]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

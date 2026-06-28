---
tipo: tool
id: monitor_edge_health
nombre: "Monitorear Salud del Edge"
categoria: infrastructure
agente: infraestructura-edge
estado: catalogo
consume: [NODE_STATUS_REPORT]
produce: [HEALTH_REPORT_READY]
programador:
actualizado: 2026-06-28
tags: [tool, infrastructure, catalogo]
---
# Monitorear Salud del Edge
> `monitor_edge_health` · Cloud · categoría **infrastructure** · estado **catalogo**
> Pertenece al agente [[../agentes/infraestructura-edge|Agente de Infraestructura & Edge]]
## Qué hace
Monitorea el estado de salud de todos los nodos edge: CPU, memoria, conectividad y errores.
## Contrato de eventos
- **Consume:** `NODE_STATUS_REPORT`
- **Produce:** `HEALTH_REPORT_READY`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** fleetId identifica el grupo de dispositivos edge a monitorear (toda la planta, una línea específica, o un tipo de dispositivo). alertThresholds define los límites de recursos que disparan alertas: cpuPercent máximo antes de que el dispositivo se sature, memPercent límite de RAM disponible, diskPercent para detectar discos que se están llenando.

**Cálculos:** Consultar las métricas de recursos de cada nodo en la flota (CPU, memoria, disco, temperatura, latencia de red) vía el agente de monitoreo instalado en cada dispositivo. Comparar cada métrica contra alertThresholds. Clasificar cada nodo como 'healthy', 'degraded' o 'critical'. Agregar el estado de la flota: nodesOnline/nodesOffline. Generar el array alerts para los nodos que superen algún threshold.

**Por qué estos outputs:** nodesOnline/nodesOffline es el KPI de disponibilidad de la infraestructura edge. alerts lista los problemas concretos a atender para que el agente o el equipo de IT tomen acción antes de que fallen los nodos. healthySince permite calcular el uptime de la flota. El agente puede ordenar un reinicio automático de nodos en estado 'degraded'.

**Sugerencia de UI:** Grid de tarjetas por nodo edge con métricas: CPU%, RAM%, Disco%, temperatura. Semáforo de salud por nodo. Gráficas de tendencia de recursos en el tiempo. Lista de alertas activas con severidad. Mapa de planta con ubicación física de cada nodo.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/monitor_edge_health__manage_device_registry]] — `HEALTH_REPORT_READY` → [[manage_device_registry]]
**Esta tool es disparada por:**
- [[orchestrate_edge_nodes]] — `NODE_STATUS_REPORT` → [[../comunicaciones/orchestrate_edge_nodes__monitor_edge_health]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: manage_device_registry
nombre: "Gestionar Registro de Dispositivos"
categoria: infrastructure
agente: infraestructura-edge
estado: implementada
consume: [HEALTH_REPORT_READY]
produce: [NEW_DEVICE_REGISTERED]
programador:
actualizado: 2026-06-28
tags: [tool, infrastructure, implementada]
---
# Gestionar Registro de Dispositivos
> `manage_device_registry` · Cloud · categoría **infrastructure** · estado **implementada**
> Pertenece al agente [[../agentes/infraestructura-edge|Agente de Infraestructura & Edge]]
## Qué hace
Mantiene el inventario central de todos los dispositivos edge, sus versiones y configuraciones.
## Contrato de eventos
- **Consume:** `HEALTH_REPORT_READY`
- **Produce:** `NEW_DEVICE_REGISTERED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** operation especifica qué hacer con el registro de dispositivos industriales del sistema. deviceData contiene el objeto con los datos del dispositivo: ID, tipo (sensor/actuador/PLC/gateway), protocolo de comunicación, ubicación física, parámetros de calibración y configuración de alertas.

**Cálculos:** Según operation: 'add' valida los campos obligatorios y genera un ID único, luego inserta en la BD. 'remove' verifica que el dispositivo no tenga datos activos o alarmas pendientes antes de eliminar. 'query' ejecuta una búsqueda flexible por los campos de deviceData proporcionados. 'list' devuelve el inventario completo con paginación.

**Por qué estos outputs:** devices es el inventario actualizado que todas las tools usan como fuente de verdad para saber qué dispositivos existen y cómo conectarse a ellos. totalDevices es el KPI del inventario para auditoría de activos. operationResult explica claramente si la operación tuvo éxito y qué se hizo, o el motivo del fallo.

**Sugerencia de UI:** Tabla de inventario con búsqueda y filtros por tipo, protocolo y ubicación. Vista de tarjetas alternativa con ícono por tipo de dispositivo. Formulario de alta/edición de dispositivo con campos dinámicos según el tipo. Exportar inventario completo a Excel/CSV.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/manage_device_registry__deploy_edge_configuration]] — `NEW_DEVICE_REGISTERED` → [[deploy_edge_configuration]]
- [[../comunicaciones/manage_device_registry__run_msa_analysis]] — `NEW_DEVICE_REGISTERED` → [[run_msa_analysis]]
**Esta tool es disparada por:**
- [[monitor_edge_health]] — `HEALTH_REPORT_READY` → [[../comunicaciones/monitor_edge_health__manage_device_registry]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: manage_edge_devices
nombre: "Gestionar Dispositivos Edge"
categoria: infrastructure
agente: infraestructura-edge
estado: catalogo
consume: []
produce: [DEVICE_STATE_CHANGED]
programador:
actualizado: 2026-06-28
tags: [tool, infrastructure, catalogo]
---
# Gestionar Dispositivos Edge
> `manage_edge_devices` · Edge · categoría **infrastructure** · estado **catalogo**
> Pertenece al agente [[../agentes/infraestructura-edge|Agente de Infraestructura & Edge]]
## Qué hace
Registra, monitorea y gestiona el ciclo de vida de sensores, actuadores y gateways.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `DEVICE_STATE_CHANGED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** operation especifica la acción CRUD a realizar sobre el registro de dispositivos: 'register' añade un nuevo dispositivo, 'update' modifica su configuración, 'delete' lo retira del sistema, 'list' obtiene el inventario. deviceId identifica el dispositivo específico para operaciones register/update/delete.

**Cálculos:** Validar que deviceId existe en el registro para operaciones update/delete. Para 'register': generar un UUID para el nuevo dispositivo, validar que los campos obligatorios están presentes (tipo, ubicación, protocolo), insertar en la BD de dispositivos. Para 'update': aplicar los cambios de configuración y propagar al dispositivo edge si está online. Para 'list': consultar y devolver el inventario completo.

**Por qué estos outputs:** devices es el inventario actualizado que el sistema de gestión usa para conocer qué activos edge están registrados y su configuración. operationResult confirma si la operación tuvo éxito o explica el error. timestamp es el registro de auditoría de cuándo se realizó el cambio.

**Sugerencia de UI:** Tabla de inventario de dispositivos con columnas: ID, Tipo, Ubicación, Protocolo, Estado, Última conexión. Buscador y filtros por tipo y estado. Formulario modal de registro/edición de dispositivo. Botón de ping para verificar conectividad. Exportar inventario a CSV.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/manage_edge_devices__orchestrate_edge_nodes]] — `DEVICE_STATE_CHANGED` → [[orchestrate_edge_nodes]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

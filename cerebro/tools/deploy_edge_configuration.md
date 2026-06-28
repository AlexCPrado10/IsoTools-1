---
tipo: tool
id: deploy_edge_configuration
nombre: "Desplegar Configuración Edge"
categoria: infrastructure
agente: infraestructura-edge
estado: catalogo
consume: [NEW_DEVICE_REGISTERED]
produce: [CONFIG_DEPLOYED]
programador:
actualizado: 2026-06-28
tags: [tool, infrastructure, catalogo]
---
# Desplegar Configuración Edge
> `deploy_edge_configuration` · Cloud · categoría **infrastructure** · estado **catalogo**
> Pertenece al agente [[../agentes/infraestructura-edge|Agente de Infraestructura & Edge]]
## Qué hace
Despliega configuraciones de agentes y parámetros de sistema a dispositivos edge remotamente.
## Contrato de eventos
- **Consume:** `NEW_DEVICE_REGISTERED`
- **Produce:** `CONFIG_DEPLOYED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** configId identifica el paquete de configuración en el repositorio (parámetros de agentes, umbrales de alarma, configuración de protocolos). targetDevices lista los dispositivos edge que recibirán la nueva configuración. strategy controla el riesgo del despliegue: 'rolling' actualiza de a pocos dispositivos para detectar problemas antes de afectar toda la flota, 'all-at-once' es más rápido pero más riesgoso.

**Cálculos:** Obtener el paquete de configuración de configId del repositorio. Validar la configuración contra el schema esperado. Conectar a cada targetDevice según su protocolo de gestión (SSH, MQTT management, REST API). Aplicar la configuración según strategy: si 'rolling', actualizar de a 10% de la flota por ciclo, verificar salud antes de continuar. Si algún dispositivo falla, marcar como failed y continuar con los demás.

**Por qué estos outputs:** deployed y failed son los contadores que muestran el resultado del despliegue masivo para el reporte de operaciones. rollbackAvailable indica si el agente puede revertir automáticamente a la configuración anterior si se detectan problemas post-despliegue. El agente monitorea los dispositivos actualizados durante 10 minutos después del despliegue para confirmar estabilidad.

**Sugerencia de UI:** Panel de despliegue con barra de progreso y contadores de dispositivos actualizados/fallidos/pendientes. Lista de dispositivos con estado individual. Log en tiempo real del proceso de despliegue. Botón de rollback con confirmación. Historial de despliegues anteriores.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/deploy_edge_configuration__update_edge_agents]] — `CONFIG_DEPLOYED` → [[update_edge_agents]]
**Esta tool es disparada por:**
- [[manage_device_registry]] — `NEW_DEVICE_REGISTERED` → [[../comunicaciones/manage_device_registry__deploy_edge_configuration]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

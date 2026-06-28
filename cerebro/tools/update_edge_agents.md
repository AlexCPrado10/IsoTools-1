---
tipo: tool
id: update_edge_agents
nombre: "Actualizar Agentes Edge"
categoria: infrastructure
agente: infraestructura-edge
estado: catalogo
consume: [CONFIG_DEPLOYED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, infrastructure, catalogo]
---
# Actualizar Agentes Edge
> `update_edge_agents` · Cloud · categoría **infrastructure** · estado **catalogo**
> Pertenece al agente [[../agentes/infraestructura-edge|Agente de Infraestructura & Edge]]
## Qué hace
Gestiona actualizaciones OTA de agentes edge en toda la flota de dispositivos.
## Contrato de eventos
- **Consume:** `CONFIG_DEPLOYED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** agentId identifica el software del agente a actualizar en los dispositivos edge (ej: 'inference-agent', 'data-collector'). targetVersion es la versión a instalar, obtenida del repositorio de artefactos. deviceFilter permite segmentar la actualización: solo dispositivos de cierto tipo, ubicación o estado para hacer rollouts graduales.

**Cálculos:** Consultar el repositorio para obtener el paquete de la targetVersion para agentId. Filtrar los dispositivos aplicando deviceFilter. Para cada dispositivo: descargar el paquete al dispositivo vía SCP/MQTT, detener el servicio actual, hacer backup de la configuración, instalar la nueva versión, verificar que el servicio arranca correctamente. Generar un updateJobId para rastrear el proceso asíncrono.

**Por qué estos outputs:** updatedDevices y failedDevices son los KPIs del rollout que el equipo de IT monitorea. updateJobId permite consultar el estado del proceso asíncrono (la actualización puede tardar minutos u horas en flotas grandes). El agente puede hacer rollback automático en dispositivos donde la actualización falló.

**Sugerencia de UI:** Dashboard de rollout con mapa de dispositivos coloreados por estado de actualización. Barra de progreso global del rollout. Tabla de dispositivos con versión actual y nueva, y estado (Pendiente/Actualizando/Éxito/Fallo). Log de errores por dispositivo.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[deploy_edge_configuration]] — `CONFIG_DEPLOYED` → [[../comunicaciones/deploy_edge_configuration__update_edge_agents]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

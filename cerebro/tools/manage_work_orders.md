---
tipo: tool
id: manage_work_orders
nombre: "Gestionar Órdenes de Trabajo"
categoria: maintenance
agente: mantenimiento-cmms
estado: catalogo
consume: [CONDITION_DEGRADED]
produce: [WORK_ORDER_APPROVED]
programador:
actualizado: 2026-06-28
tags: [tool, maintenance, catalogo]
---
# Gestionar Órdenes de Trabajo
> `manage_work_orders` · Cloud · categoría **maintenance** · estado **catalogo**
> Pertenece al agente [[../agentes/mantenimiento-cmms|Agente de Mantenimiento & CMMS]]
## Qué hace
Crea, asigna, prioriza y cierra órdenes de trabajo de mantenimiento con trazabilidad completa.
## Contrato de eventos
- **Consume:** `CONDITION_DEGRADED`
- **Produce:** `WORK_ORDER_APPROVED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `action` para enrutar la lógica correcta (crear, actualizar, cerrar o listar) sin ambigüedad en el handler. `assetId` es obligatorio porque toda orden de trabajo debe estar vinculada a un activo físico para mantener el historial de mantenimiento por equipo. `priority` define el SLA de respuesta del técnico y la cola de despacho: una OT critical puede requerir respuesta inmediata mientras que low puede programarse. `description` captura el síntoma o trabajo requerido en texto libre para que el técnico entienda el contexto antes de llegar al sitio.

**Cálculos:** Para `create`: generar un `workOrderId` único (UUID v4 o prefijo+secuencial). Consultar disponibilidad de técnicos en la tabla de recursos filtrada por habilidades requeridas para ese tipo de activo. Calcular `estimatedCompletionHours` basado en el historial de trabajos similares para ese `assetId` o usando tiempos estándar del catálogo de tareas. Asignar estado inicial `open`. Para `update`: validar transiciones de estado permitidas (open → in_progress, in_progress → waiting_parts, etc.). Para `close`: registrar timestamp de cierre, calcular tiempo real transcurrido y actualizar el historial del activo. Para `list`: filtrar por `assetId` y devolver paginado.

**Por qué estos outputs:** `workOrderId` es la referencia que todos los sistemas (SCADA, ERP, historial) usarán para enlazar eventos a esta OT. `status` permite al agente decidir si escalar, esperar o continuar el flujo de mantenimiento. `assignedTechnician` habilita notificaciones push al técnico correcto. `estimatedCompletionHours` es el dato que alimenta la planificación de capacidad y el cálculo de KPIs de MTTR.

**Sugerencia de UI:** Formulario con dropdown de `action` que muestra/oculta campos condicionalmente. Badge de prioridad con colores (rojo=critical, naranja=high, amarillo=medium, azul=low). Lista de OTs abiertas en tabla con columnas: ID, Activo, Prioridad, Técnico, Estado y tiempo transcurrido. Botón de acción contextual por fila según estado actual.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/manage_work_orders__manage_spare_parts]] — `WORK_ORDER_APPROVED` → [[manage_spare_parts]]
**Esta tool es disparada por:**
- [[execute_condition_monitoring]] — `CONDITION_DEGRADED` → [[../comunicaciones/execute_condition_monitoring__manage_work_orders]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

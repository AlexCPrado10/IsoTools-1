---
tipo: tool
id: sync_erp_data_local
nombre: "Sincronizar Datos ERP Local"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: [ERP_DATA_SYNCED]
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Sincronizar Datos ERP Local
> `sync_erp_data_local` · Edge · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Extrae datos del ERP local (SAP, Odoo, etc.) y los sincroniza con el cloud de forma incremental.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `ERP_DATA_SYNCED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** erpType identifica el sistema ERP local (SAP, Odoo, SAGE, etc.) para usar el conector correcto. lastSyncTimestamp permite una sincronización incremental — solo se transfieren los registros modificados desde la última sync, minimizando el volumen de datos y el tiempo de transferencia. tables especifica qué entidades sincronizar según las necesidades del momento.

**Cálculos:** Conectar al ERP local usando el conector configurado para erpType. Ejecutar una query incremental: SELECT * FROM tabla WHERE updated_at > lastSyncTimestamp. Mapear los campos del ERP local al esquema estándar de la plataforma cloud. Insertar o actualizar en la BD cloud. Registrar cualquier error de mapeo o conflicto de datos en el array errors.

**Por qué estos outputs:** recordsSynced confirma que los datos están actualizados en el cloud para que las tools de análisis trabajen con información fresca. syncTimestamp se guarda para la próxima ejecución incremental. errors permite al equipo de IT identificar y corregir problemas de mapeo de datos entre sistemas.

**Sugerencia de UI:** Panel de sincronización con última fecha de sync, estado (Sincronizado/Error/En progreso) y número de registros sincronizados. Barra de progreso durante la sync activa. Log de errores expandible. Botón de forzar sync completa.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/sync_erp_data_local__get_inventory_status]] — `ERP_DATA_SYNCED` → [[get_inventory_status]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

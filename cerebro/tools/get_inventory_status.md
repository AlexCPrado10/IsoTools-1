---
tipo: tool
id: get_inventory_status
nombre: "Consultar Estado de Inventario"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: [ERP_DATA_SYNCED]
produce: [INVENTORY_STATUS_READY]
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Consultar Estado de Inventario
> `get_inventory_status` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Consulta niveles actuales de inventario, alertas de stock mínimo y rotación por SKU.
## Contrato de eventos
- **Consume:** `ERP_DATA_SYNCED`
- **Produce:** `INVENTORY_STATUS_READY`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita warehouseId para consultar solo el almacén correcto en sistemas multi-planta. skuIds permite filtrar los artículos de interés (si se omite, devuelve todo el inventario). includeAlerts activa la comparación contra mínimos de stock para que el agente actúe solo cuando hay riesgo real de ruptura.

**Cálculos:** Consultar la base de datos de inventario filtrando por warehouseId y opcionalmente por skuIds. Para cada SKU, comparar quantity contra minStock y generar el flag alert. Contar el total de alertas activas. Registrar el timestamp de la consulta para trazabilidad.

**Por qué estos outputs:** items permite al agente iterar sobre cada SKU y decidir si lanzar una orden de compra. totalAlerts es el KPI que dispara alertas al equipo de compras. timestamp permite verificar que los datos son recientes antes de tomar decisiones.

**Sugerencia de UI:** Tabla de inventario con columnas SKU, Cantidad, Mínimo y semáforo (rojo/amarillo/verde) en la columna Alerta. Badge contador con el total de alertas activas en la cabecera. Botón de acción rápida por fila para lanzar orden de compra.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/get_inventory_status__predict_demand]] — `INVENTORY_STATUS_READY` → [[predict_demand]]
**Esta tool es disparada por:**
- [[sync_erp_data_local]] — `ERP_DATA_SYNCED` → [[../comunicaciones/sync_erp_data_local__get_inventory_status]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: manage_spare_parts
nombre: "Gestionar Repuestos"
categoria: maintenance
agente: mantenimiento-cmms
estado: catalogo
consume: [WORK_ORDER_APPROVED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, maintenance, catalogo]
---
# Gestionar Repuestos
> `manage_spare_parts` · Cloud · categoría **maintenance** · estado **catalogo**
> Pertenece al agente [[../agentes/mantenimiento-cmms|Agente de Mantenimiento & CMMS]]
## Qué hace
Controla inventario de repuestos críticos, genera alertas de stock mínimo y optimiza niveles según criticidad del activo.
## Contrato de eventos
- **Consume:** `WORK_ORDER_APPROVED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `partId` para identificar el repuesto específico en el catálogo de materiales, evitando consultar el inventario completo. `action` define la operación: 'query' es solo lectura, 'reserve' bloquea stock para una OT pendiente, 'consume' descuenta del inventario al usar la pieza, 'reorder' genera la solicitud de compra automáticamente. `quantity` es requerida para acciones que modifican el stock (reserve, consume) y es validada contra el stock disponible antes de ejecutar.

**Cálculos:** Para 'query': retornar stock actual y comparar contra `minStock` para generar flag `alert`. Para 'reserve': verificar que (currentStock - quantityReservada) >= 0, actualizar stock reservado. Para 'consume': decrementar currentStock, si currentStock resultante < reorderPoint, activar flag de reorden. Para 'reorder': calcular cantidad óptima de pedido usando EOQ = sqrt(2×D×S/H) donde D=demanda anual, S=costo de pedido, H=costo de mantenimiento de inventario. `estimatedCost` = quantity × precio_unitario_del_catálogo.

**Por qué estos outputs:** `currentStock` y `minStock` permiten al agente determinar si puede atender una OT o si debe esperar la llegada del repuesto. `reorderPoint` es el umbral que dispara la acción automática de compra. `alert` es la señal booleana que el agente usa para escalar al equipo de compras sin necesidad de interpretar los valores numéricos. `estimatedCost` alimenta el costo total de la orden de trabajo.

**Sugerencia de UI:** Tarjeta de repuesto con indicador visual de nivel de stock tipo termómetro (rojo=bajo mínimo, amarillo=entre mínimo y punto de reorden, verde=saludable). Botones de acción directa: Reservar, Consumir, Solicitar Reorden. Historial de movimientos en tabla colapsable con fecha, acción y cantidad.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[manage_work_orders]] — `WORK_ORDER_APPROVED` → [[../comunicaciones/manage_work_orders__manage_spare_parts]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

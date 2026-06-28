---
tipo: tool
id: manage_warehouse_wms
nombre: "Gestionar Almacén WMS"
categoria: supply-chain
agente: cadena-suministro
estado: catalogo
consume: [MATERIAL_RECEIVED]
produce: [WMS_OPERATION_COMPLETE]
programador:
actualizado: 2026-06-28
tags: [tool, supply-chain, catalogo]
---
# Gestionar Almacén WMS
> `manage_warehouse_wms` · Cloud · categoría **supply-chain** · estado **catalogo**
> Pertenece al agente [[../agentes/cadena-suministro|Agente de Cadena de Suministro]]
## Qué hace
Gestiona operaciones de almacén: recepción, slotting dinámico, picking, cross-docking y despacho con trazabilidad FIFO/FEFO.
## Contrato de eventos
- **Consume:** `MATERIAL_RECEIVED`
- **Produce:** `WMS_OPERATION_COMPLETE`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `warehouseId` para acceder al layout del almacén (ubicaciones, capacidades, zonas) y la lista de recursos disponibles (montacargas, personal). `operation` determina el flujo específico: 'receive' verifica el pedido de compra y genera etiquetas, 'putaway' asigna ubicación óptima según reglas de slotting, 'pick' genera la lista de picking en secuencia eficiente, 'pack' gestiona el empaque y documentación, 'ship' genera guías y actualiza inventario, 'inventory_count' inicia el conteo cíclico. `items` son los materiales involucrados en la operación con sus atributos (SKU, cantidad, lote, fecha de caducidad). `priority` (normal/urgent/express) define si la operación desplaza otras en la cola de trabajo.

**Cálculos:** Para 'putaway': algoritmo de slotting dinámico considerando rotación del SKU (A/B/C), afinidad de productos (no mezclar alimentos con químicos), fecha de caducidad para FEFO (lo que caduca primero, sale primero). Para 'pick': algoritmo de optimización de la ruta de picking (S-shape, Return, Largest Gap o Combined según el layout). Para 'inventory_count': seleccionar ubicaciones por método cíclico ABC (A se cuenta mensual, B trimestral, C semestral). `utilizationPercent` = ubicaciones_ocupadas / ubicaciones_totales × 100. `processedItems` = count de ítems procesados exitosamente en la operación.

**Por qué estos outputs:** `operationId` es la referencia para el registro del movimiento en el inventario del ERP. `locationAssignments` por ítem permite a los operadores saber exactamente dónde colocar o recoger cada SKU. `utilizationPercent` es el KPI de capacidad del almacén que alerta cuando se acerca al límite. `processedItems` confirma que todos los ítems solicitados fueron procesados, o indica cuántos quedaron pendientes.

**Sugerencia de UI:** Mapa del almacén con ubicaciones codificadas por color según occupancy (verde=libre, amarillo=parcial, rojo=lleno). Lista de tareas de picking/putaway con instrucciones paso a paso para el operador móvil (diseñada para pantallas de 5 pulgadas). Confirmación por escaneo de barcode de cada ubicación. KPI de productividad: ítems procesados/hora del turno.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/manage_warehouse_wms__calculate_scm_kpis]] — `WMS_OPERATION_COMPLETE` → [[calculate_scm_kpis]]
**Esta tool es disparada por:**
- [[scan_incoming_material]] — `MATERIAL_RECEIVED` → [[../comunicaciones/scan_incoming_material__manage_warehouse_wms]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

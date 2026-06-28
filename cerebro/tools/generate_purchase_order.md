---
tipo: tool
id: generate_purchase_order
nombre: "Generar Orden de Compra"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: [ORDER_RECOMMENDED]
produce: [ORDER_CREATED]
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Generar Orden de Compra
> `generate_purchase_order` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Crea y envía órdenes de compra formales al ERP y/o al proveedor automáticamente.
## Contrato de eventos
- **Consume:** `ORDER_RECOMMENDED`
- **Produce:** `ORDER_CREATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** supplierId identifica al proveedor en el sistema ERP para enviarle la orden y aplicar sus condiciones comerciales. items contiene el detalle completo de lo que se solicita (SKU, cantidad, precio unitario). deliveryDate es la fecha prometida para planificar la recepción y alertar si el lead time no es suficiente.

**Cálculos:** Validar que supplierId existe en el catálogo de proveedores. Calcular totalAmount sumando precio × cantidad de cada item más impuestos aplicables. Generar un orderId único (UUID o consecutivo según el ERP). Registrar la orden en la BD y enviarla al ERP o al proveedor vía API/EDI/email.

**Por qué estos outputs:** orderId es el identificador para rastrear la orden y relacionarla con recepciones futuras. status ('pending','confirmed','sent') permite al agente monitorear si el proveedor aceptó la orden. totalAmount confirma el importe para que el sistema financiero reserve el presupuesto.

**Sugerencia de UI:** Formulario modal de confirmación con tabla de items, subtotal, impuestos y total. Indicador de estado con pasos (Borrador → Enviada → Confirmada → Recibida). Toast de éxito con el orderId al generar.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/generate_purchase_order__push_orders_to_erp]] — `ORDER_CREATED` → [[push_orders_to_erp]]
**Esta tool es disparada por:**
- [[recommend_purchase_orders]] — `ORDER_RECOMMENDED` → [[../comunicaciones/recommend_purchase_orders__generate_purchase_order]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

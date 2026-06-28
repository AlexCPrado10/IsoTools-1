---
tipo: tool
id: push_orders_to_erp
nombre: "Enviar Órdenes al ERP Local"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: [ORDER_CREATED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Enviar Órdenes al ERP Local
> `push_orders_to_erp` · Edge · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Recibe órdenes generadas en la nube y las ingresa al ERP local de forma transaccional.
## Contrato de eventos
- **Consume:** `ORDER_CREATED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** orders es el array de órdenes generadas en el cloud que deben registrarse en el ERP local para mantener la sincronía operativa. erpType determina el formato y el endpoint de la API del ERP al que se enviarán las órdenes.

**Cálculos:** Para cada orden en el array, transformar el objeto al formato requerido por el ERP (mapeo de campos, formatos de fecha, códigos de artículo locales). Enviar la orden al ERP vía API REST, EDI o conexión directa a la BD según erpType. Capturar el ID que el ERP asigna a la orden y guardarlo en erpOrderIds para trazabilidad bidireccional.

**Por qué estos outputs:** inserted confirma cuántas órdenes quedaron registradas en el ERP local para que los compradores puedan gestionarlas desde su sistema habitual. failed permite al agente reintentar las órdenes fallidas o notificar al equipo. erpOrderIds es el vínculo de trazabilidad entre el cloud y el ERP local.

**Sugerencia de UI:** Lista de órdenes con estado de sincronización (Sincronizada/Error/Pendiente) por fila. Contador de éxitos y fallos en la cabecera. Detalle de error expandible por orden fallida. Botón de reintento para órdenes fallidas.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[generate_purchase_order]] — `ORDER_CREATED` → [[../comunicaciones/generate_purchase_order__push_orders_to_erp]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: scan_incoming_material
nombre: "Escanear Material Entrante"
categoria: supply-chain
agente: cadena-suministro
estado: catalogo
consume: []
produce: [MATERIAL_RECEIVED]
programador:
actualizado: 2026-06-28
tags: [tool, supply-chain, catalogo]
---
# Escanear Material Entrante
> `scan_incoming_material` · Edge · categoría **supply-chain** · estado **catalogo**
> Pertenece al agente [[../agentes/cadena-suministro|Agente de Cadena de Suministro]]
## Qué hace
Digitaliza la recepción de materiales leyendo QR, código de barras o RFID para trazabilidad lote a lote desde el muelle.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `MATERIAL_RECEIVED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `scannerType` para inicializar el driver correcto de lectura: QR y barcode usan la cámara del dispositivo móvil o lectores USB/Bluetooth con librería específica de decodificación, RFID requiere antena UHF y middleware como Impinj, 'manual' presenta un formulario de captura cuando no hay equipo disponible. `locationId` (identificador del muelle o puerta) es necesario para registrar en qué punto de la cadena de custodia se recibió el material y vincularlo a las reglas de recepción del almacén (qué proveedores pueden descargar en qué muelle). `purchaseOrderId` permite validar que lo recibido corresponde a un pedido de compra abierto y detectar recepciones no autorizadas.

**Cálculos:** Leer el código según `scannerType`. Decodificar el contenido: para QR/barcode siguiendo GS1 (SSCC, GTIN, lote, fecha caducidad), para RFID leyendo el EPC (Electronic Product Code). Cruzar `materialId` decodificado con el `purchaseOrderId` para verificar que el material es el correcto, en la cantidad correcta y del proveedor esperado. Calcular si `qualityHoldRequired` consultando las reglas de inspección de entrada: si el proveedor tiene un plan de inspección del 100%, o si el lote específico fue marcado para retención por el equipo de calidad. Registrar `receivingTimestamp` con el ID del escáner para trazabilidad del sistema de medición.

**Por qué estos outputs:** `materialId` y `lotNumber` son los datos que inician la trazabilidad lote-a-lote: cada unidad producida con ese material podrá rastrearse hasta esta recepción. `supplierId` vincula el lote recibido al scorecard del proveedor. `quantityReceived` actualiza el inventario en tiempo real. `expirationDate` activa las reglas FEFO en el WMS. `qualityHoldRequired` es la señal que separa físicamente el material para inspección antes de liberarlo a producción.

**Sugerencia de UI:** Pantalla de recepción optimizada para tablet de muelle. Botón grande de escaneo que activa la cámara o el lector. Resultado de escaneo mostrando inmediatamente: material, proveedor, cantidad esperada vs recibida y estado (OK/Retención). Campo de ajuste de cantidad si hay diferencia física. Badge de HOLD en rojo prominente cuando `qualityHoldRequired`. Confirmación con firma digital del receptor.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/scan_incoming_material__manage_warehouse_wms]] — `MATERIAL_RECEIVED` → [[manage_warehouse_wms]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

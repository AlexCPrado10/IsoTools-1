---
tipo: tool
id: generate_delivery_report
nombre: "Generar Reporte de Desempeño de Entrega"
categoria: supply-chain
agente: cadena-suministro
estado: catalogo
consume: [SCORECARD_UPDATED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, supply-chain, catalogo]
---
# Generar Reporte de Desempeño de Entrega
> `generate_delivery_report` · Cloud · categoría **supply-chain** · estado **catalogo**
> Pertenece al agente [[../agentes/cadena-suministro|Agente de Cadena de Suministro]]
## Qué hace
Genera reporte ejecutivo de desempeño de entregas con análisis de retrasos, causas raíz y tendencias por ruta y cliente.
## Contrato de eventos
- **Consume:** `SCORECARD_UPDATED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para delimitar el análisis a los pedidos que salen de esa instalación específica. `periodDays` define la ventana del reporte: 30 días es el estándar para reportes operativos mensuales, mientras que trimestral o anual se usan para reportes estratégicos. `groupBy` determina el nivel de agregación del análisis: 'route' identifica rutas problemáticas para optimización, 'customer' identifica los clientes más afectados por retrasos para gestión de cuenta, 'carrier' evalúa el desempeño de cada transportista, 'product' identifica familias con problemas de entrega recurrentes.

**Cálculos:** Recuperar todos los registros de entrega del período para `plantId`. Calcular `onTimePercent` = entregas_en_fecha / total_entregas × 100. `avgDelayDays` = promedio de max(0, fechaEntregaReal - fechaEntregaComprometida) sobre las entregas retrasadas. Agrupar por la dimensión `groupBy` y calcular los mismos KPIs por grupo. `topDelayReasons`: análisis de Pareto de las causas de retraso registradas en los registros de entrega (tráfico, disponibilidad de unidad, error de documentación, problema en origen, rechazo en destino). Agregar los resultados en el reporte ejecutivo y generar el PDF.

**Por qué estos outputs:** `totalDeliveries` y `onTimePercent` son los KPIs de nivel de servicio que el agente puede comparar contra el objetivo contractual del cliente. `avgDelayDays` cuantifica la magnitud del problema para priorizar la urgencia de las acciones correctivas. `topDelayReasons` en formato Pareto permite focalizar los esfuerzos de mejora en las causas que explican el 80% de los retrasos. `pdfUrl` habilita la distribución inmediata del reporte al cliente o a la dirección.

**Sugerencia de UI:** Reporte ejecutivo con KPI summary en la parte superior. Gráfico de Pareto de causas de retraso. Tabla de desempeño agrupado según `groupBy` con comparación vs período anterior. Mapa de calor de puntualidad por ruta (si groupBy=route). Botón de generar y descargar PDF. Opción de envío automático por email a lista de distribución.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[manage_supplier_scorecard]] — `SCORECARD_UPDATED` → [[../comunicaciones/manage_supplier_scorecard__generate_delivery_report]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

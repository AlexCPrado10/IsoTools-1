---
tipo: tool
id: analyze_lead_times
nombre: "Analizar Lead Times"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Analizar Lead Times
> `analyze_lead_times` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Analiza lead times históricos de proveedores y detecta variaciones anómalas.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** supplierId para analizar el historial de entregas de ese proveedor específico. periodDays define la ventana de análisis (ej: 90 días = trimestre) para que el cálculo sea estadísticamente significativo y capture variaciones recientes sin penalizar por eventos históricos muy antiguos.

**Cálculos:** Consultar el historial de órdenes del proveedor en el período. Calcular avgLeadTimeDays como media aritmética de (fechaRecepción - fechaOrden). Calcular stdDev para medir la variabilidad. Detectar anomalías como entregas que superen media + 2σ. Calcular trend comparando el promedio del primer vs segundo mitad del período.

**Por qué estos outputs:** avgLeadTimeDays es el valor que se usa en optimize_stock_levels para calcular el punto de reorden. stdDev permite calcular el stock de seguridad (mayor variabilidad = más colchón). anomalies y trend alertan al equipo de compras sobre deterioro en el desempeño del proveedor.

**Sugerencia de UI:** Histograma de distribución de lead times con líneas de media y ±1σ. Gráfica de línea con cada entrega en el tiempo para ver el trend. Tarjetas de métricas: Promedio, Variabilidad, Mejor lead time, Peor lead time.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: detect_business_anomalies
nombre: "Detectar Anomalías de Negocio"
categoria: erp
agente: erp-gestion-empresarial
estado: implementada
consume: [FORECAST_READY, PRODUCTION_VARIANCE_DETECTED]
produce: [BUSINESS_ANOMALY_DETECTED]
programador:
actualizado: 2026-06-28
tags: [tool, erp, implementada]
---
# Detectar Anomalías de Negocio
> `detect_business_anomalies` · Cloud · categoría **erp** · estado **implementada**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Detecta patrones inusuales en métricas de negocio: ventas, márgenes, inventario y costos.
## Contrato de eventos
- **Consume:** `FORECAST_READY`, `PRODUCTION_VARIANCE_DETECTED`
- **Produce:** `BUSINESS_ANOMALY_DETECTED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** metrics es el snapshot actual de los indicadores de negocio (ventas, costos, clientes, producción) que el agente monitorea periódicamente. sensitivityLevel controla el umbral de detección: 'high' detecta desviaciones pequeñas pero genera más falsos positivos, 'low' solo alerta sobre anomalías severas.

**Cálculos:** Para cada métrica, calcular el valor esperado basado en el historial reciente (media móvil ponderada). Aplicar detección de anomalías: Z-score para distribuciones normales, IQR para distribuciones sesgadas, o Isolation Forest para anomalías multivariables. Ajustar umbrales según sensitivityLevel. Clasificar anomalías en críticas vs informativas.

**Por qué estos outputs:** anomalies es la lista que el agente analiza para determinar si debe disparar alertas, investigar causas o escalar a humanos. criticalCount es el número que determina la urgencia: si criticalCount > 0, el agente notifica inmediatamente a la dirección y suspende acciones automáticas hasta revisión.

**Sugerencia de UI:** Feed de alertas de anomalías con severidad (crítica/moderada/informativa), métrica afectada y desviación porcentual. Gráfica de dispersión mostrando valores normales vs anómalos. Panel de timeline con histórico de anomalías detectadas.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/detect_business_anomalies__generate_kpis]] — `BUSINESS_ANOMALY_DETECTED` → [[generate_kpis]]
**Esta tool es disparada por:**
- [[forecast_revenue]] — `FORECAST_READY` → [[../comunicaciones/forecast_revenue__detect_business_anomalies]]
- [[compare_planned_vs_actual]] — `PRODUCTION_VARIANCE_DETECTED` → [[../comunicaciones/compare_planned_vs_actual__detect_business_anomalies]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

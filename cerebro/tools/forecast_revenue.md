---
tipo: tool
id: forecast_revenue
nombre: "Pronosticar Ingresos"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: [FORECAST_READY]
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Pronosticar Ingresos
> `forecast_revenue` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Pronostica ingresos futuros combinando ventas históricas, pipeline CRM y señales de mercado.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `FORECAST_READY`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** businessUnit para segmentar la proyección por unidad de negocio (diferentes productos, mercados o canales tienen dinámicas distintas). horizonMonths define el alcance de la proyección: 3 meses para operaciones, 12 meses para presupuesto anual, 24-36 para planificación estratégica.

**Cálculos:** Usar series temporales (Prophet o SARIMA) entrenadas con el historial de ventas de la unidad de negocio. Incorporar señales externas: estacionalidad del sector, índices macroeconómicos relevantes, pipeline de ventas del CRM. Calcular el forecast mensual con intervalos de confianza. Calcular la confianza general del modelo con métricas MAPE o RMSE.

**Por qué estos outputs:** forecastedRevenue es el ingreso proyectado que el CFO usa para planificar el flujo de caja y el presupuesto. confidencePercent comunica la incertidumbre del modelo para que los tomadores de decisión sepan qué tan confiable es la proyección. byMonth permite planificar recursos mes a mes según los picos de demanda proyectados.

**Sugerencia de UI:** Gráfica de área con histórico (línea sólida) y proyección (línea punteada con banda de confianza). Tabla de forecast mensual con columnas: Mes, Proyección, Rango inferior, Rango superior. Indicador de confianza del modelo con semáforo.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/forecast_revenue__detect_business_anomalies]] — `FORECAST_READY` → [[detect_business_anomalies]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

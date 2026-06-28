---
tipo: tool
id: predict_sales
nombre: "Predecir Ventas"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: [LEADS_SCORED]
produce: [SALES_PREDICTED]
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Predecir Ventas
> `predict_sales` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Predice ventas por producto, canal y región para el período seleccionado.
## Contrato de eventos
- **Consume:** `LEADS_SCORED`
- **Produce:** `SALES_PREDICTED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** productId para obtener el historial de ventas específico de ese producto (cada producto tiene su propia curva de demanda). channel distingue el comportamiento por canal (eCommerce tiene mayor estacionalidad, distribuidores tienen patrones de pedido más regulares). horizonDays define cuántos días hacia adelante proyectar para planificar la producción o el reabastecimiento.

**Cálculos:** Entrenar o cargar un modelo de series temporales por combinación productId + channel. Aplicar regresión con variables exógenas: estacionalidad, días festivos, promociones activas, precio. Calcular la predicción puntual y la métrica de accuracy (MAPE) del modelo en el período de validación más reciente.

**Por qué estos outputs:** predictedUnits alimenta el plan de producción para que la planta fabrique la cantidad correcta. predictedRevenue ayuda al área de finanzas a proyectar el flujo de caja. accuracy permite al agente informar al usuario qué tan confiable es la predicción antes de actuar sobre ella.

**Sugerencia de UI:** Gráfica de barras con ventas históricas y proyección futura diferenciadas por color. Panel de accuracy del modelo con nivel de confianza. Desglose de predicción por semana en tabla. Selector de canal con comparativa entre canales.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/predict_sales__automate_followups]] — `SALES_PREDICTED` → [[automate_followups]]
**Esta tool es disparada por:**
- [[score_leads]] — `LEADS_SCORED` → [[../comunicaciones/score_leads__predict_sales]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

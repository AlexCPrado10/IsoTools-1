---
tipo: tool
id: predict_demand_industrial
nombre: "Predecir Demanda Industrial"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Predecir Demanda Industrial
> `predict_demand_industrial` · Cloud · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Predice la demanda de componentes industriales usando modelos ML entrenados con señales externas.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** componentId identifica el componente o materia prima industrial cuya demanda se quiere predecir (puede ser un rodamiento, un aceite hidráulico o una pieza de repuesto crítica). includeExternalSignals activa señales externas de demanda: índices de producción industrial, precios de materias primas, lead times de proveedores que afectan la planificación.

**Cálculos:** Usar el historial de consumo del componente. Aplicar modelo de series temporales (Prophet con estacionalidad múltiple para ciclos semanales/mensuales/anuales). Si includeExternalSignals=true, incorporar regresores externos (índice de producción industrial, precios de commodities). Generar el forecast diario o semanal con modelAccuracy calculada por backtesting.

**Por qué estos outputs:** demandForecast es el array de fecha+unidades que el sistema MRP usa para calcular las necesidades de aprovisionamiento. modelAccuracy permite al planificador ajustar el margen de seguridad manualmente si la precisión es baja. El agente usa este forecast para lanzar órdenes de compra preventivas.

**Sugerencia de UI:** Gráfica de área con consumo histórico y forecast futuro diferenciados. Tabla de forecast semanal con unidades y rango de error. Indicador de accuracy del modelo con clasificación (Excelente/Bueno/Regular). Comparativa de forecast con y sin señales externas.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

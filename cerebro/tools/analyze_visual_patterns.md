---
tipo: tool
id: analyze_visual_patterns
nombre: "Analizar Patrones Visuales"
categoria: vision
agente: vision-artificial-industrial
estado: catalogo
consume: [DEFECT_FOUND]
produce: [PATTERN_ANALYSIS_COMPLETE]
programador:
actualizado: 2026-06-28
tags: [tool, vision, catalogo]
---
# Analizar Patrones Visuales
> `analyze_visual_patterns` · Cloud · categoría **vision** · estado **catalogo**
> Pertenece al agente [[../agentes/vision-artificial-industrial|Agente de Visión Artificial Industrial]]
## Qué hace
Analiza patrones visuales históricos para identificar tendencias de defectos y causas raíz.
## Contrato de eventos
- **Consume:** `DEFECT_FOUND`
- **Produce:** `PATTERN_ANALYSIS_COMPLETE`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** productType para analizar solo los defectos relevantes para ese tipo de producto y sus características visuales. periodDays define el histórico a analizar — 7 días para revisión semanal de producción, 30 días para análisis de tendencias y correlación con cambios de proceso o proveedor de materiales.

**Cálculos:** Consultar el historial de inspecciones del período para productType. Agrupar defectos detectados por tipo y calcular frecuencia. Ordenar por frecuencia para obtener topDefects (Pareto de defectos). Calcular defectTrend comparando la tasa de defectos del período vs el período anterior. Para cada defecto en topDefects, analizar correlaciones con parámetros de proceso para sugerir causas raíz.

**Por qué estos outputs:** topDefects es el Pareto que el equipo de calidad usa para priorizar las acciones correctivas (el 20% de tipos de defecto que generan el 80% del rechazo). defectTrend alerta si la calidad está deteriorándose. suggestedRootCauses es el análisis que el agente presenta para iniciar una investigación de causa raíz (8D, DMAIC).

**Sugerencia de UI:** Diagrama de Pareto de defectos (barras de frecuencia + línea de porcentaje acumulado). Gráfica de tendencia de la tasa de defectos en el tiempo. Mapa de calor de defectos por máquina y turno. Panel de causas raíz sugeridas con correlaciones estadísticas.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/analyze_visual_patterns__train_vision_model]] — `PATTERN_ANALYSIS_COMPLETE` → [[train_vision_model]]
**Esta tool es disparada por:**
- [[inspect_product_quality]] — `DEFECT_FOUND` → [[../comunicaciones/inspect_product_quality__analyze_visual_patterns]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

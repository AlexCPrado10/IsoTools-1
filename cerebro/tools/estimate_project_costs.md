---
tipo: tool
id: estimate_project_costs
nombre: "Estimar Costos de Proyecto"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Estimar Costos de Proyecto
> `estimate_project_costs` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Genera estimaciones de costo de proyecto con análisis de riesgo presupuestal.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** projectId para acceder al WBS (Work Breakdown Structure) completo con todas las partidas de costo. includeContingency activa el cálculo de reservas para riesgos — en proyectos industriales es estándar incluir 10-15% de contingencia para imprevistos como variaciones de materiales o extensiones de scope.

**Cálculos:** Sumar todos los costos del WBS: mano de obra (horas × tarifa), materiales (cantidad × precio), servicios externos, equipos. Si includeContingency=true, agregar contingencyPercent sobre el subtotal basado en el riskLevel. Aplicar técnica de Earned Value para proyectos en ejecución: EAC = BAC / CPI.

**Por qué estos outputs:** estimatedCost es el número que se presenta a la dirección para aprobación o para actualizar el presupuesto. contingencyPercent justifica ante los stakeholders la reserva de riesgos incluida. riskLevel orienta al agente a recomendar acciones preventivas si el riesgo es alto.

**Sugerencia de UI:** Gráfica de barras apiladas con desglose de costos por categoría (labor, materiales, servicios). Indicador de contingencia con porcentaje y monto en pesos/dólares. Comparativa EAC vs BAC con indicador de varianza de costo (CPI).
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

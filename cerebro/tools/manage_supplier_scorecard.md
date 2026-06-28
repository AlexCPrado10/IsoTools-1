---
tipo: tool
id: manage_supplier_scorecard
nombre: "Gestionar Scorecard de Proveedores"
categoria: supply-chain
agente: cadena-suministro
estado: catalogo
consume: []
produce: [SCORECARD_UPDATED]
programador:
actualizado: 2026-06-28
tags: [tool, supply-chain, catalogo]
---
# Gestionar Scorecard de Proveedores
> `manage_supplier_scorecard` · Cloud · categoría **supply-chain** · estado **catalogo**
> Pertenece al agente [[../agentes/cadena-suministro|Agente de Cadena de Suministro]]
## Qué hace
Evalúa y clasifica proveedores por calidad, entrega, precio, capacidad de respuesta y cumplimiento normativo con ranking automático.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `SCORECARD_UPDATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `supplierId` para identificar al proveedor específico y acceder a sus datos históricos de entregas, reclamaciones de calidad y precios. `evaluationPeriodDays` (default 90 días) define el período de evaluación: 90 días es lo suficientemente largo para capturar variabilidad pero suficientemente corto para reflejar el desempeño reciente. `weights` permite personalizar la ponderación por dimensión según la estrategia de compras: para materiales críticos se puede ponderar más calidad (50%), para commodities más precio (40%). Si se omite `weights`, se usa la distribución estándar (calidad 30%, entrega 30%, precio 25%, responsiveness 15%).

**Cálculos:** Calcular score de calidad: 100 - (qualityPpm / benchmarkPpm × 100), donde qualityPpm = partes_defectuosas / partes_recibidas × 1,000,000. Score de entrega: onTimeDeliveryPercent calculado sobre el período. Score de precio: (precio_referencia_mercado / precio_actual_proveedor) × 100. Score de responsiveness: 100 - (tiempo_promedio_respuesta_a_consultas / tiempo_target) × 100. `overallScore` = sum(score_i × weight_i) para las 4 dimensiones. `classification`: preferred si > 85, approved si 70-85, conditional si 50-70, disqualified si < 50. `developmentActions`: sugerir acciones de desarrollo desde catálogo según el área de menor score.

**Por qué estos outputs:** `overallScore` y `classification` determinan si el proveedor puede recibir nuevos negocios o si debe entrar en un plan de desarrollo. `qualityPpm` es la métrica más objetiva y trazable para negociar con el proveedor sus compromisos de mejora. `onTimeDeliveryPercent` permite al equipo de compras decidir si mantener o reducir el inventario de seguridad de materiales de ese proveedor. `developmentActions` son el plan de trabajo que compras lleva a la próxima revisión trimestral con el proveedor.

**Sugerencia de UI:** Tarjeta de proveedor con radar chart de las 4 dimensiones (calidad, entrega, precio, responsiveness). Badge de clasificación con color (dorado=preferred, verde=approved, amarillo=conditional, rojo=disqualified). Tabla de evolución del score trimestral (últimos 4 períodos). Panel de plan de desarrollo con acciones y fechas comprometidas.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/manage_supplier_scorecard__generate_delivery_report]] — `SCORECARD_UPDATED` → [[generate_delivery_report]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

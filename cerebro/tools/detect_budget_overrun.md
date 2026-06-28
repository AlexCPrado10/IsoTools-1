---
tipo: tool
id: detect_budget_overrun
nombre: "Detectar Sobrecosto Presupuestal"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Detectar Sobrecosto Presupuestal
> `detect_budget_overrun` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Detecta y alerta sobre desviaciones de presupuesto en tiempo real antes de que escalen.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** costCenterId identifica el centro de costo a monitorear (planta, departamento, línea). alertThreshold define el porcentaje de sobrejercicio que dispara la alerta — permite calibrar la sensibilidad según la política financiera (ej: 5% para centros críticos, 15% para operaciones generales).

**Cálculos:** Consultar el presupuesto asignado al centro de costo para el período actual y el gasto real acumulado. Calcular overrunPercent = ((gasto_real - presupuesto) / presupuesto) × 100. Si overrunPercent > alertThreshold, marcar overrunDetected=true. Desglosar por categorías de gasto para identificar affectedCategories.

**Por qué estos outputs:** overrunDetected es el flag que el agente usa para disparar notificaciones automáticas al CFO o gerente de planta. overrunPercent cuantifica la severidad para priorizar la respuesta. affectedCategories permite al agente generar recomendaciones específicas (ej: si es energía, recomendar optimize_energy_usage).

**Sugerencia de UI:** Widget de alerta financiera con presupuesto vs real en barras horizontales. Gauge de termómetro mostrando overrunPercent con zona de alerta en rojo. Lista de categorías afectadas con varianza por categoría en formato tabla.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

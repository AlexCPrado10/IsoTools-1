---
tipo: tool
id: predict_production_delays
nombre: "Predecir Retrasos de Producción"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Predecir Retrasos de Producción
> `predict_production_delays` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Predice retrasos en órdenes de producción antes de que ocurran usando señales tempranas.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** orderId identifica la orden de producción específica con su ruta de operaciones, materiales y recursos asignados. dueDate es la fecha comprometida con el cliente, contra la que se evalúa el riesgo — el agente la usa para determinar si hay margen de recuperación o si se debe alertar al cliente.

**Cálculos:** Obtener el estado actual de la orden (operaciones completadas, en proceso, pendientes). Calcular el tiempo restante estimado basado en velocidades actuales y la capacidad disponible. Calcular delayProbability usando regresión logística entrenada con datos históricos de órdenes similares. Identificar riskFactors: cuellos de botella, materiales pendientes, mantenimientos programados.

**Por qué estos outputs:** delayProbability permite al agente priorizar qué órdenes atender primero. estimatedDelayHours es el tiempo que el equipo de ventas necesita para negociar una nueva fecha con el cliente. riskFactors indica al agente qué acciones tomar: acelerar compra de materiales, reasignar recursos o ajustar la secuencia de producción.

**Sugerencia de UI:** Tarjeta de orden con barra de progreso y fecha estimada de completación. Indicador de probabilidad de retraso con color (verde <30%, amarillo 30-70%, rojo >70%). Lista de factores de riesgo con íconos descriptivos y botones de acción rápida.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

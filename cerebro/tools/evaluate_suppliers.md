---
tipo: tool
id: evaluate_suppliers
nombre: "Evaluar Proveedores"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Evaluar Proveedores
> `evaluate_suppliers` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Puntúa proveedores en precio, calidad, lead time y cumplimiento histórico.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** supplierIds lista los proveedores a evaluar — puede ser toda la base o candidatos para una categoría. criteria es el peso de cada dimensión de evaluación (ej: {precio: 0.3, calidad: 0.4, cumplimiento: 0.3}) que el agente aplica según la política de compras de la empresa.

**Cálculos:** Para cada proveedor, obtener métricas históricas: tasa de entregas a tiempo, porcentaje de rechazo por calidad, precio promedio vs mercado, capacidad de respuesta. Aplicar el método AHP (Analytic Hierarchy Process) o suma ponderada con los pesos de criteria para calcular un score final 0-100.

**Por qué estos outputs:** rankings es la lista ordenada de proveedores por score, que el agente usa para seleccionar automáticamente el proveedor óptimo en recommend_purchase_orders. Incluir el score desagregado por criterio permite al equipo de compras auditar la decisión del agente.

**Sugerencia de UI:** Tabla de ranking con proveedor, score total y mini-barras de progreso por criterio. Gráfica radar (spider chart) comparando los top 3 proveedores. Badge de proveedor preferido/aprobado/suspendido.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

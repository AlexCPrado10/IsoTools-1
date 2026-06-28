---
tipo: tool
id: categorize_expenses
nombre: "Categorizar Gastos"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Categorizar Gastos
> `categorize_expenses` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Clasifica automáticamente transacciones y gastos operativos en categorías contables.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** transactions es el array de movimientos financieros sin categorizar (típicamente exportados del ERP o sistema contable). Incluye descripción del proveedor, monto y fecha. El agente necesita categorizarlos automáticamente para análisis de costos sin intervención manual en cada transacción.

**Cálculos:** Aplicar clasificación con NLP: usar un modelo de texto (BERT fine-tuned o reglas + ML) entrenado con el catálogo de cuentas contables de la empresa. Mapear cada transacción a una categoría (materia prima, mantenimiento, energía, mano de obra, etc.) y subcategoría. Marcar para revisión humana si confianza < 80%.

**Por qué estos outputs:** categorized permite al agente generar reportes de costo por categoría, detectar anomalías de gasto y alimentar detect_budget_overrun con datos estructurados. La subcategoría permite análisis granular para decisiones de reducción de costos específicos.

**Sugerencia de UI:** Vista de lista de transacciones con dropdown editable de categoría por fila para correcciones manuales. Gráfica de dona mostrando distribución del gasto por categoría. Botón de exportar categorización para importar al ERP.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

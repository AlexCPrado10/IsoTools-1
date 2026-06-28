---
tipo: tool
id: detect_production_deviation
nombre: "Detectar Desviación de Producción"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Detectar Desviación de Producción
> `detect_production_deviation` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Identifica desviaciones entre la producción planificada y la ejecutada, clasificando su causa raíz.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** lineId identifica la línea de producción específica (cada línea tiene su propia meta de producción). shiftDate selecciona el turno a analizar — las desviaciones se calculan por turno para poder comparar entre turnos y detectar problemas relacionados con operadores o condiciones específicas del turno.

**Cálculos:** Obtener la producción planificada del plan maestro. Obtener la producción real de los sistemas SCADA/MES para lineId y shiftDate. Calcular deviationPercent. Aplicar análisis de causa raíz consultando los registros de paros: si hay un paro mayor al 10% del tiempo del turno, es el rootCause. Calcular impactUnits = meta × (deviationPercent/100).

**Por qué estos outputs:** deviationPercent es el indicador que el agente usa para decidir si escalar la alerta a supervisión. rootCause permite al agente generar una acción correctiva específica (ej: si es 'falta de material', lanzar un pedido urgente). impactUnits cuantifica el costo de la desviación en unidades no producidas.

**Sugerencia de UI:** Panel de turno con indicador circular de OEE real vs meta. Barra horizontal comparando producción planificada vs real. Chip de causa raíz con ícono de alerta y texto descriptivo. Timeline del turno mostrando períodos de producción y paros.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

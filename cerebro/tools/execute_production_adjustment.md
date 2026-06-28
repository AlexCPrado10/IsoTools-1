---
tipo: tool
id: execute_production_adjustment
nombre: "Ejecutar Ajuste de Producción"
categoria: production
agente: produccion-avanzada
estado: catalogo
consume: [FLOW_OPTIMIZED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, production, catalogo]
---
# Ejecutar Ajuste de Producción
> `execute_production_adjustment` · Edge · categoría **production** · estado **catalogo**
> Pertenece al agente [[../agentes/produccion-avanzada|Agente de Producción Avanzada]]
## Qué hace
Aplica ajustes de parámetros de máquina o secuencia recomendados por el agente cloud.
## Contrato de eventos
- **Consume:** `FLOW_OPTIMIZED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** machineId identifica la máquina en la que se harán los ajustes de proceso. adjustments contiene los parámetros a modificar y sus nuevos valores (ej: {speed: 1200, temperature: 185, pressure: 6.5}) — el agente calcula estos valores a partir del análisis de desviaciones de proceso o del optimizador de producción.

**Cálculos:** Validar que machineId está en estado 'running' o 'idle' (nunca ajustar una máquina en falla). Para cada parámetro en adjustments, verificar que el nuevo valor está dentro del rango seguro definido en el plan de control del proceso. Conectar al PLC de la máquina y escribir los nuevos setpoints vía el protocolo configurado. Verificar que los setpoints se aplicaron leyendo los valores actuales vs los escritos.

**Por qué estos outputs:** applied confirma que los ajustes se ejecutaron correctamente — el agente continúa monitoreando el proceso para verificar que los cambios mejoran los indicadores objetivo. adjustmentsCount indica cuántos parámetros se ajustaron (si adjustmentsCount < len(adjustments), algunos fallaron). timestamp es el registro de auditoría de cuándo se realizó cada ajuste.

**Sugerencia de UI:** Panel de ajuste con tabla de parámetros: nombre, valor anterior, valor nuevo, estado de escritura. Comparativa antes/después de las gráficas de proceso. Log de ajustes del turno con usuario/agente que los ejecutó. Botón de revertir al setpoint anterior.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[optimize_production_flow]] — `FLOW_OPTIMIZED` → [[../comunicaciones/optimize_production_flow__execute_production_adjustment]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

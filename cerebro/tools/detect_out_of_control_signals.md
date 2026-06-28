---
tipo: tool
id: detect_out_of_control_signals
nombre: "Detectar Señales Fuera de Control"
categoria: quality
agente: calidad-spc
estado: implementada
consume: [CHART_POINTS_UPDATED]
produce: [OUT_OF_CONTROL_DETECTED]
programador:
actualizado: 2026-06-28
tags: [tool, quality, implementada]
---
# Detectar Señales Fuera de Control
> `detect_out_of_control_signals` · Cloud · categoría **quality** · estado **implementada**
> Pertenece al agente [[../agentes/calidad-spc|Agente de Calidad & SPC]]
## Qué hace
Aplica reglas de Nelson y Western Electric para detectar patrones especiales de causa asignable en cartas de control.
## Contrato de eventos
- **Consume:** `CHART_POINTS_UPDATED`
- **Produce:** `OUT_OF_CONTROL_DETECTED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `chartId` para registrar qué carta específica se analizó y vincular la violación con la característica correcta. `plotPoints` son las estadísticas calculadas (medias de subgrupo, rangos) que se evalúan contra las reglas; se pasan explícitamente para desacoplar el cálculo de límites de la detección de patrones. `ucl`, `lcl`, `centerLine` definen las zonas (A: ±3σ, B: ±2σ, C: ±1σ) necesarias para las reglas de Nelson. `rulesSet` permite elegir el conjunto de reglas según la rigurosidad requerida: Nelson incluye 8 reglas, Western Electric 4 reglas fundamentales.

**Cálculos:** Calcular las zonas A, B, C: zona_A = [centerLine ± (ucl-centerLine)], zona_B = [centerLine ± 2(ucl-centerLine)/3], zona_C = [centerLine ± (ucl-centerLine)/3]. Aplicar Regla 1 Nelson: un punto fuera de UCL/LCL. Regla 2: 9 puntos consecutivos en el mismo lado de la línea central. Regla 3: 6 puntos consecutivos monotónicamente crecientes o decrecientes. Regla 4: 14 puntos alternando arriba/abajo. Regla 5: 2 de 3 puntos consecutivos en zona A. Regla 6: 4 de 5 puntos en zona B o más allá. Regla 7: 15 puntos consecutivos en zona C. Regla 8: 8 puntos a ambos lados de la línea central sin ninguno en zona C. Agregar en `violations` solo las reglas violadas con los índices de puntos involucrados.

**Por qué estos outputs:** `violationsDetected` es el flag booleano que el agente usa para decidir si escalar o continuar. `violations` con su descripción y puntos específicos permite al agente comunicar exactamente qué patrón se detectó al equipo de calidad, sin que estos necesiten interpretar los datos crudos. La descripción textual de cada violación facilita la capacitación del personal.

**Sugerencia de UI:** Carta de control con los puntos involucrados en cada violación resaltados en color diferente por regla. Panel lateral con lista de violaciones detectadas, indicando regla violada, descripción en español y puntos afectados (numerados). Toggle para activar/desactivar cada regla individualmente. Badge contador de violaciones totales en la cabecera.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/detect_out_of_control_signals__manage_nonconformances]] — `OUT_OF_CONTROL_DETECTED` → [[manage_nonconformances]]
**Esta tool es disparada por:**
- [[calculate_control_charts]] — `CHART_POINTS_UPDATED` → [[../comunicaciones/calculate_control_charts__detect_out_of_control_signals]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

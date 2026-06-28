---
tipo: tool
id: optimize_production_sequence
nombre: "Optimizar Secuencia de Producción"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: [DEVIATION_DETECTED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Optimizar Secuencia de Producción
> `optimize_production_sequence` · Cloud · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Optimiza la secuencia de trabajo en máquinas usando algoritmos de programación combinatoria.
## Contrato de eventos
- **Consume:** `DEVIATION_DETECTED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** jobs es la lista de órdenes de producción con sus datos clave: tiempo de procesamiento por operación, fecha de entrega comprometida y prioridad. machines es el número de máquinas disponibles en la línea — el agente usa esto para calcular el problema de secuenciación correcto (single-machine, parallel machines, flow shop).

**Cálculos:** Enviar las órdenes pendientes, tiempos de ciclo y capacidades al módulo de secuenciación del APS (SAP PP/DS, Opcenter APS, Preactor). Pasar las restricciones de setup y ventanas de mantenimiento. Obtener la secuencia de producción optimizada devuelta por el APS. El tool no implementa algoritmos de scheduling; delega en el software APS existente.

**Por qué estos outputs:** optimizedSequence es el orden exacto en que cada máquina debe procesar las órdenes — se envía al MES para reprogramar la producción. makespanReduction es el beneficio tangible de la optimización que justifica su uso ante los operadores.

**Sugerencia de UI:** Diagrama de Gantt comparativo: secuencia actual vs optimizada, con el makespan de cada una resaltado. Tabla de órdenes con posición en secuencia actual y nueva posición. Métricas de beneficio: horas ahorradas, órdenes a tiempo. Botón de aplicar la secuencia al MES.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[detect_process_deviation]] — `DEVIATION_DETECTED` → [[../comunicaciones/detect_process_deviation__optimize_production_sequence]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

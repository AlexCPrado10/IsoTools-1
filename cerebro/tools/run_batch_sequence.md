---
tipo: tool
id: run_batch_sequence
nombre: "Ejecutar Secuencia de Lote ISA-88"
categoria: control
agente: control-scada
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, control, catalogo]
---
# Ejecutar Secuencia de Lote ISA-88
> `run_batch_sequence` · Edge · categoría **control** · estado **catalogo**
> Pertenece al agente [[../agentes/control-scada|Agente de Control & SCADA]]
## Qué hace
Ejecuta recetas de producción por lotes siguiendo el modelo de procedimientos ISA-88 con control de fase y transiciones.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `recipeId` para cargar la receta maestra del producto (procedimientos, fases, parámetros de proceso) desde el servidor de recetas siguiendo el modelo ISA-88. `batchId` es el identificador único del lote que garantiza trazabilidad completa desde materias primas hasta producto terminado (requerido por GMP e ISO 22000). `unitId` identifica el equipo físico donde se ejecutará el lote, verificando que las capacidades del equipo (volumen, temperatura máxima) son compatibles con la receta. `parameters` permite parametrizar la receta maestra para producir variantes del producto sin crear recetas nuevas.

**Cálculos:** Enviar la solicitud de ejecución del batch al servidor ISA-88 del DCS/PCS (Siemens SIMATIC Batch, ABB 800xA Batch, Emerson DeltaV Batch). Pasar `recipeId`, `batchId`, `unitId` y los `parameters` al servidor vía su API. Monitorear el estado consultando el endpoint de estado del batch periódicamente (fases activas, step actual, alarmas). El servidor de batch gestiona la ejecución de fases, transiciones de estado y control de equipos; este tool solo inicia, monitorea y reporta el estado.

**Por qué estos outputs:** `currentPhase` permite al agente saber qué paso de la receta está activo y si es seguro intervenir. `status` es el estado de la máquina de estados ISA-88; el agente reacciona diferente ante 'paused' (puede reanudar) vs 'aborted' (requiere acción correctiva). `progressPercent` alimenta la visibilidad de producción. `deviationsCount` es el indicador de calidad del lote en proceso.

**Sugerencia de UI:** Visualizador de receta tipo diagrama de flujo con la fase actual resaltada y fases anteriores marcadas como completadas. Barra de progreso del lote con tiempo transcurrido y tiempo estimado restante. Panel lateral con parámetros del lote activo y contador de desviaciones. Botones de Pausa, Abortar y Ver Log de Fase.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

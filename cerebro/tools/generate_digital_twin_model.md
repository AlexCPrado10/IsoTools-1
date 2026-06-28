---
tipo: tool
id: generate_digital_twin_model
nombre: "Generar Modelo de Gemelo Digital"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: [FAILURE_PREDICTED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Generar Modelo de Gemelo Digital
> `generate_digital_twin_model` · Cloud · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Construye el modelo matemático del gemelo digital a partir de datos históricos y CAD.
## Contrato de eventos
- **Consume:** `FAILURE_PREDICTED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** assetId identifica el activo físico a replicar digitalmente (máquina, celda de manufactura, línea completa). historicalDatasetId apunta al dataset de datos operativos históricos (sensores, parámetros de proceso, fallas, mantenimientos) que se usarán para calibrar el modelo digital. cadFileUrl es el modelo 3D CAD del activo para la representación geométrica fiel del gemelo.

**Cálculos:** Cargar el modelo CAD y convertirlo al formato de simulación (FMU/FMI standard o formato propietario). Entrenar el modelo físico-dinámico usando los datos históricos: ajustar parámetros del modelo matemático (constantes de tiempo, coeficientes de fricción, etc.) mediante optimización por mínimos cuadrados o algoritmos bayesianos. Calcular modelAccuracy comparando las salidas del modelo vs los datos reales de validación.

**Por qué estos outputs:** modelId es la referencia del gemelo digital que se usa en simulate_operations y feed_real_time_data_to_twin. modelAccuracy indica qué tan fielmente representa el gemelo al activo real. simulationReady indica si el gemelo está listo para ejecutar escenarios what-if.

**Sugerencia de UI:** Visualización 3D interactiva del activo con el modelo CAD renderizado. Indicadores de fidelidad del modelo por subsistema (mecánico, eléctrico, térmico). Panel de métricas de calibración: accuracy, error medio, error máximo. Botón de activar sincronización en tiempo real.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[predict_machine_failure]] — `FAILURE_PREDICTED` → [[../comunicaciones/predict_machine_failure__generate_digital_twin_model]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

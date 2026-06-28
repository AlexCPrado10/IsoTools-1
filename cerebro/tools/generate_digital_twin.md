---
tipo: tool
id: generate_digital_twin
nombre: "Generar Gemelo Digital"
categoria: digital-twin
agente: digital-twin
estado: catalogo
consume: [TWIN_DATA_UPDATED]
produce: [TWIN_READY]
programador:
actualizado: 2026-06-28
tags: [tool, digital-twin, catalogo]
---
# Generar Gemelo Digital
> `generate_digital_twin` · Cloud · categoría **digital-twin** · estado **catalogo**
> Pertenece al agente [[../agentes/digital-twin|Agente de Digital Twin]]
## Qué hace
Crea la representación virtual de un activo o sistema industrial con su comportamiento físico.
## Contrato de eventos
- **Consume:** `TWIN_DATA_UPDATED`
- **Produce:** `TWIN_READY`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** assetId identifica el activo físico a replicar: puede ser una máquina individual, una línea completa o toda la planta. assetType determina la complejidad del gemelo a crear: 'machine' es un modelo de un activo individual con sus parámetros físicos, 'line' modela las interacciones entre máquinas, 'plant' es el gemelo más complejo que incluye logística interna.

**Cálculos:** Consultar el catálogo de activos para obtener las especificaciones de assetId. Seleccionar la plantilla de modelo según assetType. Inicializar el gemelo digital: crear la representación virtual del activo con sus parámetros configurados (dimensiones, materiales, parámetros de proceso, historial de mantenimiento). Calcular fidelityScore comparando las salidas del modelo vs datos históricos reales usando métricas de error (MAE, RMSE).

**Por qué estos outputs:** twinId es el identificador que se usa en simulate_operations y feed_real_time_data_to_twin para referenciar este gemelo específico. syncStatus indica si el gemelo está recibiendo datos en tiempo real ('synced', 'pending', 'offline'). fidelityScore es la confianza en las predicciones del gemelo — un score < 0.85 indica que el modelo necesita recalibración.

**Sugerencia de UI:** Visualización 3D del activo con el gemelo digital renderizado. Indicador de sincronización en tiempo real (última actualización hace X segundos). Gauge de fidelityScore con umbral configurable. Panel de escenarios what-if disponibles para este gemelo.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/generate_digital_twin__simulate_operations]] — `TWIN_READY` → [[simulate_operations]]
**Esta tool es disparada por:**
- [[feed_real_time_data_to_twin]] — `TWIN_DATA_UPDATED` → [[../comunicaciones/feed_real_time_data_to_twin__generate_digital_twin]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

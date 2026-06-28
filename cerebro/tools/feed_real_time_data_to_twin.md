---
tipo: tool
id: feed_real_time_data_to_twin
nombre: "Alimentar Gemelo con Datos en Tiempo Real"
categoria: digital-twin
agente: digital-twin
estado: catalogo
consume: [SENSOR_DATA_READY]
produce: [TWIN_DATA_UPDATED]
programador:
actualizado: 2026-06-28
tags: [tool, digital-twin, catalogo]
---
# Alimentar Gemelo con Datos en Tiempo Real
> `feed_real_time_data_to_twin` · Edge · categoría **digital-twin** · estado **catalogo**
> Pertenece al agente [[../agentes/digital-twin|Agente de Digital Twin]]
## Qué hace
Transmite datos del piso de planta en tiempo real al gemelo digital en la nube.
## Contrato de eventos
- **Consume:** `SENSOR_DATA_READY`
- **Produce:** `TWIN_DATA_UPDATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** twinId identifica el gemelo digital que se va a actualizar con datos frescos del piso de planta. sensorReadings es el array de lecturas de sensores recolectadas por collect_sensor_data o collect_process_signals — incluye todos los parámetros de estado del activo físico. batchSize define cuántas lecturas enviar en cada llamada para balancear la latencia de sincronización vs el overhead de comunicación.

**Cálculos:** Validar que twinId existe y está en estado activo. Para cada sensorReading del array, mapear el sensorId al parámetro correspondiente del modelo del gemelo. Actualizar el estado interno del gemelo digital con los nuevos valores. Calcular twinSyncLatencyMs como la diferencia entre el timestamp del sensorReading más reciente y el timestamp actual. Marcar twinSyncStatus según la latencia: 'synced' si < 1s, 'delayed' si < 10s, 'stale' si > 10s.

**Por qué estos outputs:** recordsSent confirma que el gemelo recibió datos frescos (si es 0, el gemelo está desactualizado y sus predicciones son poco confiables). twinSyncLatencyMs es el indicador de la calidad del gemelo en tiempo real — latencias altas pueden invalidar los resultados de simulate_operations. twinSyncStatus permite al agente advertir a los usuarios antes de ejecutar simulaciones con un gemelo que tiene datos obsoletos.

**Sugerencia de UI:** Indicador de sincronización del gemelo con latencia en tiempo real (ms) y estado (Sincronizado/Retrasado/Desactualizado). Gráfica de latencia de sincronización en el tiempo. Contador de registros enviados por minuto. Alerta si twinSyncStatus='stale' bloqueando nuevas simulaciones.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/feed_real_time_data_to_twin__generate_digital_twin]] — `TWIN_DATA_UPDATED` → [[generate_digital_twin]]
**Esta tool es disparada por:**
- [[collect_sensor_data]] — `SENSOR_DATA_READY` → [[../comunicaciones/collect_sensor_data__feed_real_time_data_to_twin]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

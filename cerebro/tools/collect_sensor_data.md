---
tipo: tool
id: collect_sensor_data
nombre: "Recolectar Datos de Sensores"
categoria: infrastructure
agente: infraestructura-edge
estado: catalogo
consume: []
produce: [ANALOG_DATA_BUFFERED, SENSOR_DATA_READY]
programador:
actualizado: 2026-06-28
tags: [tool, infrastructure, catalogo]
---
# Recolectar Datos de Sensores
> `collect_sensor_data` · Edge · categoría **infrastructure** · estado **catalogo**
> Pertenece al agente [[../agentes/infraestructura-edge|Agente de Infraestructura & Edge]]
## Qué hace
Agrega lecturas de múltiples sensores (temperatura, presión, vibración) en un buffer local.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `ANALOG_DATA_BUFFERED`, `SENSOR_DATA_READY`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** sensorIds lista todos los sensores a leer en una sola operación (temperatura, presión, flujo, nivel, etc.) para obtener un snapshot sincronizado del estado del proceso. intervalMs define la frecuencia de muestreo — intervalos cortos (100ms) para procesos rápidos de control, intervalos largos (60000ms) para monitoreo de tendencias de proceso lento.

**Cálculos:** Para cada sensorId, establecer comunicación con el sensor o su concentrador de datos (data gateway). Leer el valor actual en el instante más próximo a la solicitud para maximizar la sincronía entre sensores. Convertir el valor crudo a unidades de ingeniería usando la curva de calibración del sensor. Buffear las lecturas y devolver todas juntas. bufferedCount indica cuántas lecturas se acumularon en el buffer entre intervalos.

**Por qué estos outputs:** readings es el array de valores sincronizados que alimenta los análisis de proceso: detect_process_deviation, predict_machine_failure, run_local_inference. El conjunto de lecturas simultáneas permite detectar correlaciones entre señales. bufferedCount ayuda a detectar si la tasa de muestreo está generando acumulación.

**Sugerencia de UI:** Dashboard de proceso con widgets de gauge por sensor: valor actual con unidad y rango normal. Semáforo de estado por sensor (normal/alerta/alarma). Gráfica multi-línea de tendencia de todos los sensores en el tiempo. Configurador de intervalos de muestreo por sensor.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/collect_sensor_data__digitize_analog_signals]] — `ANALOG_DATA_BUFFERED` → [[digitize_analog_signals]]
- [[../comunicaciones/collect_sensor_data__feed_real_time_data_to_twin]] — `SENSOR_DATA_READY` → [[feed_real_time_data_to_twin]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

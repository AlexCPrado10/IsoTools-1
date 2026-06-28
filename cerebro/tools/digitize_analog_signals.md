---
tipo: tool
id: digitize_analog_signals
nombre: "Digitalizar Señales Analógicas"
categoria: infrastructure
agente: infraestructura-edge
estado: catalogo
consume: [ANALOG_DATA_BUFFERED]
produce: [SIGNAL_DIGITIZED]
programador:
actualizado: 2026-06-28
tags: [tool, infrastructure, catalogo]
---
# Digitalizar Señales Analógicas
> `digitize_analog_signals` · Edge · categoría **infrastructure** · estado **catalogo**
> Pertenece al agente [[../agentes/infraestructura-edge|Agente de Infraestructura & Edge]]
## Qué hace
Convierte señales analógicas 4-20mA / 0-10V de equipos legacy a datos digitales estructurados.
## Contrato de eventos
- **Consume:** `ANALOG_DATA_BUFFERED`
- **Produce:** `SIGNAL_DIGITIZED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** channelId identifica el canal del módulo de adquisición de datos (ADC) donde está conectada la señal analógica del sensor. signalType especifica el estándar de señal: 4-20mA (corriente, más robusto contra interferencia para distancias largas) o 0-10V (voltaje, para distancias cortas). engineeringMin y engineeringMax definen la escala de la variable física.

**Cálculos:** Leer el valor crudo del ADC del channelId (típicamente en cuentas: 0-65535 para 16 bits). Aplicar la conversión de señal: para 4-20mA, el valor crudo corresponde a 4mA (min) a 20mA (max); para 0-10V, 0V a 10V. Mapear linealmente al rango de ingeniería: engineeringValue = engineeringMin + (rawValue - minRaw) / (maxRaw - minRaw) × (engineeringMax - engineeringMin). Aplicar filtros de ruido si están configurados.

**Por qué estos outputs:** rawValue permite diagnóstico: si está en 0 o en el máximo, puede indicar cable cortado o sensor en cortocircuito. engineeringValue es el valor en unidades físicas reales (°C, bar, m³/h) que usan todas las tools de análisis. unit permite que las herramientas de análisis apliquen los límites correctos de alarma.

**Sugerencia de UI:** Widget de medición con dos valores: rawValue (mA o V) y engineeringValue con unidad. Barra horizontal de rango con el valor actual como marcador. Indicador de estado de señal (normal/señal rota/saturada). Histórico de la señal en gráfica de línea.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/digitize_analog_signals__orchestrate_edge_nodes]] — `SIGNAL_DIGITIZED` → [[orchestrate_edge_nodes]]
**Esta tool es disparada por:**
- [[collect_sensor_data]] — `ANALOG_DATA_BUFFERED` → [[../comunicaciones/collect_sensor_data__digitize_analog_signals]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

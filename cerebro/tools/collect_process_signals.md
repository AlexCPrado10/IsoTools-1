---
tipo: tool
id: collect_process_signals
nombre: "Recolectar Señales de Proceso"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: []
produce: [SIGNALS_READY]
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Recolectar Señales de Proceso
> `collect_process_signals` · Edge · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Lee señales de proceso (temperatura, presión, flujo) desde PLCs y controladores vía OPC-UA/Modbus.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `SIGNALS_READY`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** deviceId identifica el dispositivo de campo (PLC, DCS, PAC) del que se leerán los datos. protocol especifica cómo conectar: OPC-UA es el estándar moderno industrial con seguridad integrada, Modbus TCP/RTU es el protocolo legacy más común en planta, MQTT es para dispositivos IoT edge. tags es la lista de variables a leer.

**Cálculos:** Establecer conexión con el dispositivo usando el protocolo especificado. Para OPC-UA: conectar al servidor OPC-UA, autenticar con certificado, leer los NodeIDs correspondientes a los tags. Para Modbus: calcular las direcciones de registro para cada tag, ejecutar Read Holding Registers. Para MQTT: suscribirse a los topics correspondientes. Mapear los valores brutos a unidades de ingeniería.

**Por qué estos outputs:** readings es el array de valores que alimenta todos los análisis posteriores: detect_real_time_anomalies, predict_machine_failure, run_local_inference. Incluir unit en cada reading es esencial para que los algoritmos de análisis apliquen los umbrales correctos. timestamp permite la sincronización temporal entre señales de diferentes dispositivos.

**Sugerencia de UI:** Dashboard de señales en tiempo real con un widget por tag: valor actual, unidad, timestamp de última lectura. Indicador de estado de conexión al dispositivo (Online/Offline). Gráficas de tendencia por señal en ventana deslizante. Configurador visual de tags a monitorear.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/collect_process_signals__detect_real_time_anomalies]] — `SIGNALS_READY` → [[detect_real_time_anomalies]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: monitor_scada_tags
nombre: "Monitorear Tags SCADA"
categoria: control
agente: control-scada
estado: catalogo
consume: []
produce: [PROCESS_VARIABLE_UPDATED, TAG_LIMIT_EXCEEDED]
programador:
actualizado: 2026-06-28
tags: [tool, control, catalogo]
---
# Monitorear Tags SCADA
> `monitor_scada_tags` · Edge · categoría **control** · estado **catalogo**
> Pertenece al agente [[../agentes/control-scada|Agente de Control & SCADA]]
## Qué hace
Lee y publica en tiempo real el estado de tags de proceso (AI, DI, AO, DO) desde PLCs y RTUs vía OPC-UA o Modbus.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `PROCESS_VARIABLE_UPDATED`, `TAG_LIMIT_EXCEEDED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `tagIds` como array para permitir la suscripción simultánea a múltiples puntos de datos del PLC en una sola llamada, reduciendo la sobrecarga de red respecto a llamadas individuales. `protocol` es obligatorio porque cada driver requiere configuración diferente: OPC-UA usa modelo de seguridad basado en certificados, Modbus-TCP requiere registro/coil address, DNP3 maneja datos por clase. `scanRateMs` (default 500 ms) define el ciclo de lectura: valores menores mejoran la respuesta pero incrementan el tráfico de red y la carga del PLC.

**Cálculos:** Establecer conexión al servidor OPC-UA o socket Modbus según `protocol`. Para cada `tagId`, mapear al nodo OPC-UA NodeId o al registro Modbus según tabla de configuración. Leer valor en el ciclo definido por `scanRateMs`. Evaluar `quality`: 'good' si la comunicación es exitosa y el valor está en rango de hardware; 'bad' si hay timeout o error de comunicación; 'uncertain' si el dispositivo reporta calidad degradada. Registrar `timestamp` con precisión de milisegundos (ISO 8601) para trazabilidad temporal. Adjuntar `unit` desde la tabla de ingeniería de tags.

**Por qué estos outputs:** El array `tags` con valor, calidad y timestamp es el dato atómico que el agente necesita para tomar decisiones de control. `quality` es crítico: el agente debe ignorar o escalar lecturas 'bad' para no actuar sobre datos corruptos. `timestamp` permite correlacionar eventos entre múltiples tags y detectar condiciones simultaneas.

**Sugerencia de UI:** Tabla de tags en vivo con actualización automática según `scanRateMs`. Columnas: Tag ID, Valor, Unidad, Calidad (icono semáforo), Timestamp. Resaltado de fila en amarillo para 'uncertain' y rojo para 'bad'. Filtro por calidad y buscador de tags. Indicador de latencia de comunicación en la cabecera.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/monitor_scada_tags__execute_pid_control]] — `PROCESS_VARIABLE_UPDATED` → [[execute_pid_control]]
- [[../comunicaciones/monitor_scada_tags__trigger_process_alarm]] — `TAG_LIMIT_EXCEEDED` → [[trigger_process_alarm]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

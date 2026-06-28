---
tipo: tool
id: log_process_historian
nombre: "Registrar en Historiador de Proceso"
categoria: control
agente: control-scada
estado: catalogo
consume: [PID_OUTPUT_UPDATED]
produce: [HISTORIAN_BATCH_READY]
programador:
actualizado: 2026-06-28
tags: [tool, control, catalogo]
---
# Registrar en Historiador de Proceso
> `log_process_historian` · Edge · categoría **control** · estado **catalogo**
> Pertenece al agente [[../agentes/control-scada|Agente de Control & SCADA]]
## Qué hace
Almacena datos de proceso en historiador local con compresión por desviación, listo para consulta y reporte.
## Contrato de eventos
- **Consume:** `PID_OUTPUT_UPDATED`
- **Produce:** `HISTORIAN_BATCH_READY`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `tagIds` como array para permitir el registro simultáneo de múltiples variables de proceso en un solo ciclo de escritura, que es más eficiente que escrituras individuales. `compressionMode` es fundamental para gestionar el volumen de datos: 'raw' almacena cada muestra (puede generar TB/día en plantas grandes), 'swinging_door' (algoritmo SDT) almacena solo cuando la tendencia cambia significativamente, 'deadband' guarda solo cuando el valor cambia más del `deadbandPercent`. `deadbandPercent` (default 0.1%) calibra el balance entre fidelidad de datos y espacio de almacenamiento.

**Cálculos:** Llamar al API del Historian configurado para el entorno (PI Web API para OSIsoft PI, REST API para AVEVA Data Hub, o HistoricalAccess vía OPC-UA). Para escritura: enviar tag, valor y timestamp al endpoint de escritura del Historian. La compresión de datos (Swinging Door u otro algoritmo) la aplica el Historian internamente. Para lectura: consultar el endpoint de datos históricos con el rango de tiempo solicitado y devolver los valores ya interpolados/comprimidos por el Historian.

**Por qué estos outputs:** `recordsStored` confirma la escritura exitosa y permite estimar la tasa de compresión lograda. `compressionRatio` es el KPI de eficiencia de almacenamiento: ratios <10 pueden indicar que el deadband es demasiado pequeño. `storageUsedMB` alimenta alertas de capacidad del sistema. `oldestRecordTimestamp` informa el período histórico disponible para análisis.

**Sugerencia de UI:** Panel de configuración del historiador con checkboxes para seleccionar tags y dropdown para modo de compresión. Slider para `deadbandPercent` con preview estimado de reducción de datos. Medidor circular de espacio de almacenamiento usado vs disponible. Tabla de estado por tag: último valor almacenado, timestamp y compresión efectiva.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/log_process_historian__analyze_control_loop_performance]] — `HISTORIAN_BATCH_READY` → [[analyze_control_loop_performance]]
**Esta tool es disparada por:**
- [[execute_pid_control]] — `PID_OUTPUT_UPDATED` → [[../comunicaciones/execute_pid_control__log_process_historian]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

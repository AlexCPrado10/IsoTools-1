---
tipo: tool
id: execute_local_control_action
nombre: "Ejecutar Acción de Control Local"
categoria: infrastructure
agente: infraestructura-edge
estado: catalogo
consume: [PEAK_DEMAND_DETECTED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, infrastructure, catalogo]
---
# Ejecutar Acción de Control Local
> `execute_local_control_action` · Edge · categoría **infrastructure** · estado **catalogo**
> Pertenece al agente [[../agentes/infraestructura-edge|Agente de Infraestructura & Edge]]
## Qué hace
Escribe valores en PLCs y actuadores locales vía OPC-UA, Modbus o protocolos industriales.
## Contrato de eventos
- **Consume:** `PEAK_DEMAND_DETECTED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** deviceId identifica el dispositivo de campo a controlar (PLC, actuador, variador de frecuencia). tag es el nombre de la variable de salida en el dispositivo (ej: 'Setpoint_Velocidad', 'Valvula_01_Open'). value es el nuevo valor a escribir calculado por el agente a partir de los análisis realizados. protocol especifica cómo conectar al dispositivo para escribir el valor.

**Cálculos:** Conectar al dispositivo usando el protocol especificado. Validar que tag existe en el dispositivo y que value está dentro del rango seguro permitido. Ejecutar la escritura: para Modbus, escribir el registro de holding; para OPC-UA, llamar al método Write del servidor. Verificar la escritura leyendo el valor de vuelta (write-verify). Registrar la acción en el log de auditoría de control.

**Por qué estos outputs:** success confirma que el actuador ejecutó la acción — el agente necesita esta confirmación antes de continuar con la siguiente acción en su plan de respuesta. Si success=false, el agente intenta vías alternativas o escala a un operador humano. writtenValue es el valor efectivamente escrito. timestamp es esencial para el log de auditoría de acciones de control.

**Sugerencia de UI:** Panel de control con lista de acciones ejecutadas recientemente. Cada acción: ícono de éxito/fallo, dispositivo, tag, valor anterior y nuevo. Log de auditoría completo con filtros. Botón de deshacer la última acción (write el valor anterior). Alarma visual si success=false.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[monitor_energy_consumption]] — `PEAK_DEMAND_DETECTED` → [[../comunicaciones/monitor_energy_consumption__execute_local_control_action]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

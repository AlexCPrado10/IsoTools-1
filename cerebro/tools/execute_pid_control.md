---
tipo: tool
id: execute_pid_control
nombre: "Ejecutar Control PID"
categoria: control
agente: control-scada
estado: catalogo
consume: [PROCESS_VARIABLE_UPDATED]
produce: [PID_OUTPUT_UPDATED]
programador:
actualizado: 2026-06-28
tags: [tool, control, catalogo]
---
# Ejecutar Control PID
> `execute_pid_control` · Edge · categoría **control** · estado **catalogo**
> Pertenece al agente [[../agentes/control-scada|Agente de Control & SCADA]]
## Qué hace
Ejecuta lazos PID con autotuning, control en cascada y feedforward para variables de proceso críticas.
## Contrato de eventos
- **Consume:** `PROCESS_VARIABLE_UPDATED`
- **Produce:** `PID_OUTPUT_UPDATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `loopId` para identificar el lazo de control específico y cargar su configuración (rango de PV, límites de salida, historial de ajustes). `setpoint` es el valor objetivo del proceso, requerido en cada ejecución ya que puede cambiar dinámicamente por receta o planificación. `Kp`, `Ki`, `Kd` son los parámetros de sintonización: si se omiten, el controlador usa los valores almacenados en su configuración; si se proveen, permiten ajuste en línea sin necesidad de reiniciar. `mode` define si el controlador opera en automático (PID activo), manual (salida fija por operador) o cascada (la salida de este lazo es el setpoint de otro).

**Cálculos:** Conectar al PLC/DCS que aloja el lazo `loopId` vía OPC-UA. Escribir el nuevo setpoint en el nodo OPC-UA del tag SP del lazo. Si se proveen Kp/Ki/Kd, escribirlos en los nodos de parámetros del controlador existente. Leer de vuelta los nodos PV, OUT y modo actual del lazo. El algoritmo PID corre en el PLC/DCS con su ciclo nativo (10-100 ms); este tool solo gestiona el setpoint y lee el estado del lazo, no implementa el control.

**Por qué estos outputs:** `processVariable` confirma al agente el estado actual del proceso para validar convergencia. `controlOutput` (0-100%) es la señal que se escribe al actuador (válvula, variador); el agente puede limitar cambios bruscos. `error` cuantifica la desviación actual del setpoint para decisiones de escalado. `isSteadyState` indica al agente que el lazo convergió y es seguro avanzar a la siguiente fase de la receta.

**Sugerencia de UI:** Panel de lazo con gráfico de tendencias en tiempo real mostrando PV, Setpoint y Output superpuestos. Controles numéricos para editar Kp, Ki, Kd con validación de rango. Toggle de modo (Auto/Manual/Cascada) con confirmación modal. Indicador de estado 'En régimen' con animación de pulso verde.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/execute_pid_control__log_process_historian]] — `PID_OUTPUT_UPDATED` → [[log_process_historian]]
**Esta tool es disparada por:**
- [[monitor_scada_tags]] — `PROCESS_VARIABLE_UPDATED` → [[../comunicaciones/monitor_scada_tags__execute_pid_control]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

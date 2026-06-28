---
tipo: tool
id: collect_production_data
nombre: "Recolectar Datos de Producción"
categoria: production
agente: produccion-avanzada
estado: catalogo
consume: []
produce: [PRODUCTION_DATA_CAPTURED]
programador:
actualizado: 2026-06-28
tags: [tool, production, catalogo]
---
# Recolectar Datos de Producción
> `collect_production_data` · Edge · categoría **production** · estado **catalogo**
> Pertenece al agente [[../agentes/produccion-avanzada|Agente de Producción Avanzada]]
## Qué hace
Captura contadores de producción, tiempos de ciclo y paradas directamente desde máquinas.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `PRODUCTION_DATA_CAPTURED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** machineId identifica la máquina o celda de manufactura de la que se recolectan los datos de producción. protocol especifica cómo conectar a la máquina: OPC-UA para máquinas modernas con servidor OPC-UA integrado, Modbus para máquinas legacy con registros de contadores y estado en PLC.

**Cálculos:** Conectar a la máquina usando el protocol especificado. Leer los registros de producción: contador de piezas producidas en el turno (partsProduced), tiempo de ciclo de la última pieza (cycleTimeMs). Consultar el log de paros de la máquina para el turno actual: cada paro con su tiempo de inicio, duración y código de causa. Identificar el shiftId del turno activo según el calendario configurado.

**Por qué estos outputs:** partsProduced y cycleTimeMs son los datos base del OEE (Availability × Performance × Quality): cycleTimeMs permite calcular la Performance comparando vs el tiempo de ciclo ideal. stoppages son los eventos de Availability que se analizan con identify_idle_time_patterns. shiftId permite agregar los datos por turno para comparativas entre turnos.

**Sugerencia de UI:** Panel de producción del turno: piezas producidas vs meta, ciclo actual vs ideal, OEE del turno. Timeline de la máquina mostrando períodos de producción (verde), paro (rojo) y mantenimiento (azul). Contador en tiempo real de piezas con velocidad actual. Alerta si cycleTimeMs supera el estándar.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/collect_production_data__track_machine_state]] — `PRODUCTION_DATA_CAPTURED` → [[track_machine_state]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

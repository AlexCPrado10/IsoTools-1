---
tipo: tool
id: manage_setpoints
nombre: "Gestionar Setpoints"
categoria: control
agente: control-scada
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, control, catalogo]
---
# Gestionar Setpoints
> `manage_setpoints` · Edge · categoría **control** · estado **catalogo**
> Pertenece al agente [[../agentes/control-scada|Agente de Control & SCADA]]
## Qué hace
Lee, escribe y valida setpoints en controladores con límites de seguridad configurables y registro de cambios.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `tagId` para identificar el punto de control exacto en el PLC o DCS, ya que múltiples variables pueden tener setpoints en el mismo equipo. `action` ('read' o 'write') separa la lógica de solo consulta vs modificación, permitiendo auditar accesos de lectura diferente de cambios operativos. `value` es requerido solo en 'write' y debe ser validado antes de escribir. `operatorId` es trazabilidad obligatoria para el registro de cambios: cada modificación de setpoint debe tener un responsable identificado para auditorías de proceso y cumplimiento regulatorio.

**Cálculos:** Para 'read': consultar el valor actual del tag via OPC-UA ReadNode. Para 'write': primero verificar que `value` está dentro del rango [limitInferior, limitSuperior] configurado para ese tag; si viola límites, rechazar y retornar `withinLimits: false`. Si es válido, escribir al controlador via OPC-UA WriteNode o Modbus. Registrar en la tabla de change_log: tagId, previousValue, newValue, operatorId, timestamp. `changeLogged: true` confirma la persistencia en base de datos.

**Por qué estos outputs:** `previousValue` y `newValue` permiten al agente entender la magnitud del cambio y decidir si requiere confirmación adicional. `withinLimits` es la validación de seguridad: el agente debe abortar la operación si es false y alertar al supervisor. `changeLogged` garantiza la integridad de la auditoría de cambios de proceso, requerida por normas como FDA 21 CFR Part 11 en industria farmacéutica.

**Sugerencia de UI:** Formulario de setpoint con campo numérico que muestra los límites min/max configurados como hints. Indicador visual de rango (barra deslizante tipo slider solo visual). Historial de cambios recientes del tag en tabla con operador, valor anterior, nuevo valor y timestamp. Botón de confirmación con modal de doble verificación para cambios que excedan el 10% del rango.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

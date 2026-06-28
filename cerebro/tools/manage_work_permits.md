---
tipo: tool
id: manage_work_permits
nombre: "Gestionar Permisos de Trabajo"
categoria: safety
agente: seguridad-hse
estado: catalogo
consume: []
produce: [PERMIT_CLOSED]
programador:
actualizado: 2026-06-28
tags: [tool, safety, catalogo]
---
# Gestionar Permisos de Trabajo
> `manage_work_permits` · Cloud · categoría **safety** · estado **catalogo**
> Pertenece al agente [[../agentes/seguridad-hse|Agente de Seguridad Industrial & HSE]]
## Qué hace
Gestiona el flujo completo de permisos de trabajo (PTW): espacio confinado, trabajo en caliente, energías peligrosas (LOTO).
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `PERMIT_CLOSED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `permitType` para cargar el checklist específico del tipo de trabajo: un permiso de espacio confinado requiere medición de atmósfera y vigía, un trabajo en caliente requiere extintor y retiro de materiales combustibles, LOTO requiere el procedimiento específico de bloqueo de energías. `action` define el estado del flujo PTW: 'request' inicia el permiso, 'approve' lo autoriza (requiere supervisor calificado), 'execute' activa el permiso durante el trabajo, 'close' lo cierra al terminar, 'cancel' lo cancela antes de ejecutar. `location` es obligatorio para verificar que no hay conflictos entre permisos simultáneos en el mismo lugar. `requestedBy` registra al solicitante para trazabilidad.

**Cálculos:** Para 'request': generar `permitId`, cargar el checklist estándar del `permitType` según la norma aplicable (NOM-027-STPS para espacio confinado, NOM-022-STPS para electricidad). Verificar conflictos: buscar permisos activos en el mismo `location` que sean incompatibles (ej: no se puede tener permiso de trabajo en caliente y de gases inflamables en la misma área). Calcular `validUntil` = timestamp_actual + duración_estándar_del_tipo (espacio confinado: 4h, trabajo en caliente: 8h). Para 'approve': verificar que el aprobador tiene la habilitación requerida para ese `permitType`. `precautions`: lista de medidas de control requeridas por el checklist del tipo de permiso.

**Por qué estos outputs:** `permitId` es la referencia que el trabajador muestra en campo y que el agente vincula a la OT de mantenimiento. `status` permite al agente controlar el flujo del trabajo: si el permiso no está 'approved', el trabajo no puede iniciarse. `validUntil` permite al agente alertar al supervisor cuando el permiso está por vencer y el trabajo no ha concluido. `precautions` son las medidas de seguridad que el agente puede verificar en campo mediante sensores o confirmación del operador.

**Sugerencia de UI:** Formulario de solicitud de permiso tipo checklist digital con secciones por tipo de riesgo. Flujo de aprobación visual (solicitado → revisado → aprobado → activo → cerrado) con indicador de estado actual. QR code del permiso para mostrar en campo. Alerta de vencimiento 30 minutos antes de `validUntil`. Lista de permisos activos en el área con mapa de la planta.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/manage_work_permits__track_safety_kpis]] — `PERMIT_CLOSED` → [[track_safety_kpis]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

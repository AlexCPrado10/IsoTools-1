---
tipo: tool
id: schedule_energy_audit
nombre: "Programar Auditoría Energética"
categoria: energy
agente: energia-sustentabilidad
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, energy, catalogo]
---
# Programar Auditoría Energética
> `schedule_energy_audit` · Cloud · categoría **energy** · estado **catalogo**
> Pertenece al agente [[../agentes/energia-sustentabilidad|Agente de Energía & Sustentabilidad]]
## Qué hace
Planifica y programa auditorías energéticas internas o externas con checklist ISO 50002 y asignación de auditores.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para vincular la auditoría a la instalación correcta y recuperar las auditorías previas para verificar la frecuencia. `auditType` determina el alcance y los recursos: 'internal' usa auditores del equipo de energía propio, 'external' requiere empresa certificada externa, 'certification' implica el organismo de certificación ISO 50001 con requisitos documentales específicos. `targetDate` define la fecha objetivo para coordinar la disponibilidad de auditores y la preparación de la planta. `scope` especifica las áreas o sistemas a auditar (ej: ['compresores', 'sistema_de_vapor', 'alumbrado']) para planificar el tiempo y recursos requeridos.

**Cálculos:** Verificar que la fecha propuesta cumple con la frecuencia mínima de auditorías según el tipo (ISO 50001 requiere auditoría interna al menos anual). Calcular `estimatedDurationDays` basado en el número de elementos en `scope`: promedio de 0.5 días por sistema auditado. Asignar `assignedAuditors` según disponibilidad en el calendario y certificación requerida para el `auditType`. Generar el `checklistItems` cargando el checklist ISO 50002 para los sistemas en `scope`, contando el número total de puntos de verificación.

**Por qué estos outputs:** `auditId` es la referencia para registrar los hallazgos y el plan de acción post-auditoría. `scheduledDate` confirma la fecha comprometida que el agente usa para enviar recordatorios al equipo. `assignedAuditors` permite notificar a los auditores y bloquear su calendario. `checklistItems` dimensiona el esfuerzo de preparación de documentación para el equipo de la planta.

**Sugerencia de UI:** Calendario de auditorías energéticas anuales con vista de línea de tiempo. Formulario de programación con selector de fecha, tipo de auditoría y checkboxes de alcance. Card de auditoría programada con estado, auditores asignados y cuenta regresiva de días. Lista de documentos a preparar generada automáticamente según el checklist.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

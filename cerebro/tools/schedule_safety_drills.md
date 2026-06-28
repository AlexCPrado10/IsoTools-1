---
tipo: tool
id: schedule_safety_drills
nombre: "Programar Simulacros de Seguridad"
categoria: safety
agente: seguridad-hse
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, safety, catalogo]
---
# Programar Simulacros de Seguridad
> `schedule_safety_drills` · Cloud · categoría **safety** · estado **catalogo**
> Pertenece al agente [[../agentes/seguridad-hse|Agente de Seguridad Industrial & HSE]]
## Qué hace
Planifica y registra simulacros de evacuación, derrame, incendio y emergencia médica con evaluación de desempeño.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para vincular el simulacro al conjunto de brigadas, rutas de evacuación y puntos de reunión de esa instalación. `drillType` determina el escenario y los recursos necesarios: 'evacuation' requiere activar la alarma y medir el tiempo de evacuación, 'fire' incluye uso de extintores y mangueras, 'chemical_spill' requiere equipo de neutralización, 'medical_emergency' necesita desfibrilador y paramédico. `scheduledDate` es la fecha de ejecución; el agente debe verificar que no coincida con periodos de baja dotación de personal. `isAnnounced` (default false) define si el personal conoce la fecha del simulacro; los simulacros sorpresa (sin aviso) son más representativos del desempeño real.

**Cálculos:** Cargar el plan de emergencia del `plantId` para obtener las rutas de evacuación y puntos de reunión. Calcular `participantsRequired` = número de personas presentes en el turno planificado. Generar `evaluationCriteria` desde la biblioteca de criterios por tipo de simulacro: para evacuación incluir tiempo de evacuación (target < 3 min para planta estándar), conteo de personal en punto de reunión, desempeño de brigadas. `regulatoryComplianceCheck`: verificar si la normativa aplica (NOM-002-STPS requiere simulacro mínimo anual; ASEA puede requerir mayor frecuencia para instalaciones con materiales peligrosos).

**Por qué estos outputs:** `drillId` es la referencia para registrar los resultados del simulacro y calcular el tiempo de evacuación real vs objetivo. `scheduledDate` confirmado permite al agente enviar recordatorios al coordinador de emergencias y a los jefes de brigada. `evaluationCriteria` son los indicadores que el supervisor registrará durante el ejercicio. `regulatoryComplianceCheck` informa si el simulacro cumple con la frecuencia mínima exigida por ley.

**Sugerencia de UI:** Calendario anual de simulacros programados por tipo con semáforo de cumplimiento regulatorio. Formulario de programación con selección de tipo, fecha y escenario específico. Checklist digital de evaluación para usar durante el simulacro. Card de resultado post-simulacro con tiempo de evacuación real, participantes y observaciones. Reporte automático PDF para expediente regulatorio.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

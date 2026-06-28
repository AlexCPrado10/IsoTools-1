---
tipo: tool
id: report_safety_incident
nombre: "Reportar Incidente de Seguridad"
categoria: safety
agente: seguridad-hse
estado: catalogo
consume: [GAS_ALARM_TRIGGERED]
produce: [INCIDENT_REPORTED]
programador:
actualizado: 2026-06-28
tags: [tool, safety, catalogo]
---
# Reportar Incidente de Seguridad
> `report_safety_incident` · Cloud · categoría **safety** · estado **catalogo**
> Pertenece al agente [[../agentes/seguridad-hse|Agente de Seguridad Industrial & HSE]]
## Qué hace
Captura el reporte inicial de incidentes, accidentes, cuasi-accidentes y condiciones inseguras con clasificación OSHA/ISO 45001.
## Contrato de eventos
- **Consume:** `GAS_ALARM_TRIGGERED`
- **Produce:** `INCIDENT_REPORTED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `incidentType` para activar el flujo de notificaciones correcto: un 'near_miss' no requiere notificación a la STPS pero un 'accident' con días perdidos sí. `severity` determina el tiempo máximo de reporte: 'fatality' requiere reporte a la STPS en menos de 8 horas en México. `location` es necesaria para identificar el área de riesgo y actualizar el mapa de calor de incidentes. `description` captura el contexto inicial del evento que luego alimenta la investigación. `reportedBy` establece quién reportó para seguimiento y para calcular el indicador de cultura de reporte de incidentes.

**Cálculos:** Generar `incidentId` con nomenclatura estándar (INC-YYYY-MM-DD-SECUENCIAL). Aplicar clasificación OSHA/ISO 45001: calcular si aplica como OSHA Recordable (primeros auxilios no es recordable, tratamiento médico sí). Determinar `immediateActions` desde la biblioteca de respuestas por tipo de incidente (ej: para 'chemical_spill': aislar área, notificar brigade, evacuar si aplica). Generar lista de `notificationsSent`: supervisor inmediato siempre, seguridad siempre, médico de empresa si severity >= 'medical_treatment', dirección si severity = 'fatality'. `investigationRequired`: true si severity = 'lost_time', 'fatality' o 'property_damage'.

**Por qué estos outputs:** `incidentId` es la referencia para la investigación posterior y para el sistema de seguimiento de KPIs de seguridad (TRIR, LTIR). `classification` determina los requisitos legales de reporte. `notificationsSent` garantiza la trazabilidad del cumplimiento de los protocolos de escalado. `immediateActions` es la guía operativa para el personal que atiende el incidente en campo. `investigationRequired` activa el proceso de investigación formal.

**Sugerencia de UI:** Formulario mobile-friendly de reporte de incidente (diseñado para completarse en el sitio desde un smartphone). Campos obligatorios mínimos al inicio, campos adicionales en sección expandible. Geolocalización automática del lugar del incidente. Lista de acciones inmediatas generadas automáticamente con checkboxes para confirmar ejecución. Notificación push automática a los responsables listados.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/report_safety_incident__investigate_root_cause_hse]] — `INCIDENT_REPORTED` → [[investigate_root_cause_hse]]
**Esta tool es disparada por:**
- [[monitor_gas_sensors]] — `GAS_ALARM_TRIGGERED` → [[../comunicaciones/monitor_gas_sensors__report_safety_incident]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

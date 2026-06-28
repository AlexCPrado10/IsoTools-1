---
tipo: tool
id: investigate_root_cause_hse
nombre: "Investigar Causa Raíz HSE"
categoria: safety
agente: seguridad-hse
estado: catalogo
consume: [INCIDENT_REPORTED]
produce: [ROOT_CAUSE_SYSTEMIC]
programador:
actualizado: 2026-06-28
tags: [tool, safety, catalogo]
---
# Investigar Causa Raíz HSE
> `investigate_root_cause_hse` · Cloud · categoría **safety** · estado **catalogo**
> Pertenece al agente [[../agentes/seguridad-hse|Agente de Seguridad Industrial & HSE]]
## Qué hace
Ejecuta metodología de investigación de incidentes: árbol de causas, 5 Porqués y análisis de barreras para acciones preventivas.
## Contrato de eventos
- **Consume:** `INCIDENT_REPORTED`
- **Produce:** `ROOT_CAUSE_SYSTEMIC`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `incidentId` para cargar todos los datos del incidente (tipo, severidad, localización, descripción, historial del área) que contextualizan la investigación. `methodology` determina la estructura del análisis: '5_whys' genera un árbol de causalidad preguntando 'por qué' en cascada hasta llegar a causas raíz sistémicas, 'cause_tree' es más visual y estructurado (recomendado para accidentes mayores), 'bow_tie' analiza tanto las causas como las consecuencias y las barreras de control, 'taproot' aplica un árbol de causas estandarizado con categorías predefinidas. `teamMembers` documenta quiénes participaron en la investigación (requerido por ISO 45001).

**Cálculos:** Cargar el registro del incidente del `incidentId`. Para '5_whys': generar la cadena de causalidad iterando 5 niveles de 'por qué' a partir del evento inicial, clasificando cada nivel en causas inmediatas, básicas o sistémicas. Para 'cause_tree': construir el árbol booleano de causas (AND/OR gates) usando la información del incidente y el historial del área. Para 'bow_tie': identificar el evento central, las amenazas que lo causan (izquierda) y las consecuencias (derecha), con las barreras preventivas y mitigadoras. Clasificar cada causa en `immediatesCauses`, `basicCauses`, `rootCauses`. Generar `correctiveActions` mapeando una acción por causa raíz con responsable, fecha y tipo (eliminación/sustitución/control de ingeniería/control administrativo/EPP). Evaluar `similarIncidentRisk` basado en si las causas raíz persisten en otras áreas de la planta.

**Por qué estos outputs:** `immediatesCauses` son las causas directas que el agente puede abordar con acciones inmediatas de contención. `basicCauses` son los factores contribuyentes (falta de mantenimiento, procedimiento inadecuado) que requieren acciones correctivas. `rootCauses` son las causas sistémicas (falla en el sistema de gestión) que requieren acciones preventivas para evitar recurrencia. `correctiveActions` son el output accionable que alimenta el plan de acción del sistema de gestión. `similarIncidentRisk` activa alertas en otras áreas con condiciones similares.

**Sugerencia de UI:** Visualizador interactivo del árbol de causas o diagrama bow-tie según la metodología seleccionada. Nodos colapsables/expandibles. Indicador de nivel de causa (inmediata/básica/raíz) por color. Panel de acciones correctivas con formulario de asignación por cada causa raíz. Botón de exportar el análisis completo como PDF para el expediente del incidente.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/investigate_root_cause_hse__run_hazop_analysis]] — `ROOT_CAUSE_SYSTEMIC` → [[run_hazop_analysis]]
**Esta tool es disparada por:**
- [[report_safety_incident]] — `INCIDENT_REPORTED` → [[../comunicaciones/report_safety_incident__investigate_root_cause_hse]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

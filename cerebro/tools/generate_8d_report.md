---
tipo: tool
id: generate_8d_report
nombre: "Generar Reporte 8D"
categoria: quality
agente: calidad-spc
estado: implementada
consume: [NC_REQUIRES_8D]
produce: [8D_REPORT_ISSUED]
programador:
actualizado: 2026-06-28
tags: [tool, quality, implementada]
---
# Generar Reporte 8D
> `generate_8d_report` · Cloud · categoría **quality** · estado **implementada**
> Pertenece al agente [[../agentes/calidad-spc|Agente de Calidad & SPC]]
## Qué hace
Genera reporte 8D estructurado con equipo, descripción, contención, causa raíz (5 Whys/Ishikawa), acción correctiva y verificación.
## Contrato de eventos
- **Consume:** `NC_REQUIRES_8D`
- **Produce:** `8D_REPORT_ISSUED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `ncId` para cargar toda la información de la no conformidad (descripción del problema, parte afectada, cliente impactado) que pre-popula las disciplinas D1-D2 del reporte. `teamMembers` define el equipo multidisciplinario (D1) necesario para validar que el análisis tiene representación de las áreas involucradas. `rootCauseMethod` selecciona la metodología de análisis causal: '5_whys' es rápido para problemas simples, 'ishikawa' (diagrama de Espina de Pescado) estructura el análisis en categorías 6M, 'fault_tree' es apropiado para sistemas complejos.

**Cálculos:** Cargar datos de la NC desde `ncId`. Generar D1 (equipo) con `teamMembers`. D2 (descripción del problema): recuperar descripción de la NC. D3 (`d3ContainmentActions`): sugerir acciones de contención desde catálogo de respuestas por tipo de defecto. D4 (`d4RootCauses`): si 5_whys, generar árbol de 5 niveles de por qué; si ishikawa, estructurar causas en las 6M (Máquina, Método, Material, Mano de obra, Medio ambiente, Medición); si fault_tree, generar árbol booleano. D5 (`d5CorrectiveActions`): mapear acción correctiva por cada causa raíz identificada. D8 (`d8LessonsLearned`): síntesis de las lecciones aprendidas. Generar PDF del reporte y almacenarlo, retornar `pdfUrl`.

**Por qué estos outputs:** `d3ContainmentActions` es el output más urgente: el agente lo usa para implementar la contención antes de resolver la causa raíz. `d4RootCauses` justifica las acciones correctivas ante auditorías. `d5CorrectiveActions` se convierte en tareas asignadas a responsables con fecha. `d8LessonsLearned` alimenta la base de conocimiento del SGC. `pdfUrl` permite distribuir el reporte al cliente de forma inmediata.

**Sugerencia de UI:** Formulario tipo wizard con 8 pasos (D1-D8), mostrando el paso actual y habilitando cada paso solo cuando el anterior está completo. En D4, visualizador interactivo del diagrama de Ishikawa o árbol de 5 porqués con campos editables. Barra de progreso de completitud del reporte (%). Botón de generar PDF en el paso D8.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/generate_8d_report__automate_followups]] — `8D_REPORT_ISSUED` → [[automate_followups]]
**Esta tool es disparada por:**
- [[manage_nonconformances]] — `NC_REQUIRES_8D` → [[../comunicaciones/manage_nonconformances__generate_8d_report]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

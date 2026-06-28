---
tipo: tool
id: generate_iso50001_report
nombre: "Generar Reporte ISO 50001"
categoria: energy
agente: energia-sustentabilidad
estado: catalogo
consume: [ENPI_PERIOD_CLOSED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, energy, catalogo]
---
# Generar Reporte ISO 50001
> `generate_iso50001_report` · Cloud · categoría **energy** · estado **catalogo**
> Pertenece al agente [[../agentes/energia-sustentabilidad|Agente de Energía & Sustentabilidad]]
## Qué hace
Genera reporte de revisión energética conforme a ISO 50001 con EnPI, línea base, objetivos y acciones de mejora.
## Contrato de eventos
- **Consume:** `ENPI_PERIOD_CLOSED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para acceder a todos los datos energéticos y de gestión del SGEn de esa instalación. `reportPeriod` especifica el período exacto del reporte (ej: '2025-Q1' o '2025-01-01/2025-03-31') requerido por ISO 50001 para mantener la coherencia de los períodos de revisión energética. `includeActionPlan` activa la generación de la sección de planes de acción de mejora continua, que es un requisito explícito de la norma para demostrar el ciclo PHVA (Planificar-Hacer-Verificar-Actuar).

**Cálculos:** Agregar todos los EnPIs del período para `plantId`. Comparar cada EnPI contra la línea base y los objetivos energéticos establecidos en el SGEn. Determinar `complianceStatus`: 'compliant' si todos los EnPIs están en objetivo y se tiene documentación requerida (política energética, revisión energética actualizada, objetivos documentados); 'minor_gaps' si hay hasta 2 hallazgos de bajo impacto; 'major_gaps' si hay hallazgos que afectan la certificación. Generar `objectives` desde los registros del SGEn. Para `actionPlan`: listar las oportunidades de mejora identificadas con responsable, fecha y meta de ahorro. Generar el PDF del reporte con la estructura ISO 50001.

**Por qué estos outputs:** `complianceStatus` permite al agente determinar si la planta está lista para la auditoría de certificación o si requiere acciones correctivas urgentes. `objectives` documenta el compromiso de mejora continua requerido por la norma. `actionPlan` transforma los hallazgos en tareas accionables con responsables y fechas. `pdfUrl` habilita la distribución inmediata del reporte a la alta dirección y al organismo certificador.

**Sugerencia de UI:** Vista de reporte estructurado con secciones colapsables por cláusula de la norma. Semáforo de cumplimiento por cláusula. Tabla de action plan con campos editables de responsable y fecha directamente en el reporte. Botón de exportar a PDF. Historial de reportes anteriores para comparación.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[calculate_energy_kpis]] — `ENPI_PERIOD_CLOSED` → [[../comunicaciones/calculate_energy_kpis__generate_iso50001_report]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

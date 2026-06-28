---
tipo: tool
id: generate_security_strategy
nombre: "Generar Estrategia de Seguridad"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: [RISK_ANALYZED]
produce: [STRATEGY_GENERATED]
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Generar Estrategia de Seguridad
> `generate_security_strategy` · Cloud · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Genera una estrategia de seguridad adaptada al perfil de riesgo y cumplimiento normativo.
## Contrato de eventos
- **Consume:** `RISK_ANALYZED`
- **Produce:** `STRATEGY_GENERATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** riskProfile es el resultado de analyze_network_risk con el estado actual de vulnerabilidades y activos en riesgo. complianceFrameworks lista los marcos normativos que la empresa debe cumplir (IEC 62443 para OT, NIST CSF, ISO 27001) — el agente genera controles específicos para cada uno.

**Cálculos:** Mapear cada vulnerabilidad del riskProfile a controles recomendados en los frameworks de complianceFrameworks. Priorizar controles usando análisis costo-beneficio: riesgo mitigado vs costo de implementación. Generar un roadmap de implementación agrupando controles por: inmediatos (0-30 días), corto plazo (1-3 meses), largo plazo (3-12 meses).

**Por qué estos outputs:** recommendations es el plan de seguridad completo que el CISO presenta al consejo directivo para aprobación de presupuesto. priorityActions son los primeros controles a implementar — el agente puede ejecutar algunos automáticamente (block_ip, isolate_device) y escalar los demás al equipo de seguridad.

**Sugerencia de UI:** Roadmap de seguridad en formato timeline con fases de implementación. Tabla de controles con framework origen, prioridad y responsable asignado. Gauge de madurez de seguridad actual vs objetivo. Exportar a PDF para presentación ejecutiva.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/generate_security_strategy__apply_segmentation]] — `STRATEGY_GENERATED` → [[apply_segmentation]]
**Esta tool es disparada por:**
- [[analyze_network_risk]] — `RISK_ANALYZED` → [[../comunicaciones/analyze_network_risk__generate_security_strategy]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

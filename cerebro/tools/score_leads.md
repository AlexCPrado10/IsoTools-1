---
tipo: tool
id: score_leads
nombre: "Puntuar Leads Comerciales"
categoria: erp
agente: erp-gestion-empresarial
estado: catalogo
consume: []
produce: [LEADS_SCORED]
programador:
actualizado: 2026-06-28
tags: [tool, erp, catalogo]
---
# Puntuar Leads Comerciales
> `score_leads` · Cloud · categoría **erp** · estado **catalogo**
> Pertenece al agente [[../agentes/erp-gestion-empresarial|Agente ERP & Gestión Empresarial]]
## Qué hace
Puntúa leads del CRM según probabilidad de cierre y valor potencial.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `LEADS_SCORED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** leadIds es la lista de prospectos a evaluar del CRM. El agente lo usa para priorizar el esfuerzo del equipo de ventas — en lugar de contactar a todos los leads por igual, el agente identifica cuáles tienen mayor probabilidad de conversión y cuáles requieren nurturing antes de contactar.

**Cálculos:** Para cada lead, extraer del CRM sus atributos: industria, tamaño de empresa, cargo del contacto, actividad en el sitio web, interacciones previas, perfil de cliente ideal (ICP) match. Aplicar un modelo de scoring (regresión logística o XGBoost) entrenado con datos históricos de conversiones. Calcular el score 0-100 y clasificar en categorías: Hot (>70), Warm (40-70), Cold (<40).

**Por qué estos outputs:** scores permite al agente asignar automáticamente los leads Hot al equipo de ventas directas, los Warm a secuencias de email marketing, y los Cold a nurturing de largo plazo. nextAction es la instrucción específica que el vendedor debe ejecutar, generada por el agente basándose en el perfil del lead.

**Sugerencia de UI:** Lista de leads ordenada por score (mayor a menor) con barra de progreso coloreada. Columna de categoría con badge Hot/Warm/Cold. Columna de siguiente acción recomendada con ícono del tipo de contacto (llamada, email, demo). Filtros por categoría e industria.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/score_leads__predict_sales]] — `LEADS_SCORED` → [[predict_sales]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

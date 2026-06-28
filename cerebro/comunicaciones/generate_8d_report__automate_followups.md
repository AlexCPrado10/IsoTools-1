---
tipo: comunicacion
regla: rule-pkg-003
fuente: generate_8d_report
destino: automate_followups
evento: 8D_REPORT_ISSUED
protocolo: REST
rama: comm/generate_8d_report__automate_followups
programadores:
actualizado: 2026-06-28
tags: [comunicacion, 8D_REPORT_ISSUED]
---
# generate_8d_report → automate_followups

> Regla `rule-pkg-003` · evento `8D_REPORT_ISSUED` · protocolo REST
> Rama de trabajo: `comm/generate_8d_report__automate_followups`

## Las dos tools
- **Fuente:** [[../tools/generate_8d_report]]
- **Destino:** [[../tools/automate_followups]]

## Contrato
- **Evento:** `8D_REPORT_ISSUED`
- **Protocolo / topic:** REST `POST /api/quality/followups`
- **Condición de disparo:** `always`
- **Descripción:** Reporte 8D emitido agenda seguimientos hasta el cierre de la acción

## Forma del payload (rellenar al implementar)
```json
{
  "event": { "type": "8D_REPORT_ISSUED" },
  "data": { }
}
```

## Bitácora de la comunicación
<!-- Cada cambio en el contrato entre estas dos tools se anota aquí.
     Así el programador del otro lado ve qué cambió sin leer el código.
     Formato:  - [YYYY-MM-DD] (quién) qué cambió en el payload/condición y por qué -->
- [2026-06-28] (auto) nota inicial generada desde communication-rules.json.

## Flujo de trabajo
1. `npm run rama:comm generate_8d_report__automate_followups` (crea/cambia a la rama `comm/generate_8d_report__automate_followups`).
2. Implementa el cambio en ambas tools si aplica y actualiza esta bitácora.
3. PR de la rama a `main` cuando el contrato quede estable.


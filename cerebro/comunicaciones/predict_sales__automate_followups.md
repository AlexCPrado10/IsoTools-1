---
tipo: comunicacion
regla: rule-erp-009
fuente: predict_sales
destino: automate_followups
evento: SALES_PREDICTED
protocolo: MQTT
rama: comm/predict_sales__automate_followups
programadores:
actualizado: 2026-06-28
tags: [comunicacion, SALES_PREDICTED]
---
# predict_sales → automate_followups

> Regla `rule-erp-009` · evento `SALES_PREDICTED` · protocolo MQTT
> Rama de trabajo: `comm/predict_sales__automate_followups`

## Las dos tools
- **Fuente:** [[../tools/predict_sales]]
- **Destino:** [[../tools/automate_followups]]

## Contrato
- **Evento:** `SALES_PREDICTED`
- **Protocolo / topic:** MQTT `crm/sales/prediction`
- **Condición de disparo:** `closeProbability > 0.6`
- **Descripción:** Alta probabilidad de venta dispara seguimiento automático

## Forma del payload (rellenar al implementar)
```json
{
  "event": { "type": "SALES_PREDICTED" },
  "data": { }
}
```

## Bitácora de la comunicación
<!-- Cada cambio en el contrato entre estas dos tools se anota aquí.
     Así el programador del otro lado ve qué cambió sin leer el código.
     Formato:  - [YYYY-MM-DD] (quién) qué cambió en el payload/condición y por qué -->
- [2026-06-28] (auto) nota inicial generada desde communication-rules.json.

## Flujo de trabajo
1. `npm run rama:comm predict_sales__automate_followups` (crea/cambia a la rama `comm/predict_sales__automate_followups`).
2. Implementa el cambio en ambas tools si aplica y actualiza esta bitácora.
3. PR de la rama a `main` cuando el contrato quede estable.


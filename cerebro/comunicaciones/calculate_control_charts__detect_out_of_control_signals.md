---
tipo: comunicacion
regla: rule-qual-002
fuente: calculate_control_charts
destino: detect_out_of_control_signals
evento: CHART_POINTS_UPDATED
protocolo: REST
rama: comm/calculate_control_charts__detect_out_of_control_signals
programadores:
actualizado: 2026-06-28
tags: [comunicacion, CHART_POINTS_UPDATED]
---
# calculate_control_charts → detect_out_of_control_signals

> Regla `rule-qual-002` · evento `CHART_POINTS_UPDATED` · protocolo REST
> Rama de trabajo: `comm/calculate_control_charts__detect_out_of_control_signals`

## Las dos tools
- **Fuente:** [[../tools/calculate_control_charts]]
- **Destino:** [[../tools/detect_out_of_control_signals]]

## Contrato
- **Evento:** `CHART_POINTS_UPDATED`
- **Protocolo / topic:** REST `POST /api/quality/spc/detect`
- **Condición de disparo:** `always`
- **Descripción:** Cartas de control actualizadas ejecutan detección de señales fuera de control

## Forma del payload (rellenar al implementar)
```json
{
  "event": { "type": "CHART_POINTS_UPDATED" },
  "data": { }
}
```

## Bitácora de la comunicación
<!-- Cada cambio en el contrato entre estas dos tools se anota aquí.
     Así el programador del otro lado ve qué cambió sin leer el código.
     Formato:  - [YYYY-MM-DD] (quién) qué cambió en el payload/condición y por qué -->
- [2026-06-28] (auto) nota inicial generada desde communication-rules.json.

## Flujo de trabajo
1. `npm run rama:comm calculate_control_charts__detect_out_of_control_signals` (crea/cambia a la rama `comm/calculate_control_charts__detect_out_of_control_signals`).
2. Implementa el cambio en ambas tools si aplica y actualiza esta bitácora.
3. PR de la rama a `main` cuando el contrato quede estable.


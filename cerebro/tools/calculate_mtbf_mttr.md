---
tipo: tool
id: calculate_mtbf_mttr
nombre: "Calcular MTBF y MTTR"
categoria: maintenance
agente: mantenimiento-cmms
estado: catalogo
consume: []
produce: [RELIABILITY_DATA_UPDATED]
programador:
actualizado: 2026-06-28
tags: [tool, maintenance, catalogo]
---
# Calcular MTBF y MTTR
> `calculate_mtbf_mttr` · Cloud · categoría **maintenance** · estado **catalogo**
> Pertenece al agente [[../agentes/mantenimiento-cmms|Agente de Mantenimiento & CMMS]]
## Qué hace
Calcula Tiempo Medio Entre Fallas (MTBF) y Tiempo Medio de Reparación (MTTR) por activo o línea.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `RELIABILITY_DATA_UPDATED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `assetId` para filtrar el historial de fallas de ese equipo específico en la base de datos de eventos. `periodDays` (default 365) define la ventana de análisis: un período muy corto puede generar datos estadísticamente insuficientes, mientras que uno muy largo puede incluir condiciones operativas ya superadas. `includeHistorical` permite al agente decidir si considerar solo el período activo o también datos de instalaciones previas para activos reutilizados.

**Cálculos:** Recuperar todos los eventos de falla del activo en el período. MTBF = (tiempo_total_operativo - tiempo_total_parada) / número_de_fallas. MTTR = suma(duración_de_cada_reparación) / número_de_fallas. Availability = MTBF / (MTBF + MTTR). Para `trend`: comparar MTBF del último tercio del período contra el primero; si delta > +10% → 'improving', si delta < -10% → 'degrading', si no → 'stable'. Registrar `failureCount` como conteo simple de eventos tipo 'corrective_maintenance' en el período.

**Por qué estos outputs:** `mtbfHours` y `mttrHours` son los insumos primarios para calcular planes de PM, niveles de repuestos y costos de ciclo de vida. `availability` se compara directamente contra el `availabilityTarget` del contrato de producción para detectar incumplimientos. `failureCount` es el numerador para calcular tasas de falla. `trend` permite al agente priorizar activos con tendencia degradante para intervención predictiva inmediata.

**Sugerencia de UI:** Cuatro KPI cards en fila: MTBF (horas), MTTR (horas), Disponibilidad (%) y Nº de Fallas. Indicador de tendencia con flecha animada (verde arriba, rojo abajo, gris horizontal). Gráfico de barras mostrando MTBF por mes en el período seleccionado. Selector de período en la cabecera.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/calculate_mtbf_mttr__schedule_preventive_maintenance]] — `RELIABILITY_DATA_UPDATED` → [[schedule_preventive_maintenance]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

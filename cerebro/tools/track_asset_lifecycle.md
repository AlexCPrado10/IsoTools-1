---
tipo: tool
id: track_asset_lifecycle
nombre: "Rastrear Ciclo de Vida de Activo"
categoria: maintenance
agente: mantenimiento-cmms
estado: catalogo
consume: [MAINTENANCE_KPIS_READY]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, maintenance, catalogo]
---
# Rastrear Ciclo de Vida de Activo
> `track_asset_lifecycle` · Cloud · categoría **maintenance** · estado **catalogo**
> Pertenece al agente [[../agentes/mantenimiento-cmms|Agente de Mantenimiento & CMMS]]
## Qué hace
Registra el ciclo de vida completo del activo: adquisición, instalación, historial de mantenimiento, depreciación y disposición final.
## Contrato de eventos
- **Consume:** `MAINTENANCE_KPIS_READY`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `assetId` para acceder al registro maestro del activo en el CMMS. `includeMaintenanceHistory` carga el historial completo de OTs y fallas, necesario para calcular el costo total de mantenimiento y el `currentConditionScore`. `includeFinancials` es opcional porque requiere acceso al módulo contable (valor de adquisición, depreciación acumulada) y puede no estar disponible en todos los ambientes; activarlo expone datos de inversión para análisis de reemplazo vs renovación.

**Cálculos:** Calcular `ageYears` = (fecha_actual - fecha_instalación) / 365.25. `remainingUsefulLifeYears` = vida_útil_diseño - ageYears, ajustado por el score de condición actual. `totalMaintenanceCost` = suma de todos los costos de OTs cerradas del activo. `currentConditionScore` (0-100): algoritmo ponderado que considera MTBF actual vs MTBF de referencia (30%), número de fallas recientes (20%), condición reportada en última inspección (30%), horas de operación acumuladas vs límite (20%). `lifecycleStage`: new si ageYears < 20% vida útil, aging si > 70%, end_of_life si conditionScore < 30 o age > 90% vida útil.

**Por qué estos outputs:** `ageYears` y `remainingUsefulLifeYears` son los insumos del análisis de reemplazo vs reparación. `totalMaintenanceCost` comparado con el valor de reemplazo determina si el activo es económicamente viable. `currentConditionScore` permite al agente priorizar activos que necesitan atención preventiva urgente. `lifecycleStage` simplifica la toma de decisiones: end_of_life activa automáticamente un proceso de solicitud de inversión.

**Sugerencia de UI:** Tarjeta de activo con línea de tiempo visual del ciclo de vida (barra horizontal con hito actual marcado). Gauge circular para `currentConditionScore` con colores semáforo. Tabla de historial de mantenimiento con costo acumulado. Badge de etapa del ciclo de vida en la cabecera.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[generate_maintenance_kpis]] — `MAINTENANCE_KPIS_READY` → [[../comunicaciones/generate_maintenance_kpis__track_asset_lifecycle]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

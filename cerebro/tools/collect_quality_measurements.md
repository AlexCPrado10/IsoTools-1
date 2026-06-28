---
tipo: tool
id: collect_quality_measurements
nombre: "Recolectar Mediciones de Calidad"
categoria: quality
agente: calidad-spc
estado: implementada
consume: [PRODUCT_SPEC_UPDATED]
produce: [MEASUREMENTS_CAPTURED]
programador:
actualizado: 2026-06-28
tags: [tool, quality, implementada]
---
# Recolectar Mediciones de Calidad
> `collect_quality_measurements` · Edge · categoría **quality** · estado **implementada**
> Pertenece al agente [[../agentes/calidad-spc|Agente de Calidad & SPC]]
## Qué hace
Captura mediciones dimensionales y de atributos directamente de instrumentos de medición (CMM, calibres, visión) en la línea.
## Contrato de eventos
- **Consume:** `PRODUCT_SPEC_UPDATED`
- **Produce:** `MEASUREMENTS_CAPTURED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `partId` para identificar qué producto se está inspeccionando y cargar el plan de inspección correspondiente. `inspectionPlanId` carga el conjunto de características a medir, la frecuencia de muestreo y los límites de especificación vigentes, evitando que el operador tenga que recordarlos. `source` define cómo llegan los datos: 'manual_entry' requiere UI de captura, 'cmm' importa automáticamente del software de la máquina de medición por coordenadas, 'gauge_interface' usa protocolo Bluetooth/USB de calibres digitales, 'vision_system' recibe el resultado del sistema de visión artificial. `operatorId` registra quién realizó la inspección para trazabilidad del sistema de medición.

**Cálculos:** Cargar las características del `inspectionPlanId`. Para cada característica, comparar el `value` medido contra los límites de especificación: `withinSpec = (value >= lsl && value <= usl)`. Determinar `passFailResult`: 'pass' si todas las características pasan, 'fail' si alguna CTQ crítica falla, 'conditional' si falla una característica no crítica. Contar `defectsFound` = número de características fuera de especificación. Registrar `timestamp` en UTC para trazabilidad. Encolar los datos automáticamente para actualizar las cartas de control SPC correspondientes.

**Por qué estos outputs:** `measurements` con el flag `withinSpec` por característica permite al agente evaluar si la pieza pasa o falla sin interpretación adicional. `passFailResult` es la decisión de disposición que el agente usa para liberar o retener la pieza. `defectsFound` alimenta el contador de PPM del período. El array de mediciones alimenta directamente las cartas de control SPC y el cálculo de Cpk.

**Sugerencia de UI:** Formulario de inspección con una fila por característica, campo numérico y semáforo de resultado en tiempo real al ingresar el valor. Indicador grande de PASS/FAIL en la parte superior con color dominante. Barra de progreso de características medidas vs totales del plan. Botón de confirmar y enviar datos con opción de agregar foto del defecto.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/collect_quality_measurements__calculate_control_charts]] — `MEASUREMENTS_CAPTURED` → [[calculate_control_charts]]
- [[../comunicaciones/collect_quality_measurements__calculate_cpk_ppk]] — `MEASUREMENTS_CAPTURED` → [[calculate_cpk_ppk]]
**Esta tool es disparada por:**
- [[manage_product_specs]] — `PRODUCT_SPEC_UPDATED` → [[../comunicaciones/manage_product_specs__collect_quality_measurements]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

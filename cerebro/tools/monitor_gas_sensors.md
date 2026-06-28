---
tipo: tool
id: monitor_gas_sensors
nombre: "Monitorear Sensores de Gas"
categoria: safety
agente: seguridad-hse
estado: catalogo
consume: []
produce: [GAS_ALARM_TRIGGERED]
programador:
actualizado: 2026-06-28
tags: [tool, safety, catalogo]
---
# Monitorear Sensores de Gas
> `monitor_gas_sensors` · Edge · categoría **safety** · estado **catalogo**
> Pertenece al agente [[../agentes/seguridad-hse|Agente de Seguridad Industrial & HSE]]
## Qué hace
Monitorea sensores de gas tóxico, explosivo y confinado (H2S, CO, LEL, O2) con respuesta de emergencia autónoma en tiempo real.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `GAS_ALARM_TRIGGERED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `sensorIds` como array para gestionar zonas de monitoreo con múltiples sensores; la detección de gas confinado requiere múltiples puntos para triangular la fuente y la concentración en el espacio. `gasType` determina los umbrales de referencia de salud ocupacional: para H2S son 1 ppm (warning) y 10 ppm (IDLH); para CO son 25 ppm (TLV) y 1200 ppm (IDLH inmediato); para LEL el warning es al 10% LEL y la evacuación al 25% LEL. `alarmThresholds` permite configurar los umbrales específicos de la instalación sobreescribiendo los defaults, necesario cuando las autoridades locales o el seguro exigen niveles más estrictos.

**Cálculos:** Leer el valor actual de cada sensor en el array `sensorIds`. Comparar cada lectura contra los tres umbrales (warning, alarm, evacuation) del `alarmThresholds`. Asignar `status` por sensor: 'normal' si < warning, 'warning' si entre warning y alarm, 'alarm' si entre alarm y evacuation, 'evacuation' si >= evacuation. Para determinar `emergencyActionTriggered`: true si algún sensor alcanza nivel 'evacuation'. `evacuationZones`: derivar las zonas afectadas del mapa de sensores (tabla de configuración sensor → zona). Enviar señal a sistema de alerta de emergencia (sirenas, notificación a brigadistas).

**Por qué estos outputs:** `readings` por sensor con status permite al agente identificar sensores específicos en alarma y correlacionarlos con la ubicación geográfica del riesgo. `emergencyActionTriggered` es la señal crítica que activa el protocolo de emergencia autónomamente sin esperar intervención humana. `evacuationZones` informa al agente qué áreas deben ser evacuadas para comunicar a los coordinadores de emergencia.

**Sugerencia de UI:** Plano de la planta con iconos de sensores de gas codificados por color según su status actual (verde/amarillo/rojo). Banner de emergencia parpadeante rojo en caso de evacuación. Panel lateral con lecturas numéricas actuales por sensor y su nivel respecto a los umbrales. Botón de reconocimiento de emergencia que registra al brigadista que atendió la alarma.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/monitor_gas_sensors__report_safety_incident]] — `GAS_ALARM_TRIGGERED` → [[report_safety_incident]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

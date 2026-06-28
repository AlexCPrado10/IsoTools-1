---
tipo: tool
id: monitor_energy_consumption
nombre: "Monitorear Consumo Energético"
categoria: infrastructure
agente: infraestructura-edge
estado: catalogo
consume: []
produce: [PEAK_DEMAND_DETECTED]
programador:
actualizado: 2026-06-28
tags: [tool, infrastructure, catalogo]
---
# Monitorear Consumo Energético
> `monitor_energy_consumption` · Edge · categoría **infrastructure** · estado **catalogo**
> Pertenece al agente [[../agentes/infraestructura-edge|Agente de Infraestructura & Edge]]
## Qué hace
Lee consumo de energía en tiempo real desde medidores inteligentes DLMS/COSEM.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `PEAK_DEMAND_DETECTED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** meterId identifica el medidor de energía (PowerLogic, PowerMeter, etc.) instalado en el tablero eléctrico del activo o la línea. readInterval define cada cuántos segundos tomar una medición — intervalos cortos (1-5s) para monitoreo de demanda pico, intervalos largos (60s) para tendencias de consumo y facturación.

**Cálculos:** Comunicar con el medidor usando su protocolo (Modbus RTU/TCP es el más común en medidores industriales). Leer los registros de: kW (potencia activa instantánea), kWh (energía acumulada), powerFactor (factor de potencia), voltage por fase, current por fase. Calcular la potencia aparente y reactiva si el medidor no las proporciona directamente.

**Por qué estos outputs:** kw y kwh son los datos de consumo que el agente usa para optimize_energy_usage y para calcular el costo energético de cada orden de producción. powerFactor alerta cuando está por debajo de 0.90 — las empresas pagan penalización tarifaria por bajo factor de potencia. voltage y current permiten detectar problemas eléctricos: desequilibrio de fases, sobrecarga, baja tensión.

**Sugerencia de UI:** Panel de energía con gauges de kW actual, kWh acumulado del día y factor de potencia. Gráfica de demanda (kW) en tiempo real. Indicador de alerta si powerFactor < 0.90. Comparativa de consumo vs período anterior. Cálculo de costo energético en tiempo real.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/monitor_energy_consumption__execute_local_control_action]] — `PEAK_DEMAND_DETECTED` → [[execute_local_control_action]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

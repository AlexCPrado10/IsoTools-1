---
tipo: tool
id: monitor_ot_network
nombre: "Monitorear Red OT"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: []
produce: [TRAFFIC_CAPTURED]
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Monitorear Red OT
> `monitor_ot_network` · Edge · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Monitorea continuamente el tráfico de la red OT para detectar comportamientos no autorizados.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `TRAFFIC_CAPTURED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** networkSegment identifica la zona OT a monitorear (ej: 'nivel-0-field-devices', 'nivel-1-control', 'nivel-2-supervisorio'). captureMode define la profundidad del análisis: 'passive' no interfiere con la red de control (esencial en OT), 'active' ejecuta queries adicionales para identificar dispositivos.

**Cálculos:** Capturar tráfico del segmento OT usando técnicas pasivas (span port, tap de red) para no afectar los tiempos de ciclo de los PLCs. Decodificar protocolos industriales: Modbus, EtherNet/IP, PROFINET, OPC-UA. Identificar todos los dispositivos comunicándose (newDevicesDetected). Analizar patrones de comunicación y detectar flujos fuera del perfil normal (suspiciousFlows).

**Por qué estos outputs:** packetsAnalyzed confirma que el monitoreo está activo y con qué volumen. suspiciousFlows es el número que determina si el agente debe disparar una alerta de seguridad. newDevicesDetected alerta sobre dispositivos no autorizados conectados a la red OT — un indicador crítico de compromiso o error operativo.

**Sugerencia de UI:** Dashboard de tráfico OT en tiempo real con gráfica de paquetes por segundo. Mapa de comunicaciones entre dispositivos con líneas de diferente grosor según volumen. Lista de dispositivos nuevos detectados con botones de autorizar o bloquear. Contador de flujos sospechosos con detalle expandible.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/monitor_ot_network__detect_network_anomalies_local]] — `TRAFFIC_CAPTURED` → [[detect_network_anomalies_local]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

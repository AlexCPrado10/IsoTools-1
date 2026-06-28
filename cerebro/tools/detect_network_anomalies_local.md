---
tipo: tool
id: detect_network_anomalies_local
nombre: "Detectar Anomalías de Red (Local)"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: [TRAFFIC_CAPTURED]
produce: [ANOMALY_DETECTED, DEVICE_COMPROMISE_SUSPECTED]
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Detectar Anomalías de Red (Local)
> `detect_network_anomalies_local` · Edge · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Detecta anomalías de red OT/IT en tiempo real sin depender de la nube. Latencia < 100ms.
## Contrato de eventos
- **Consume:** `TRAFFIC_CAPTURED`
- **Produce:** `ANOMALY_DETECTED`, `DEVICE_COMPROMISE_SUSPECTED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** interfaceId identifica el adaptador de red OT (puerto del switch industrial, interfaz del firewall perimetral) donde se captura el tráfico en el edge, sin enviar datos sensibles de la red al cloud. sensitivityLevel calibra el balance entre falsos positivos y falsos negativos según el nivel de riesgo aceptable en esa zona de la red.

**Cálculos:** Capturar tráfico de la interfaz en modo promiscuo (o recibir netflow). Comparar contra una línea base local (comunicaciones OT esperadas: IPs autorizadas, protocolos Modbus/OPC-UA, rangos de volumen típico). Detectar anomalías: nuevas IPs, protocolos no autorizados, volúmenes anómalos. Clasificar el tipo de anomalía y calcular la severidad sin enviar los paquetes al cloud.

**Por qué estos outputs:** anomalyDetected es el flag que dispara inmediatamente block_ip o isolate_device en el edge sin esperar respuesta del cloud. sourceIp es la IP a bloquear en la siguiente acción. anomalyType y severity determinan qué acción ejecutar: una anomalía de severity='critical' requiere aislamiento inmediato de la red OT.

**Sugerencia de UI:** Monitor de tráfico en tiempo real con indicador ON/OFF de anomalía. Mapa de comunicaciones OT con flechas entre dispositivos y resaltado de flujos anómalos. Lista de últimas alertas con sourceIp, tipo y timestamp. Botón de bloqueo rápido por IP.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/detect_network_anomalies_local__block_ip]] — `ANOMALY_DETECTED` → [[block_ip]]
- [[../comunicaciones/detect_network_anomalies_local__isolate_device]] — `DEVICE_COMPROMISE_SUSPECTED` → [[isolate_device]]
**Esta tool es disparada por:**
- [[monitor_ot_network]] — `TRAFFIC_CAPTURED` → [[../comunicaciones/monitor_ot_network__detect_network_anomalies_local]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

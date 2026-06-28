---
tipo: tool
id: inspect_gateway_traffic
nombre: "Inspeccionar Tráfico del Gateway"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: []
produce: [PACKETS_INSPECTED]
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Inspeccionar Tráfico del Gateway
> `inspect_gateway_traffic` · Edge · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Inspección profunda de paquetes (DPI) en el gateway OT/IT para detectar payloads maliciosos.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `PACKETS_INSPECTED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** gatewayId identifica el gateway OT/IT (firewall perimetral, router industrial, DMZ gateway) que conecta la red industrial con redes externas o corporativas. inspectionDepth define el nivel de análisis: 'shallow' revisa solo cabeceras (rápido, menor overhead) vs 'deep' que hace DPI para detectar payloads maliciosos ocultos en protocolos permitidos.

**Cálculos:** Capturar el tráfico que pasa por el gateway. Con 'shallow', analizar cabeceras IP/TCP/UDP: puertos, IPs, flags, volumen. Con 'deep', desencapsular hasta la capa de aplicación y analizar el contenido de cada paquete contra firmas de malware industrial. Contar blockedConnections si hay reglas activas de denegación.

**Por qué estos outputs:** packetsInspected confirma que la inspección está activa y la escala del análisis. maliciousPayloads es el número crítico que dispara una alerta inmediata al SOC — incluso 1 payload malicioso justifica aislar el gateway. blockedConnections muestra la efectividad de las reglas de firewall existentes.

**Sugerencia de UI:** Monitor de tráfico del gateway con throughput en tiempo real (Mbps). Contador de payloads maliciosos detectados con badge de alerta roja. Lista de últimos bloqueados con IP origen, destino y tipo de amenaza. Selector de profundidad de inspección con impacto en latencia.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/inspect_gateway_traffic__detect_anomaly_patterns]] — `PACKETS_INSPECTED` → [[detect_anomaly_patterns]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: detect_anomaly_patterns
nombre: "Detectar Patrones de Anomalía"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: [PACKETS_INSPECTED]
produce: [PATTERNS_FOUND]
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Detectar Patrones de Anomalía
> `detect_anomaly_patterns` · Cloud · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Identifica patrones de comportamiento anómalo en tráfico de red a nivel de campaña de ataque.
## Contrato de eventos
- **Consume:** `PACKETS_INSPECTED`
- **Produce:** `PATTERNS_FOUND`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** trafficLogs es el array de registros de tráfico de red (netflow, logs de firewall, SIEM) que el agente analiza. baselineWindowHours define cuántas horas de tráfico normal usar para establecer la línea base — 24h captura patrones diarios, 168h (1 semana) captura también patrones semanales.

**Cálculos:** Calcular estadísticas de baseline (volumen de tráfico, IPs únicas, puertos usados, protocolos) sobre baselineWindowHours. Aplicar detección de anomalías sobre el tráfico reciente: comparar contra baseline usando Z-score, DBSCAN o Isolation Forest. Clasificar el tipo de ataque si se detecta patrón conocido: port scan, DDoS, lateral movement, C2 communication.

**Por qué estos outputs:** patternsFound indica si el agente detectó actividad anómala que requiere investigación. attackType es la clasificación que el SOC usa para seleccionar el playbook de respuesta correcto. confidence determina si el agente debe actuar automáticamente (alta confianza) o solo alertar al equipo humano (baja confianza).

**Sugerencia de UI:** Gráfica de volumen de tráfico temporal con anotaciones en las anomalías detectadas. Mapa de calor de actividad por hora del día y día de la semana. Panel de alertas con attackType, confianza e IPs involucradas. Timeline de eventos anómalos.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/detect_anomaly_patterns__analyze_network_risk]] — `PATTERNS_FOUND` → [[analyze_network_risk]]
**Esta tool es disparada por:**
- [[inspect_gateway_traffic]] — `PACKETS_INSPECTED` → [[../comunicaciones/inspect_gateway_traffic__detect_anomaly_patterns]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

---
tipo: tool
id: analyze_network_risk
nombre: "Analizar Riesgo de Red"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: [PATTERNS_FOUND]
produce: [RISK_ANALYZED]
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Analizar Riesgo de Red
> `analyze_network_risk` · Cloud · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Evalúa el nivel de riesgo global de la red OT/IT usando análisis de grafos y threat intelligence.
## Contrato de eventos
- **Consume:** `PATTERNS_FOUND`
- **Produce:** `RISK_ANALYZED`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** networkId identifica la red OT/IT a analizar con su topología, activos y políticas de seguridad registradas. includeExternalThreatFeed activa la integración con feeds de inteligencia de amenazas (MISP, VirusTotal, CISA KEV) para contrastar los activos de la red contra vulnerabilidades conocidas actualmente activas en el sector industrial.

**Cálculos:** Inventariar todos los activos de la red (servidores, PLCs, HMIs, switches). Para cada activo, consultar su CVE score y parchado. Evaluar la configuración de red (segmentación, firewall rules, accesos remotos). Si includeExternalThreatFeed=true, cruzar con activos comprometidos reportados en el sector. Calcular riskScore 0-100 usando el framework CVSS adaptado para OT.

**Por qué estos outputs:** riskScore es el número que el CISO usa para reportar postura de seguridad a la dirección y priorizar el presupuesto de seguridad. riskLevel (critical/high/medium/low) determina la urgencia de la respuesta del agente. topThreats es la lista priorizada de vulnerabilidades que el equipo de seguridad debe atender primero.

**Sugerencia de UI:** Gauge de riesgo grande con nivel y color (rojo/naranja/amarillo/verde). Mapa de red con nodos coloreados por riesgo individual. Lista de amenazas críticas con CVE ID, severidad y activos afectados. Histórico de riskScore con línea de tendencia.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/analyze_network_risk__generate_security_strategy]] — `RISK_ANALYZED` → [[generate_security_strategy]]
**Esta tool es disparada por:**
- [[detect_anomaly_patterns]] — `PATTERNS_FOUND` → [[../comunicaciones/detect_anomaly_patterns__analyze_network_risk]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

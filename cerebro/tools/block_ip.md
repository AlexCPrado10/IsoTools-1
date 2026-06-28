---
tipo: tool
id: block_ip
nombre: "Bloquear IP"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: [ANOMALY_DETECTED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Bloquear IP
> `block_ip` · Edge · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Bloquea una IP o rango de IPs en el firewall local de forma inmediata.
## Contrato de eventos
- **Consume:** `ANOMALY_DETECTED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** ipAddress es la IP a bloquear, obtenida directamente de detect_network_anomalies_local o detect_anomaly_patterns. duration define cuánto tiempo aplica el bloqueo — temporales para investigar sin interrumpir permanentemente servicios legítimos, permanentes para IPs de atacantes confirmados. reason se registra en el log de auditoría para cumplimiento normativo.

**Cálculos:** Agregar una regla de denegación al firewall local o al switch industrial vía su API (iptables, Cisco ACL, Fortinet API, etc.). Configurar el timeout de la regla si duration > 0. Generar un ruleId único para poder auditar o revertir la regla. Registrar la acción en el log de seguridad con timestamp, operador o agente que la ejecutó y la razón.

**Por qué estos outputs:** blocked confirma que el bloqueo fue efectivo — si es false, el agente debe escalar al equipo de redes para intervención manual. ruleId permite al equipo de seguridad revisar, modificar o eliminar la regla desde el panel de gestión. timestamp es esencial para el log de incidentes y para correlacionar con otras alertas en el SIEM.

**Sugerencia de UI:** Panel de IPs bloqueadas con tabla: IP, Razón, Duración, Tiempo restante, Quién la bloqueó. Botón de desbloqueo por fila. Indicador de tiempo restante con countdown. Form de bloqueo rápido con campos IP, Duración y Razón.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[detect_network_anomalies_local]] — `ANOMALY_DETECTED` → [[../comunicaciones/detect_network_anomalies_local__block_ip]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

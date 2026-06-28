---
tipo: tool
id: segment_network
nombre: "Segmentar Red"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: [VULNERABILITIES_FOUND]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Segmentar Red
> `segment_network` · Edge · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Aplica segmentación de red OT/IT aislando zonas afectadas según política de seguridad.
## Contrato de eventos
- **Consume:** `VULNERABILITIES_FOUND`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** targetZone identifica la zona de red OT a segmentar (ej: 'zona-scada', 'zona-plc', 'dmz-industrial') según la arquitectura Purdue o ISA-95. segmentationPolicy define las reglas de comunicación permitidas entre zonas (qué IPs/protocolos pueden cruzar el límite) que el agente aplicará en el firewall industrial.

**Cálculos:** Consultar la topología de red actual de targetZone. Aplicar las reglas de segmentationPolicy en el firewall industrial o switch gestionado: crear VLANs, configurar ACLs y reglas de firewall. Verificar que los dispositivos críticos (PLCs, HMIs) queden correctamente aislados. Contar affectedDevices para el reporte de impacto operativo.

**Por qué estos outputs:** segmented confirma que la zona quedó efectivamente aislada — el agente lo usa para reportar la acción de contención. affectedDevices informa al operador cuántos equipos quedaron en el nuevo segmento para que verifique que la producción no se interrumpió. policyApplied documenta exactamente qué política se aplicó para el registro de auditoría.

**Sugerencia de UI:** Diagrama de red OT con zonas coloreadas por nivel de seguridad. Antes/después de la segmentación animado. Lista de reglas aplicadas con protocolo, origen y destino permitido. Estado de segmentación por zona (Segmentada/No segmentada/En proceso).
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[simulate_attack_scenarios]] — `VULNERABILITIES_FOUND` → [[../comunicaciones/simulate_attack_scenarios__segment_network]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

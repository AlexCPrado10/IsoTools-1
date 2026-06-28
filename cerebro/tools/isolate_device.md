---
tipo: tool
id: isolate_device
nombre: "Aislar Dispositivo"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: [DEVICE_COMPROMISE_SUSPECTED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Aislar Dispositivo
> `isolate_device` · Edge · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Aísla un dispositivo comprometido de la red OT sin interrumpir el resto de la planta.
## Contrato de eventos
- **Consume:** `DEVICE_COMPROMISE_SUSPECTED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** deviceId identifica el equipo comprometido o sospechoso (PLC, HMI, servidor industrial) que debe ser aislado para contener el incidente. isolationType permite elegir entre aislamiento completo ('full': sin ninguna comunicación) o parcial ('partial': solo bloquear tráfico externo manteniendo comunicaciones de control críticas).

**Cálculos:** Identificar todas las interfaces de red del dispositivo. Aplicar reglas de firewall/ACL en el switch adyacente para bloquear todo el tráfico hacia/desde el deviceId según el isolationType. Si es 'partial', mantener solo las comunicaciones esenciales del nivel de control. Registrar la acción con timestamp para el incidente.

**Por qué estos outputs:** isolated confirma que el dispositivo quedó efectivamente contenido. deviceId e isolationType en la salida sirven para el reporte del incidente. timestamp es el inicio del período de aislamiento para SLA de respuesta.

**Sugerencia de UI:** Mapa de planta con dispositivos representados como íconos. Dispositivos aislados con borde rojo pulsante. Panel de acciones de respuesta al incidente: Aislar / Restaurar / Analizar. Timeline del incidente con cada acción ejecutada.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[detect_network_anomalies_local]] — `DEVICE_COMPROMISE_SUSPECTED` → [[../comunicaciones/detect_network_anomalies_local__isolate_device]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

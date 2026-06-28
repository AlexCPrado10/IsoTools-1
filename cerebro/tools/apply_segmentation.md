---
tipo: tool
id: apply_segmentation
nombre: "Aplicar Segmentación"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: [STRATEGY_GENERATED]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Aplicar Segmentación
> `apply_segmentation` · Edge · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Aplica reglas de segmentación de red recibidas desde la nube en switches y routers locales.
## Contrato de eventos
- **Consume:** `STRATEGY_GENERATED`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** rules es el conjunto específico de reglas de firewall/ACL a aplicar (generadas por generate_security_strategy). deviceId identifica el dispositivo de red (firewall, switch L3) donde se aplicarán — cada dispositivo tiene su propio API de gestión y sintaxis de reglas.

**Cálculos:** Conectar al API del dispositivo (REST, SSH, NETCONF según el fabricante). Convertir cada regla del array al formato nativo del dispositivo. Aplicar las reglas en el orden correcto (más específicas primero). Hacer un dry-run primero para detectar conflictos. Si todo es correcto, aplicar en producción. Guardar el estado anterior para rollback.

**Por qué estos outputs:** applied confirma que las reglas están activas y la red está protegida. rulesCount permite verificar que se aplicaron todas las reglas esperadas. rollbackAvailable es crítico: si la segmentación rompe comunicaciones legítimas, el operador puede revertir en segundos.

**Sugerencia de UI:** Lista de reglas aplicadas con estado (Aplicada/Fallida/Pendiente) por regla. Botón de Rollback con confirmación de doble click. Contador de reglas activas en el dispositivo. Log de cambios con timestamp de cada regla.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[generate_security_strategy]] — `STRATEGY_GENERATED` → [[../comunicaciones/generate_security_strategy__apply_segmentation]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

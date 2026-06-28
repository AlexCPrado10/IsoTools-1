---
tipo: tool
id: simulate_attack_scenarios
nombre: "Simular Escenarios de Ataque"
categoria: cybersecurity
agente: ciberseguridad-industrial
estado: catalogo
consume: []
produce: [VULNERABILITIES_FOUND]
programador:
actualizado: 2026-06-28
tags: [tool, cybersecurity, catalogo]
---
# Simular Escenarios de Ataque
> `simulate_attack_scenarios` · Cloud · categoría **cybersecurity** · estado **catalogo**
> Pertenece al agente [[../agentes/ciberseguridad-industrial|Agente de Ciberseguridad Industrial]]
## Qué hace
Simula escenarios de ataque (red team virtual) para identificar vectores de vulnerabilidad.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** `VULNERABILITIES_FOUND`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** networkTopology es el mapa completo de la red (activos, conexiones, zonas de seguridad) necesario para simular cómo un atacante se movería entre sistemas. attackTypes define qué escenarios simular (ransomware, supply chain, insider threat) para evaluar la postura de defensa ante las amenazas más relevantes para el sector.

**Cálculos:** Aplicar metodología MITRE ATT&CK for ICS. Para cada attackType, simular el kill chain completo: reconocimiento, acceso inicial, movimiento lateral, exfiltración/impacto. Modelar el grafo de ataque usando el algoritmo de camino más corto para encontrar criticalPaths. Calcular riskReduction estimado al mitigar cada vulnerabilidad en los caminos críticos.

**Por qué estos outputs:** vulnerableAssets es la lista priorizada de activos que el equipo de seguridad debe fortalecer urgentemente. criticalPaths muestra las rutas de ataque que el atacante usaría, para que el equipo diseñe controles específicos en esos puntos. riskReduction cuantifica el beneficio de cada mejora para justificar la inversión.

**Sugerencia de UI:** Diagrama de grafo de ataque interactivo con nodos como activos y aristas como vectores de ataque. Activos vulnerables resaltados en rojo. Panel lateral con detalle del escenario seleccionado. Tabla de recomendaciones ordenadas por riskReduction.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/simulate_attack_scenarios__segment_network]] — `VULNERABILITIES_FOUND` → [[segment_network]]
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

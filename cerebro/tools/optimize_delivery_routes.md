---
tipo: tool
id: optimize_delivery_routes
nombre: "Optimizar Rutas de Entrega"
categoria: supply-chain
agente: cadena-suministro
estado: catalogo
consume: [DISRUPTION_RISK_HIGH]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, supply-chain, catalogo]
---
# Optimizar Rutas de Entrega
> `optimize_delivery_routes` · Cloud · categoría **supply-chain** · estado **catalogo**
> Pertenece al agente [[../agentes/cadena-suministro|Agente de Cadena de Suministro]]
## Qué hace
Calcula rutas de entrega óptimas considerando costo, tiempo, capacidad de flota, ventanas de entrega y restricciones de tráfico.
## Contrato de eventos
- **Consume:** `DISRUPTION_RISK_HIGH`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `depotId` para establecer el punto de origen de las rutas y acceder a la flota asignada a esa instalación. `deliveryPoints` es el array de destinos con dirección, ventana de tiempo de entrega (timeWindow), volumen/peso del pedido y prioridad; es obligatorio porque sin destinos no hay optimización posible. `fleetConfig` describe la flota disponible (capacidad de cada unidad, costo por km, restricciones de acceso como peso máximo). `optimizationObjective` define la función objetivo: 'minimize_cost' reduce combustible y horas-conductor, 'minimize_time' maximiza el número de entregas/día, 'minimize_emissions' prefiere vehículos más limpios y rutas más cortas aunque sean más lentas.

**Cálculos:** Enviar los pedidos, vehículos disponibles, depósitos y ventanas de tiempo al servicio de optimización de rutas (Google Maps Platform Route Optimization API, HERE Routing Optimization, o el módulo TMS del ERP). Obtener la asignación óptima de pedidos a vehículos y la secuencia de paradas. No implementar VRPTW en el tool; el solver de rutas es responsabilidad del servicio externo.

**Por qué estos outputs:** `routes` por vehículo es el plan de trabajo del día para cada conductor, que el agente puede distribuir automáticamente a los dispositivos móviles de los repartidores. `totalDistanceKm` y `totalCost` son los KPIs de eficiencia logística. `estimatedDurationHours` permite al agente verificar que las rutas son factibles dentro del turno de trabajo. `co2Savings` es el argumento de sustentabilidad del programa de optimización.

**Sugerencia de UI:** Mapa con las rutas optimizadas dibujadas en diferentes colores por vehículo. Panel de comparación: ruta actual vs ruta optimizada (distancia, costo, emisiones). Lista de paradas por ruta con secuencia, dirección y ventana de tiempo. Botón de confirmar y publicar rutas a los conductores. KPI de ahorro proyectado en costo y CO₂.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[predict_supply_disruptions]] — `DISRUPTION_RISK_HIGH` → [[../comunicaciones/predict_supply_disruptions__optimize_delivery_routes]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

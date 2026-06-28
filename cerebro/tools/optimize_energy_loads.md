---
tipo: tool
id: optimize_energy_loads
nombre: "Optimizar Cargas Energéticas"
categoria: energy
agente: energia-sustentabilidad
estado: catalogo
consume: [ENERGY_WASTE_FOUND]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, energy, catalogo]
---
# Optimizar Cargas Energéticas
> `optimize_energy_loads` · Cloud · categoría **energy** · estado **catalogo**
> Pertenece al agente [[../agentes/energia-sustentabilidad|Agente de Energía & Sustentabilidad]]
## Qué hace
Despacha cargas eléctricas inteligentemente para reducir demanda máxima, aprovechar tarifas valle y minimizar costo energético.
## Contrato de eventos
- **Consume:** `ENERGY_WASTE_FOUND`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `plantId` para acceder al inventario de cargas eléctricas de la planta y sus perfiles de consumo histórico. `flexibleLoads` es el array de cargas que pueden desplazarse en el tiempo (compresores, hornos, bombas de tanque) con su potencia, ventana de operación permitida y restricciones de proceso. `tariffSchedule` define los períodos tarifarios (punta, intermedio, base) con sus precios por kWh para calcular el ahorro por desplazamiento de carga. `productionConstraints` establece los límites inamovibles de producción que no pueden sacrificarse en la optimización.

**Cálculos:** Enviar el perfil de cargas, restricciones de producción y tarifa eléctrica al módulo de gestión de energía (ISO 50001 EMS, Siemens EnergyIP, Schneider EcoStruxure Energy, o equivalente). Obtener el plan de despacho de cargas optimizado para el horizonte solicitado. No implementar MILP en el tool; el optimizador de cargas reside en el EMS.

**Por qué estos outputs:** `loadSchedule` es el plan de despacho que el agente puede ejecutar enviando señales de encendido/apagado a los controladores en los momentos programados. `projectedPeakReductionKW` cuantifica la reducción del cargo por demanda en la tarifa eléctrica. `projectedCostSavings` es el beneficio mensual esperado. `implementationActions` son las instrucciones específicas que el agente puede ejecutar o comunicar al operador.

**Sugerencia de UI:** Gráfico de perfil de carga antes/después de la optimización (dos líneas superpuestas) con la demanda pico contractual marcada como línea horizontal. Tabla de cargas flexibles con su horario optimizado vs horario actual. Panel de beneficio económico con el ahorro mensual proyectado. Botón de aplicar plan de despacho con confirmación.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[detect_energy_waste]] — `ENERGY_WASTE_FOUND` → [[../comunicaciones/detect_energy_waste__optimize_energy_loads]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

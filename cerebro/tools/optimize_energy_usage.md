---
tipo: tool
id: optimize_energy_usage
nombre: "Optimizar Uso de Energía"
categoria: ai-ml
agente: ai-ml-industrial
estado: catalogo
consume: []
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, ai-ml, catalogo]
---
# Optimizar Uso de Energía
> `optimize_energy_usage` · Cloud · categoría **ai-ml** · estado **catalogo**
> Pertenece al agente [[../agentes/ai-ml-industrial|Agente AI & Machine Learning Industrial]]
## Qué hace
Optimiza el consumo energético de máquinas y líneas usando análisis de patrones y tarifas.
## Contrato de eventos
- **Consume:** — (es disparador raíz o aún sin regla)
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** assetIds es la lista de activos cuyo consumo energético se quiere optimizar (motores, compresores, sistemas HVAC, hornos). tariffPlan contiene la estructura tarifaria eléctrica: precios por período (punta, semipunta, base) y cargos por demanda máxima — esencial para calcular cuándo es más económico operar cada activo.

**Cálculos:** Obtener el perfil de consumo histórico de cada activo (kW por hora). Analizar patrones de uso vs necesidad real de producción. Identificar oportunidades: activos en marcha sin carga, programación de cargas pesadas en horario de menor tarifa, ajuste de velocidad de motores con variadores. Calcular el ahorro monetario aplicando la tarifa del tariffPlan al perfil de consumo optimizado vs actual.

**Por qué estos outputs:** recommendations es la lista concreta de cambios que el operador puede implementar (ej: 'apagar compresor auxiliar entre 18:00-22:00'). estimatedSavingsKwh cuantifica el ahorro energético. estimatedSavingsCurrency convierte el ahorro a pesos/dólares para facilitar la presentación a la dirección.

**Sugerencia de UI:** Perfil de consumo 24h con curva actual vs curva optimizada superpuestas. Tabla de oportunidades con ahorro mensual estimado por activo. Calculadora de tarifa con desglose de cargos. Indicador de payback de las inversiones recomendadas.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- _ninguna declarada_
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

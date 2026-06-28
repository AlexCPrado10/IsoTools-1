---
tipo: tool
id: run_hazop_analysis
nombre: "Ejecutar Análisis HAZOP"
categoria: safety
agente: seguridad-hse
estado: catalogo
consume: [ROOT_CAUSE_SYSTEMIC]
produce: [HAZOP_UNACCEPTABLE_RISK]
programador:
actualizado: 2026-06-28
tags: [tool, safety, catalogo]
---
# Ejecutar Análisis HAZOP
> `run_hazop_analysis` · Cloud · categoría **safety** · estado **catalogo**
> Pertenece al agente [[../agentes/seguridad-hse|Agente de Seguridad Industrial & HSE]]
## Qué hace
Conduce análisis de peligros y operabilidad (HAZOP) en nodos de proceso identificando desviaciones y salvaguardas.
## Contrato de eventos
- **Consume:** `ROOT_CAUSE_SYSTEMIC`
- **Produce:** `HAZOP_UNACCEPTABLE_RISK`
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `processNodeId` para identificar el nodo del proceso (tramo de tubería, equipo) en el P&ID digital y cargar sus parámetros de diseño (presión, temperatura, caudal nominal). `guideWords` son los modificadores cualitativos del HAZOP (No, Más, Menos, También, Parte de, Inverso, Diferente de); el default cubre los 7 estándar de IEC 61882, pero se pueden personalizar para procesos específicos. `parameters` son las variables del proceso a analizar (presión, temperatura, caudal, composición, nivel); si se omiten, se cargan desde el P&ID asociado al `processNodeId`.

**Cálculos:** Para cada combinación de `guideWord` × `parameter`: aplicar la lógica HAZOP para identificar la desviación (ej: 'Más + Presión' = sobrepresión). Consultar la base de datos de causas y consecuencias del dominio del proceso (base de conocimiento HAZOP) para esa desviación en ese tipo de equipo. Identificar las salvaguardas existentes (desde el P&ID: válvulas de alivio, interblocks, alarmas). Evaluar el `riskRating` usando la matriz de riesgo proceso: probabilidad × consecuencia. 'acceptable' si el riesgo residual es tolerable, 'ALARP' si puede reducirse más con medidas razonables, 'unacceptable' si requiere rediseño obligatorio. Contar `totalDeviations` y `unacceptableRisks`.

**Por qué estos outputs:** `deviations` es el registro completo del análisis HAZOP que cumple el requisito documental de estudio de peligros para obtener o renovar el permiso de operación ante Protección Civil y ASEA. `riskRating` por desviación permite al agente priorizar las recomendaciones: las desviaciones 'unacceptable' requieren acción antes de arrancar el proceso. `unacceptableRisks` es el KPI ejecutivo que determina si el proceso puede operar o debe parar.

**Sugerencia de UI:** Tabla HAZOP estructurada (hoja de registro estándar IEC 61882) con columnas: Nodo, Guía, Parámetro, Desviación, Causa, Consecuencia, Salvaguardas, Riesgo, Recomendación. Filtro para mostrar solo riesgos 'unacceptable'. Exportar a Excel con el formato estándar de hoja de registro HAZOP. Progreso de análisis por nodo del P&ID.
## Comunicaciones
**Esta tool dispara a:**
- [[../comunicaciones/run_hazop_analysis__calculate_sil_level]] — `HAZOP_UNACCEPTABLE_RISK` → [[calculate_sil_level]]
**Esta tool es disparada por:**
- [[investigate_root_cause_hse]] — `ROOT_CAUSE_SYSTEMIC` → [[../comunicaciones/investigate_root_cause_hse__run_hazop_analysis]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

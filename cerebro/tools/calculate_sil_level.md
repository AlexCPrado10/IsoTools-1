---
tipo: tool
id: calculate_sil_level
nombre: "Calcular Nivel SIL"
categoria: safety
agente: seguridad-hse
estado: catalogo
consume: [HAZOP_UNACCEPTABLE_RISK]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, safety, catalogo]
---
# Calcular Nivel SIL
> `calculate_sil_level` · Cloud · categoría **safety** · estado **catalogo**
> Pertenece al agente [[../agentes/seguridad-hse|Agente de Seguridad Industrial & HSE]]
## Qué hace
Determina el nivel de integridad de seguridad (SIL 1-4) requerido para sistemas instrumentados de seguridad según IEC 61508/61511.
## Contrato de eventos
- **Consume:** `HAZOP_UNACCEPTABLE_RISK`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** Se necesita `hazardId` para identificar el peligro específico del análisis de riesgo de proceso (ej: sobrepresión en reactor, fuga de gas tóxico) y cargar el escenario de accidente descrito en el HAZOP. `frequencyOfHazard` (eventos/año) es la tasa de iniciación del escenario de peligro sin ninguna función instrumentada de seguridad (SIF). `probabilityOfHarm` (0-1) es la fracción de eventos de peligro que efectivamente resultan en daño si el SIF falla. `targetRiskFrequency` es la frecuencia de daño tolerable según la política de riesgo de la empresa (típicamente 1×10⁻⁴ a 1×10⁻⁶ eventos dañinos/año).

**Cálculos:** Proveer los parámetros de la SIF (Safety Instrumented Function) al servicio de cálculo SIL certificado configurado (exSILentia, FMEDA toolbox, SILcet, o equivalente IEC 61508/61511). Pasar: frecuencia del peligro, probabilidad de daño, demandas por año y datos de los elementos de la SIF (sensor, lógica, actuador). Obtener el nivel SIL requerido del tool certificado y registrar la referencia al reporte generado para trazabilidad en auditorías de seguridad funcional.

**Por qué estos outputs:** `silLevel` define los requisitos de hardware (SFF, tipo de subsistema) y software (IEC 61508 SIL) para el sistema instrumentado de seguridad a diseñar o verificar. `pfdAvg` requerido es el target de diseño que el ingeniero de seguridad funcional usará para seleccionar componentes certificados. `requiresRedundancy` impacta directamente el presupuesto de capital del SIS. `architectureRecommendation` guía al agente para buscar proveedores de sistemas SIS certificados.

**Sugerencia de UI:** Calculadora de SIL con entradas numéricas para los tres parámetros. Diagrama de capas de protección (LOPA) mostrando la frecuencia de peligro reduciéndose en cascada por cada IPL. Resultado destacado con el nivel SIL en tarjeta grande con color (azul=SIL1, amarillo=SIL2, naranja=SIL3, rojo=SIL4). Tabla de requisitos de arquitectura y disponibilidad objetivo por nivel SIL.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[run_hazop_analysis]] — `HAZOP_UNACCEPTABLE_RISK` → [[../comunicaciones/run_hazop_analysis__calculate_sil_level]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

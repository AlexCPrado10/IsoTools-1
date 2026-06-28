---
tipo: tool
id: count_items_on_conveyor
nombre: "Contar Ítems en Cinta"
categoria: vision
agente: vision-artificial-industrial
estado: catalogo
consume: [CONVEYOR_FRAME]
produce: []
programador:
actualizado: 2026-06-28
tags: [tool, vision, catalogo]
---
# Contar Ítems en Cinta
> `count_items_on_conveyor` · Edge · categoría **vision** · estado **catalogo**
> Pertenece al agente [[../agentes/vision-artificial-industrial|Agente de Visión Artificial Industrial]]
## Qué hace
Cuenta ítems que pasan por la cinta transportadora en tiempo real con precisión > 99%.
## Contrato de eventos
- **Consume:** `CONVEYOR_FRAME`
- **Produce:** — (es hoja o aún sin regla)
## Notas de implementación (tools-dev-spec)
**Por qué estos inputs:** cameraId identifica la cámara ubicada sobre la banda transportadora. countingLine es la línea virtual (coordenadas en la imagen) que los objetos deben cruzar para ser contados — permite contar en puntos específicos de la banda sin confundir objetos que se mueven en paralelo o en sentido contrario.

**Cálculos:** Detectar y trackear objetos en el video usando un algoritmo de tracking (SORT, DeepSORT o ByteTrack). Detectar cuándo el centroide de un objeto cruza la countingLine en la dirección correcta. Incrementar el contador y calcular countPerMinute como la tasa media de cruces en la ventana temporal reciente.

**Por qué estos outputs:** countTotal es el acumulado del turno que se compara contra la meta de producción para calcular el OEE. countPerMinute es la tasa actual que el agente monitorea para detectar ralentizaciones de la línea. timestamp permite sincronizar el conteo con los registros del MES.

**Sugerencia de UI:** Visualización de la cámara con la línea de conteo superpuesta en azul. Contador digital grande mostrando total del turno y meta. Gráfica de barras por hora con meta horizontal. Indicador de tasa actual (piezas/min) con flecha de tendencia.
## Comunicaciones
**Esta tool dispara a:**
- _ninguna declarada_
**Esta tool es disparada por:**
- [[capture_video_stream]] — `CONVEYOR_FRAME` → [[../comunicaciones/capture_video_stream__count_items_on_conveyor]]
## Bitácora de cambios
<!-- Anota aquí cada cambio de contrato/lógica que pueda afectar a otras tools.
     Formato sugerido:  - [YYYY-MM-DD] (tu-nombre) qué cambió y a quién afecta -->
- [2026-06-28] (auto) nota inicial generada desde la configuración.

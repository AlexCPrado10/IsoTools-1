// src/controllers/catalogController.js
// -----------------------------------------------------------------------------
// El catalogo es el CONTRATO publicado. Se expone en solo-lectura y sin API key
// (dato no sensible) para que cualquier tool descubra tipos de evento, quien los
// produce y quien los consume, sin clonar el core. Es la version consultable del
// Event Catalog descrito en INTER-TOOL-INTEGRATION.md.
// -----------------------------------------------------------------------------
import {
  getEventStandard,
  buildEventCatalog,
  getTool,
  getConsumes,
  getProduces,
} from "../services/catalogService.js";

export function getStandard(req, res, next) {
  try {
    const standard = getEventStandard();
    if (!standard)
      return res
        .status(404)
        .json({ error: "event-standard.json not available" });
    return res.json(standard);
  } catch (error) {
    return next(error);
  }
}

export function getEvents(req, res, next) {
  try {
    const events = buildEventCatalog();
    return res.json({ count: events.length, events });
  } catch (error) {
    return next(error);
  }
}

export function getToolContract(req, res, next) {
  try {
    const { toolId } = req.params;
    const tool = getTool(toolId);
    if (!tool)
      return res.status(404).json({ error: `Unknown tool '${toolId}'` });
    return res.json({
      id: tool.id,
      category: tool.category || null,
      consumes: getConsumes(toolId),
      produces: getProduces(toolId),
    });
  } catch (error) {
    return next(error);
  }
}

// src/services/catalogService.js
// -----------------------------------------------------------------------------
// EL CATALOGO ES EL CONTRATO. Las tools no se conocen entre si: un consumidor
// declara que tipos de evento consume (`consumes` en tools.json) y la plataforma
// usa ese dato para entregarle SOLO lo suyo (endpoint /subscriptions/:toolId).
// Aqui se cargan una vez los 5 JSON de configuracion y se derivan indices:
//   - consumes/produces por tool
//   - productores y consumidores por tipo de evento (catalogo derivado)
// Todo es lectura pura en memoria; no toca la base ni la red.
// -----------------------------------------------------------------------------
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = path.join(__dirname, "../data/agents");

let state = null;

function loadJson(file) {
  return JSON.parse(readFileSync(path.join(AGENTS_DIR, file), "utf-8"));
}

function build() {
  const tools = loadJson("tools.json");
  const byId = new Map();
  const producersByType = new Map(); // type -> Set(toolId)
  const consumersByType = new Map(); // type -> Set(toolId)

  const addTo = (map, key, toolId) => {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(toolId);
  };

  for (const t of tools) {
    if (!t || !t.id) continue;
    byId.set(t.id, t);
    for (const type of Array.isArray(t.produces) ? t.produces : [])
      addTo(producersByType, type, t.id);
    for (const type of Array.isArray(t.consumes) ? t.consumes : [])
      addTo(consumersByType, type, t.id);
  }

  let eventStandard = null;
  try {
    eventStandard = loadJson("event-standard.json");
  } catch {
    /* opcional */
  }

  return { tools, byId, producersByType, consumersByType, eventStandard };
}

function ensure() {
  if (!state) state = build();
  return state;
}

// Fuerza recarga (util en tests o tras editar los JSON en caliente).
export function reloadCatalog() {
  state = build();
  return state;
}

export function toolExists(id) {
  return ensure().byId.has(id);
}

export function getTool(id) {
  return ensure().byId.get(id) || null;
}

// Los tipos de evento que ESTA tool consume (su suscripcion declarada).
export function getConsumes(id) {
  const t = ensure().byId.get(id);
  return t && Array.isArray(t.consumes) ? t.consumes : [];
}

export function getProduces(id) {
  const t = ensure().byId.get(id);
  return t && Array.isArray(t.produces) ? t.produces : [];
}

// Catalogo derivado por tipo de evento: quien lo emite y quien lo consume.
// Es lo que permite razonar el acoplamiento sin que las tools se importen.
export function buildEventCatalog() {
  const { producersByType, consumersByType } = ensure();
  const types = new Set([...producersByType.keys(), ...consumersByType.keys()]);
  const events = [];
  for (const type of [...types].sort()) {
    events.push({
      type,
      producers: [...(producersByType.get(type) || [])].sort(),
      consumers: [...(consumersByType.get(type) || [])].sort(),
    });
  }
  return events;
}

export function getEventStandard() {
  return ensure().eventStandard;
}

export default {
  reloadCatalog,
  toolExists,
  getTool,
  getConsumes,
  getProduces,
  buildEventCatalog,
  getEventStandard,
};

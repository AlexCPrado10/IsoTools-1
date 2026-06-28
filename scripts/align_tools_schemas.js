// scripts/align_tools_schemas.js
// ─────────────────────────────────────────────────────────────────────────────
// Alinea tools.json contra communication-rules.json:
//   1. AÑADE a cada tool `produces` / `consumes` (los eventos del bus, derivados
//      de las reglas). isoEvent se queda intacto (etiqueta semántica ISO).
//   2. ENRIQUECE el outputSchema de cada tool source para que contenga TODOS los
//      campos que sus targets marcan como `required` + los campos que leen los
//      `triggerCondition` de sus aristas salientes. Así la salida de una tool
//      "encaja" con la entrada de la siguiente.
//
// No borra nada existente: produces/consumes se anexan al final del objeto y los
// campos nuevos se anexan al final de outputSchema.properties.
//
// Uso: node scripts/align_tools_schemas.js [--write]
//   sin --write  → modo dry-run, solo reporta.
//   --write      → reescribe src/data/agents/tools.json
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from 'fs';
import { listTools } from '../src/tools/index.js';

const WRITE = process.argv.includes('--write');
const TOOLS_PATH = 'src/data/agents/tools.json';
const RULES_PATH = 'src/data/agents/communication-rules.json';

const tools = JSON.parse(readFileSync(TOOLS_PATH, 'utf8'));
const rules = JSON.parse(readFileSync(RULES_PATH, 'utf8')).rules;
const byId = Object.fromEntries(tools.map(t => [t.id, t]));

// — Campos (LHS) que el bus busca en el contexto de un triggerCondition —
// El bus solo resuelve el lado izquierdo de cada comparación contra event.data;
// el lado derecho lo trata como literal. Por eso solo extraemos LHS.
function condLhsWithOps (cond) {
  const out = [];
  if (!cond || cond.trim().toLowerCase() === 'always') return out;
  const re = /([A-Za-z_]\w*(?:\.\w+)*)\s*(===|==|!==|!=|>=|<=|>|<|\bIN\b|\bincludes\b)\s*([^A-Za-z0-9_.]*\S*)/g;
  let m;
  while ((m = re.exec(cond))) {
    const field = m[1].split('.')[0];
    if (['always', 'true', 'false'].includes(field)) continue;
    out.push({ field, op: m[2], rhs: (m[3] || '').trim() });
  }
  return out;
}

// Tipo inferido para un campo que solo aparece en una condición.
function inferTypeFromCond (op, rhs) {
  if (['>', '<', '>=', '<='].includes(op)) return { type: 'number' };
  if (op === 'includes') return { type: 'array', items: { type: 'string' } };
  if (op === 'IN') return { type: 'string' };
  // == === != !==  → mira el RHS
  const r = rhs.replace(/^['"]|['"].*$/g, '');
  if (r === 'true' || r === 'false') return { type: 'boolean' };
  if (r !== '' && !Number.isNaN(Number(r))) return { type: 'number' };
  return { type: 'string' };
}

// produces/consumes por tool (orden de primera aparición, determinista)
const produces = Object.fromEntries(tools.map(t => [t.id, []]));
const consumes = Object.fromEntries(tools.map(t => [t.id, []]));
const pushUniq = (arr, v) => { if (!arr.includes(v)) arr.push(v); };

for (const r of rules) {
  if (produces[r.sourceToolId]) pushUniq(produces[r.sourceToolId], r.event);
  if (consumes[r.targetToolId]) pushUniq(consumes[r.targetToolId], r.event);
}

// Unir con la meta de los handlers reales: capturan eventos hoja (producidos
// pero que nadie consume, p.ej. FOLLOWUP_SCHEDULED) que las reglas no declaran.
for (const m of listTools()) {
  if (!produces[m.id]) continue; // solo tools presentes en el catálogo
  for (const e of m.produces || []) pushUniq(produces[m.id], e);
  for (const e of m.consumes || []) pushUniq(consumes[m.id], e);
}

// Para cada tool source: qué campos (y con qué tipo) debe exponer en su output.
// Prioridad de tipo: el inputSchema.properties del target manda; si no existe,
// se infiere de la condición.
const needBySource = {}; // id -> Map(field -> schema)
for (const r of rules) {
  const s = byId[r.sourceToolId];
  const tg = byId[r.targetToolId];
  if (!s || !tg) continue;
  const map = (needBySource[s.id] ||= new Map());

  // campos required del target
  const tgProps = (tg.inputSchema && tg.inputSchema.properties) || {};
  for (const f of (tg.inputSchema && tg.inputSchema.required) || []) {
    if (!map.has(f)) map.set(f, tgProps[f] ? JSON.parse(JSON.stringify(tgProps[f])) : { type: 'string' });
  }
  // campos del triggerCondition
  for (const { field, op, rhs } of condLhsWithOps(r.triggerCondition)) {
    if (map.has(field)) continue;
    // si algún target lo define en su input, usar ese tipo; si no, inferir
    if (tgProps[field]) map.set(field, JSON.parse(JSON.stringify(tgProps[field])));
    else map.set(field, inferTypeFromCond(op, rhs));
  }
}

// — Conflictos de tipo en campos que YA conectan (mismo nombre, distinto tipo) —
// El target define el contrato que el dato debe cumplir para fluir, así que
// alineamos el output del source al tipo del input del target. Si dos targets
// distintos piden tipos incompatibles para el mismo campo, se avisa y se omite.
function typeSig (s) {
  if (!s) return '?';
  if (s.type === 'array') return 'array<' + ((s.items && s.items.type) || '?') + '>';
  return s.type || '?';
}
const retypeBySource = {}; // id -> Map(field -> {schema, targets:Set})
for (const r of rules) {
  const s = byId[r.sourceToolId]; const tg = byId[r.targetToolId];
  if (!s || !tg) continue;
  const op = (s.outputSchema && s.outputSchema.properties) || {};
  const ip = (tg.inputSchema && tg.inputSchema.properties) || {};
  for (const f of Object.keys(ip)) {
    if (!op[f]) continue; // si no existe aún, lo cubre el enriquecido de abajo
    if (typeSig(op[f]) === typeSig(ip[f])) continue;
    const map = (retypeBySource[s.id] ||= new Map());
    const cur = map.get(f);
    if (cur && typeSig(cur.schema) !== typeSig(ip[f])) {
      console.log(`! CONFLICTO entre targets para ${s.id}.${f}: ${typeSig(cur.schema)} vs ${typeSig(ip[f])} — omitido`);
      cur.conflict = true;
      continue;
    }
    if (!cur) map.set(f, { schema: JSON.parse(JSON.stringify(ip[f])), targets: new Set([tg.id]) });
    else cur.targets.add(tg.id);
  }
}

// — Aplicar cambios —
let addedFields = 0;
let toolsTouched = 0;
let retypedFields = 0;
const fieldLog = [];
const retypeLog = [];

for (const t of tools) {
  let touched = false;

  // 1) produces / consumes (siempre se declaran, aunque vacíos)
  t.produces = produces[t.id];
  t.consumes = consumes[t.id];

  // 2) reconciliar tipos de campos que ya conectan
  const retype = retypeBySource[t.id];
  if (retype && retype.size) {
    t.outputSchema ||= { type: 'object', properties: {} };
    t.outputSchema.properties ||= {};
    for (const [field, info] of retype) {
      if (info.conflict) continue;
      const before = typeSig(t.outputSchema.properties[field]);
      t.outputSchema.properties[field] = info.schema;
      retypedFields++;
      touched = true;
      retypeLog.push(`  ${t.id}.${field}: ${before} → ${typeSig(info.schema)} (por ${[...info.targets].join(', ')})`);
    }
  }

  // 3) enriquecer outputSchema con campos faltantes
  const need = needBySource[t.id];
  if (need && need.size) {
    t.outputSchema ||= { type: 'object', properties: {} };
    t.outputSchema.properties ||= {};
    const existing = t.outputSchema.properties;
    const newOnes = [];
    for (const [field, schema] of need) {
      if (existing[field]) continue; // ya lo expone
      existing[field] = schema;
      newOnes.push(field);
      addedFields++;
      touched = true;
    }
    if (newOnes.length) fieldLog.push(`  ${t.id}: +[${newOnes.join(', ')}]`);
  }
  if (touched) toolsTouched++;
}

// — Verificación: re-chequear que no quedan huecos —
function outProps (t) { return (t.outputSchema && t.outputSchema.properties) ? Object.keys(t.outputSchema.properties) : []; }
let gaps = 0;
for (const r of rules) {
  const s = byId[r.sourceToolId]; const tg = byId[r.targetToolId];
  if (!s || !tg) continue;
  const op = outProps(s);
  const reqMiss = ((tg.inputSchema && tg.inputSchema.required) || []).filter(f => !op.includes(f));
  const condMiss = condLhsWithOps(r.triggerCondition).map(x => x.field).filter(f => !op.includes(f));
  if (reqMiss.length || condMiss.length) {
    gaps++;
    console.log(`GAP REMAINS: ${r.sourceToolId} -> ${r.targetToolId} req:[${reqMiss}] cond:[${condMiss}]`);
  }
}

console.log(`\nTools con produces/consumes: ${tools.length}`);
console.log(`Tools con output enriquecido: ${toolsTouched} | campos añadidos: ${addedFields} | campos re-tipados: ${retypedFields}`);
console.log(`Huecos restantes tras alineado: ${gaps}`);
if (retypeLog.length) console.log('\nConflictos de tipo reconciliados:\n' + retypeLog.join('\n'));
console.log('\nDetalle de campos añadidos:\n' + fieldLog.join('\n'));

if (WRITE && gaps === 0) {
  writeFileSync(TOOLS_PATH, JSON.stringify(tools, null, 2));
  console.log(`\n✓ ESCRITO ${TOOLS_PATH}`);
} else if (WRITE) {
  console.log('\n✗ NO se escribió: quedan huecos.');
} else {
  console.log('\n(dry-run; usa --write para aplicar)');
}

// src/db/capabilities.js
// -----------------------------------------------------------------------------
// Capacidades del esquema detectadas al arrancar (las rellena migrate.js). Sirven
// para degradar con gracia: si una base vieja aun no tiene la columna `seq` o el
// indice unico de `event_id`, la API sigue funcionando en modo compatible en vez
// de romperse. Nunca se lanzan errores por una capacidad ausente.
// -----------------------------------------------------------------------------
export const capabilities = {
  // Columna monotona `seq` (BIGINT identity) para cursores por keyset.
  hasSeq: false,
  // Indice UNIQUE sobre event_id -> habilita ingesta idempotente (ON CONFLICT).
  hasEventIdUnique: false,
};

export default capabilities;

import pg from "pg";
import config from "../config.js";

const { Pool } = pg;

// node-postgres devuelve BIGINT (OID 20) como string para no perder precision.
// El unico BIGINT del esquema es `seq` (contador de eventos, muy por debajo de
// 2^53), asi que lo parseamos a Number para que la API exponga el cursor como
// numero de forma consistente (seq, next_seq, max_seq).
pg.types.setTypeParser(20, (v) => (v == null ? null : Number(v)));

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const pool = new Pool({
  ...poolConfig,
  max: config.db.poolMax,
  idleTimeoutMillis: config.db.idleTimeoutMs,
  connectionTimeoutMillis: config.db.connectionTimeoutMs,
  statement_timeout: config.db.statementTimeoutMs,
});

pool.on("error", (err) => {
  console.error("Unexpected PG error", err);
});

// Sonda de readiness: comprueba que la base responde. La usa GET /api/v1/ready
// para que el orquestador (Railway/K8s) solo enrute trafico cuando hay DB.
export async function pingDb() {
  const { rows } = await pool.query("SELECT 1 AS ok");
  return rows[0] && rows[0].ok === 1;
}

export default pool;

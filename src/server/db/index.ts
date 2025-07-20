import { drizzle } from "drizzle-orm/singlestore";
import { createPool, type Pool } from "mysql2/promise"; 


import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

// Use hostname as primary option, IP address as fallback to avoid DNS resolution issues
const host = env.SINGLESTORE_HOST === 'svc-554a48e0-adba-44d4-80e9-f368c0f377c3-dml.aws-oregon-4.svc.singlestore.com' 
  ? '44.228.246.16'
  : env.SINGLESTORE_HOST;

const conn =
  globalForDb.conn ?? 
  createPool({
    host: host,
    port: parseInt(env.SINGLESTORE_PORT),
    user: env.SINGLESTORE_USER,
    password: env.SINGLESTORE_PASS,
    database: env.SINGLESTORE_DB,
    ssl: {},    
    maxIdle: 0,
  });
if (env.NODE_ENV !== "production") globalForDb.conn = conn;


conn.addListener('error', (err) => {
  console.error('Database connection error', err);
});

export const db = drizzle(conn, { schema });


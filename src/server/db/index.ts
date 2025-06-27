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

// IP Address 44.212.143.223 instead of hostname to avoid DNS resolution issues
const host = env.SINGLESTORE_HOST === 'svc-741fe687-0339-4cf5-99fb-de8e02574507-dml.aws-virginia-8.svc.singlestore.com' 
  ? '52.205.229.109' 
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


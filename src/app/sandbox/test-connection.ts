import { db } from "~/server/db";
import { sql } from "drizzle-orm";

async function testConnection() {
  try {
    // Try a simple query
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("Connection successful:", result);
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

void testConnection();

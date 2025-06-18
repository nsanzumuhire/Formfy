import { Pool, neonConfig } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  console.log("Running database migration...");
  
  try {
    const migrationSQL = readFileSync(join(process.cwd(), 'drizzle/0001_initial_schema.sql'), 'utf8');
    await pool.query(migrationSQL);
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);
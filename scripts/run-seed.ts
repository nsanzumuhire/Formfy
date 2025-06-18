import { Pool, neonConfig } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runSeeder() {
  console.log("Running database seeder...");
  
  try {
    const seedSQL = readFileSync(join(process.cwd(), 'scripts/seed-simple.sql'), 'utf8');
    await pool.query(seedSQL);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runSeeder().catch(console.error);
import fs from "fs";
import { Pool } from "pg";

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:Kuman%4002@localhost/postgres",
  });

  const sql = fs.readFileSync("./migration.sql", "utf8");

  try {
    await pool.query(sql);
    console.log("✅ Migration ran successfully — tables & indexes created.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await pool.end();
  }
}

runMigration();
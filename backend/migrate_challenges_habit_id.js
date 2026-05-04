const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function migrate() {
  try {
    await pool.query("ALTER TABLE challenges ADD COLUMN IF NOT EXISTS habit_id INTEGER REFERENCES habits(id) ON DELETE SET NULL");
    console.log("Migration successful: added habit_id to challenges");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}
migrate();

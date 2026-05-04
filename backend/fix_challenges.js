const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function fix() {
  try {
    const res = await pool.query("SELECT id, name, user_id FROM challenges WHERE status = 'active' AND habit_id IS NULL");
    console.log(`Found ${res.rows.length} challenges to fix.`);
    
    for (const ch of res.rows) {
      console.log(`Fixing challenge: ${ch.name}`);
      const hRes = await pool.query(
        "INSERT INTO habits (user_id, name, color, priority, goal_days) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [ch.user_id, `Chellenj: ${ch.name}`, "#10b981", 5, 30]
      );
      const habitId = hRes.rows[0].id;
      await pool.query("UPDATE challenges SET habit_id = $1 WHERE id = $2", [habitId, ch.id]);
      console.log(`Linked challenge ${ch.id} to habit ${habitId}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fix();

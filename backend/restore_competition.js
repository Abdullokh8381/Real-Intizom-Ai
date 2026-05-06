const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function restore() {
  try {
    // Create habit for User 1 (Abdulloh)
    const h1 = await pool.query(
      "INSERT INTO habits (user_id, name, color, priority, goal_days) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [1, 'Musobaqa: Tongda yugurishga chiqish', '#f59e0b', 10, 30]
    );
    const h1Id = h1.rows[0].id;
    
    // Insert competition row
    // User 7 was sender, User 1 was receiver
    await pool.query(
      "INSERT INTO competitions (sender_id, receiver_id, title, start_date, end_date, status, sender_habit_id, receiver_habit_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [7, 1, 'Tongda yugurishga chiqish', '2026-05-04', '2026-06-03', 'active', 7, h1Id]
    );
    
    console.log('Restored competition between User 7 and User 1');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
restore();

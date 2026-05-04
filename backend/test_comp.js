require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const email = 'abdullokhasrarov@gmail.com';
    const user = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
        console.log("User not found");
        return;
    }
    const userId = user.rows[0].id;
    console.log("User ID:", userId);

    const result = await pool.query(`
      SELECT c.*, 
             u1.name as sender_name, u1.email as sender_email,
             u2.name as receiver_name, u2.email as receiver_email,
             (SELECT count(*) FROM habit_logs WHERE habit_id = c.sender_habit_id AND is_done = true AND log_date >= to_char(date_trunc('week', current_date), 'YYYY-MM-DD')) as sender_done_count,
             (SELECT count(*) FROM habit_logs WHERE habit_id = c.receiver_habit_id AND is_done = true AND log_date >= to_char(date_trunc('week', current_date), 'YYYY-MM-DD')) as receiver_done_count
      FROM competitions c
      JOIN users u1 ON c.sender_id = u1.id
      JOIN users u2 ON c.receiver_id = u2.id
      WHERE c.sender_id = $1 OR c.receiver_id = $1
      ORDER BY c.created_at DESC
    `, [userId]);

    const competitions = result.rows.map(row => ({
      ...row,
      sender_progress: Math.min(100, Math.round((parseInt(row.sender_done_count || 0) / 7) * 100)),
      receiver_progress: Math.min(100, Math.round((parseInt(row.receiver_done_count || 0) / 7) * 100))
    }));

    console.log("Competitions data:", JSON.stringify(competitions, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

check();

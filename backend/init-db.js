require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  try {
    console.log("Ma'lumotlar bazasiga ulanilmoqda...");
    const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    
    await pool.query(sql);
    console.log("G'alaba! Barcha jadvallar muvaffaqiyatli yaratildi. ✅");
  } catch (err) {
    console.error("Xatolik yuz berdi:", err.message);
  } finally {
    await pool.end();
  }
}

initDB();

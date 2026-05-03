const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Tizim to'g'ri ulanishini tekshirish
router.get('/status', (req, res) => {
  res.json({ message: "API ishlayapti!" });
});

// ==========================================
// VAZIFALAR (TASKS) UCHUN API LARI
// ==========================================

// Foydalanuvchining barcha vazifalarini olish
router.get('/tasks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY id ASC', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yangi vazifa qo'shish
router.post('/tasks', async (req, res) => {
  try {
    const { user_id, title, day_of_week, week_start } = req.body;
    const result = await db.query(
      'INSERT INTO tasks (user_id, title, day_of_week, week_start) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, title, day_of_week, week_start]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... Keyingi bosqichda Habits va Challenge API lari ham aynan shu yerga yoziladi

module.exports = router;

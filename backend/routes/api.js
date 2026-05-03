const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Tizim holatini tekshirish
router.get('/status', (req, res) => res.json({ status: 'ok' }));

// ─── VAZIFALAR (TASKS) ─────────────────────────

router.get('/tasks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY id ASC', [userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/tasks', async (req, res) => {
  try {
    const { user_id, title, day_of_week, week_start } = req.body;
    const result = await db.query(
      'INSERT INTO tasks (user_id, title, day_of_week, week_start) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, title, day_of_week, week_start]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/tasks/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('UPDATE tasks SET is_completed = NOT is_completed WHERE id = $1 RETURNING *', [id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── ODATLAR (HABITS) ─────────────────────────

router.get('/habits/:userId', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM habits WHERE user_id = $1 ORDER BY priority DESC', [req.params.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/habits', async (req, res) => {
  try {
    const { user_id, name, color, priority, goal_days } = req.body;
    const result = await db.query(
      'INSERT INTO habits (user_id, name, color, priority, goal_days) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, name, color, priority, goal_days]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/habits/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM habits WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── ODAT LOGLARI (HABIT LOGS) ──────────────────

router.get('/habit-logs/:userId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT hl.* FROM habit_logs hl JOIN habits h ON hl.habit_id = h.id WHERE h.user_id = $1',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/habit-logs/toggle', async (req, res) => {
  try {
    const { habit_id, log_date } = req.body;
    const existing = await db.query('SELECT * FROM habit_logs WHERE habit_id = $1 AND log_date = $2', [habit_id, log_date]);
    
    if (existing.rows.length > 0) {
      const result = await db.query('UPDATE habit_logs SET is_done = NOT is_done WHERE id = $1 RETURNING *', [existing.rows[0].id]);
      res.json(result.rows[0]);
    } else {
      const result = await db.query('INSERT INTO habit_logs (habit_id, log_date, is_done) VALUES ($1, $2, true) RETURNING *', [habit_id, log_date]);
      res.json(result.rows[0]);
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── CHELLENJLARI (CHALLENGES) ──────────────────

router.get('/challenges/:userId', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM challenges WHERE user_id = $1', [req.params.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/challenges', async (req, res) => {
  try {
    const { user_id, name, description, duration_days, quantity_label } = req.body;
    const result = await db.query(
      'INSERT INTO challenges (user_id, name, description, duration_days, quantity_label) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, name, description, duration_days, quantity_label]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

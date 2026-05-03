const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware: Tokenni tekshirish
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token noto'g'ri" });
    req.user = user;
    next();
  });
};

// ─── AUTH (REGISTER) ──────────────────────────

router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Bu email allaqachon mavjud" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [full_name, email, hashedPassword]
    );
    
    const userData = result.rows[0];
    const jwtToken = jwt.sign({ id: userData.id, email: userData.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ token: jwtToken, user: { id: userData.id, full_name: userData.full_name, email: userData.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── AUTH (LOGIN) ─────────────────────────────

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) return res.status(400).json({ error: "Email yoki parol xato" });
    
    const userData = result.rows[0];
    const validPassword = await bcrypt.compare(password, userData.password);
    if (!validPassword) return res.status(400).json({ error: "Email yoki parol xato" });

    const jwtToken = jwt.sign({ id: userData.id, email: userData.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token: jwtToken, user: { id: userData.id, full_name: userData.full_name, email: userData.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── AUTH (GOOGLE LOGIN) ───────────────────────

router.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      user = await db.query(
        'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, 'google_auth_placeholder']
      );
    }
    
    const userData = user.rows[0];
    const jwtToken = jwt.sign({ id: userData.id, email: userData.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ token: jwtToken, user: { id: userData.id, full_name: userData.full_name, email: userData.email } });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err.message);
    res.status(500).json({ error: "Google identifikatsiya xatosi: " + err.message });
  }
});

router.get('/status', (req, res) => res.json({ status: 'ok' }));

// ─── HIMOyalangan YO'LLAR (VAZIFALAR, ODATLAR ...) ───

router.get('/tasks/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id != req.params.userId) return res.status(403).json({ error: "Ruxsat yo'q" });
    const result = await db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY id ASC', [req.params.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { user_id, title, day_of_week, week_start } = req.body;
    if (req.user.id != user_id) return res.status(403).json({ error: "Ruxsat yo'q" });
    const result = await db.query(
      'INSERT INTO tasks (user_id, title, day_of_week, week_start) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, title, day_of_week, week_start]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/tasks/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('UPDATE tasks SET is_completed = NOT is_completed WHERE id = $1 RETURNING *', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/habits/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id != req.params.userId) return res.status(403).json({ error: "Ruxsat yo'q" });
    const result = await db.query('SELECT * FROM habits WHERE user_id = $1 ORDER BY priority DESC', [req.params.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/habits', authenticateToken, async (req, res) => {
  try {
    const { user_id, name, color, priority, goal_days } = req.body;
    if (req.user.id != user_id) return res.status(403).json({ error: "Ruxsat yo'q" });
    const result = await db.query(
      'INSERT INTO habits (user_id, name, color, priority, goal_days) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, name, color, priority, goal_days]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/habits/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM habits WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/habit-logs/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id != req.params.userId) return res.status(403).json({ error: "Ruxsat yo'q" });
    const result = await db.query(
      'SELECT hl.* FROM habit_logs hl JOIN habits h ON hl.habit_id = h.id WHERE h.user_id = $1',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/habit-logs/toggle', authenticateToken, async (req, res) => {
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

router.get('/challenges/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id != req.params.userId) return res.status(403).json({ error: "Ruxsat yo'q" });
    const result = await db.query('SELECT * FROM challenges WHERE user_id = $1', [req.params.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/challenges', authenticateToken, async (req, res) => {
  try {
    const { user_id, name, description, duration_days, quantity_label } = req.body;
    if (req.user.id != user_id) return res.status(403).json({ error: "Ruxsat yo'q" });
    const result = await db.query(
      'INSERT INTO challenges (user_id, name, description, duration_days, quantity_label) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, name, description, duration_days, quantity_label]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

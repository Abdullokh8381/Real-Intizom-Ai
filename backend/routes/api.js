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
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [full_name, email, hashedPassword]
    );
    
    const userData = result.rows[0];
    const jwtToken = jwt.sign({ id: userData.id, email: userData.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token: jwtToken, user: { id: userData.id, name: userData.name, email: userData.email } });
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
    res.json({ token: jwtToken, user: { id: userData.id, name: userData.name, email: userData.email } });
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
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, 'google_auth_placeholder']
      );
    }
    
    const userData = user.rows[0];
    const jwtToken = jwt.sign({ id: userData.id, email: userData.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token: jwtToken, user: { id: userData.id, name: userData.name, email: userData.email } });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err.message);
    res.status(500).json({ error: "Google identifikatsiya xatosi: " + err.message });
  }
});

router.get('/status', (req, res) => res.json({ status: 'ok' }));

// ─── VAZIFALAR (TASKS) ─────────────────────────

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

// ─── ODATLAR (HABITS) ─────────────────────────

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

router.put('/habits/:id', authenticateToken, async (req, res) => {
  try {
    const { name, color, priority, goal_days } = req.body;
    const result = await db.query(
      'UPDATE habits SET name = $1, color = $2, priority = $3, goal_days = $4 WHERE id = $5 RETURNING *',
      [name, color, priority, goal_days, req.params.id]
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

// ─── ODAT LOGLARI (HABIT LOGS) ──────────────────

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

// ─── CHELLENJLARI (CHALLENGES) ──────────────────

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

// ─── USERS (SEARCH) ─────────────────────────────

router.get('/users/search', authenticateToken, async (req, res) => {
  try {
    const { email } = req.query;
    const result = await db.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── MUSOBAQALAR (COMPETITIONS) ─────────────────

router.get('/competitions/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id != req.params.userId) return res.status(403).json({ error: "Ruxsat yo'q" });
    
    // Hozirgi haftaning dushanbasini aniqlash (Postgres date_trunc 'week' dushanbani qaytaradi)
    const result = await db.query(`
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
    `, [req.params.userId]);
    
    // Foizlarni hisoblab qaytaramiz (haftalik 7 kun deb olsak)
    const competitions = result.rows.map(row => ({
      ...row,
      sender_progress: Math.min(100, Math.round((parseInt(row.sender_done_count || 0) / 7) * 100)),
      receiver_progress: Math.min(100, Math.round((parseInt(row.receiver_done_count || 0) / 7) * 100))
    }));
    
    res.json(competitions);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/competitions', authenticateToken, async (req, res) => {
  try {
    const { sender_id, receiver_email, title, start_date, end_date, note } = req.body;
    if (req.user.id != sender_id) return res.status(403).json({ error: "Ruxsat yo'q" });
    
    // Find receiver
    const receiverResult = await db.query('SELECT id FROM users WHERE email = $1', [receiver_email]);
    if (receiverResult.rows.length === 0) return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
    const receiver_id = receiverResult.rows[0].id;

    if (sender_id === receiver_id) return res.status(400).json({ error: "O'zingiz bilan musobaqalasha olmaysiz" });

    // Check if pending exists
    const existing = await db.query('SELECT * FROM competitions WHERE sender_id = $1 AND receiver_id = $2 AND status = $3', [sender_id, receiver_id, 'pending']);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Siz allaqachon taklif yuborgansiz" });

    const result = await db.query(
      'INSERT INTO competitions (sender_id, receiver_id, title, start_date, end_date, note) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [sender_id, receiver_id, title, start_date, end_date, note]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/competitions/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'rejected'
    const compId = req.params.id;
    
    const compResult = await db.query('SELECT * FROM competitions WHERE id = $1', [compId]);
    if (compResult.rows.length === 0) return res.status(404).json({ error: "Musobaqa topilmadi" });
    const comp = compResult.rows[0];

    if (req.user.id != comp.receiver_id) return res.status(403).json({ error: "Faqat qabul qiluvchi tasdiqlashi mumkin" });

    if (status === 'active') {
      // Create habit for sender
      const h1 = await db.query(
        "INSERT INTO habits (user_id, name, color, priority, goal_days) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [comp.sender_id, `Musobaqa: ${comp.title}`, "#f59e0b", 10, 30] // example color amber
      );
      // Create habit for receiver
      const h2 = await db.query(
        "INSERT INTO habits (user_id, name, color, priority, goal_days) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [comp.receiver_id, `Musobaqa: ${comp.title}`, "#f59e0b", 10, 30]
      );

      const updateResult = await db.query(
        "UPDATE competitions SET status = 'active', sender_habit_id = $1, receiver_habit_id = $2 WHERE id = $3 RETURNING *",
        [h1.rows[0].id, h2.rows[0].id, compId]
      );
      res.json(updateResult.rows[0]);
    } else {
      const updateResult = await db.query("UPDATE competitions SET status = $1 WHERE id = $2 RETURNING *", [status, compId]);
      res.json(updateResult.rows[0]);
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // JWT token yaratish
    const jwtToken = jwt.sign(
      { id: userData.id, email: userData.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Google identifikatsiya xatosi" });
  }
});

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

// ─── HIMOyalangan YO'LLAR (AUTHENTICATED ROUTES) ───

// Foydalanuvchining barcha vazifalarini olish
router.get('/tasks/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    // Faqat o'zining ma'lumotlarini ko'ra oladi
    if (req.user.id != userId) return res.status(403).json({ error: "Ruxsat yo'q" });
    
    const result = await db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY id ASC', [userId]);
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
    const { id } = req.params;
    // Boshqa foydalanuvchining vazifasini o'zgartirmasligini tekshirish kerak bo'ladi
    const result = await db.query('UPDATE tasks SET is_completed = NOT is_completed WHERE id = $1 RETURNING *', [id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Odatlar bo'limi
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

module.exports = router;

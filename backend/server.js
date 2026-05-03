require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

// Asosiy sahifa tekshiruvi
app.get('/', (req, res) => {
  res.send('Intizom AI Backend muvaffaqiyatli ishlamoqda! 🚀');
});

// Monitoring uchun Health check
app.get('/health', async (req, res) => {
  try {
    const db = require('./config/db');
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Barcha API so'rovlarni apiRoutes orqali boshqaramiz
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi.`);
});

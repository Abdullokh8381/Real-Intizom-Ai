require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

// Mobil va barcha brauzerlar uchun kengaytirilgan CORS sozlamalari
app.use(cors({
  origin: '*', // Hamma joydan ruxsat beramiz
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));

app.use(express.json());

// Asosiy sahifa
app.get('/', (req, res) => {
  res.send('Intizom AI Backend muvaffaqiyatli ishlamoqda! 🚀');
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const db = require('./config/db');
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi.`);
});

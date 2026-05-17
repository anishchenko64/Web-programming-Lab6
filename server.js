require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

require('./config/passport');

const app = express();

// ── Безпека (заголовки) ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// ── Парсинг тіла запиту ──────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Сесії ────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'substation-secret-key-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,       // true при HTTPS у production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24  // 24 години
  }
}));

// ── Passport ─────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Статичні файли ────────────────────────────────────────────
app.use(express.static('public'));

// ── Маршрути ─────────────────────────────────────────────────
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// ── Підключення до MongoDB ───────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/substation_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB підключено'))
  .catch(err => console.error('Помилка підключення до MongoDB:', err));

// ── Запуск сервера ───────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});

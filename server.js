require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const { initDB } = require('./db');

const app = express();

// app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'substation-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

// Спочатку ініціалізуємо БД, потім підключаємо маршрути
initDB().then(() => {
  require('./config/passport');
  app.use('/auth', require('./routes/auth'));
  app.use('/api', require('./routes/api'));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Сервер запущено на порті ${PORT}`));
}).catch(err => {
  console.error('Помилка ініціалізації БД:', err);
  process.exit(1);
});

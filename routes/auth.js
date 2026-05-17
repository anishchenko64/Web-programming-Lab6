const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const EventLog = require('../models/EventLog');

// ── Rate Limiting: макс. 5 спроб за 15 хвилин ────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Забагато спроб входу. Спробуйте через 15 хвилин.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ── POST /auth/register ───────────────────────────────────────
router.post('/register',
  body('email').isEmail().normalizeEmail().withMessage('Невірний формат email'),
  body('password').isLength({ min: 8 }).withMessage('Пароль мінімум 8 символів'),
  body('name').notEmpty().trim().escape().withMessage("Ім'я обов'язкове"),
  body('role').optional().isIn(['operator', 'dispatcher']).withMessage('Невірна роль'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, name, role } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Користувач з таким email вже існує' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role: role || 'operator'
      });

      res.status(201).json({
        message: 'Реєстрація успішна',
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ── POST /auth/login ──────────────────────────────────────────
router.post('/login', loginLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  passport.authenticate('local', { failWithError: true }),
  async (req, res) => {
    // Записуємо вхід у журнал
    try {
      await EventLog.create({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'LOGIN',
        details: 'Успішний вхід в систему',
        ip: req.ip
      });
    } catch (_) { /* не критично */ }

    res.json({
      message: 'Вхід успішний',
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }
    });
  },
  // Обробник помилок passport.authenticate
  (err, req, res, next) => {
    res.status(401).json({ error: err.message || 'Невірні облікові дані' });
  }
);

// ── POST /auth/logout ─────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Вихід успішний' });
  });
});

// ── GET /auth/status ──────────────────────────────────────────
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }
    });
  }
  res.json({ authenticated: false });
});

module.exports = router;

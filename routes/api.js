const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const EventLog = require('../models/EventLog');

// ── Симульовані дані підстанції ───────────────────────────────
let substationData = {
  voltage_110kV: 110.5,
  voltage_35kV: 35.2,
  voltage_10kV: 10.1,
  current_A: 320,
  power_MW: 35.3,
  mode: 'normal',
  lastUpdated: new Date()
};

// ── GET /api/substation/parameters ───────────────────────────
router.get('/substation/parameters', isAuthenticated, (req, res) => {
  try {
    EventLog.create({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'READ_PARAMETERS',
      details: 'Запит параметрів підстанції',
      ip: req.ip
    });
  } catch (_) {}

  res.json({ data: substationData, timestamp: new Date() });
});

// ── PUT /api/substation/mode ──────────────────────────────────
router.put('/substation/mode',
  isAuthenticated,
  hasRole('dispatcher'),
  body('mode').isIn(['normal', 'maintenance', 'emergency']).withMessage('Невірний режим'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mode } = req.body;
    const previousMode = substationData.mode;
    substationData.mode = mode;
    substationData.lastUpdated = new Date();

    try {
      EventLog.create({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'CHANGE_MODE',
        details: `Режим змінено: ${previousMode} → ${mode}`,
        ip: req.ip
      });
    } catch (_) {}

    res.json({
      message: `Режим підстанції змінено на "${mode}"`,
      previous: previousMode,
      current: mode,
      timestamp: new Date()
    });
  }
);

// ── GET /api/logs ─────────────────────────────────────────────
router.get('/logs', isAuthenticated, hasRole('dispatcher'), (req, res) => {
  try {
    const logs = EventLog.findAll(100);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

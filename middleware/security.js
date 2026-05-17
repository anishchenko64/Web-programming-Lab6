const escapeHtml = require('escape-html');

// ── XSS-санітизація рядка ─────────────────────────────────────
function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return escapeHtml(value.trim());
}

// ── Рекурсивна санітизація body ───────────────────────────────
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  next();
}

// ── Логування запитів ─────────────────────────────────────────
function requestLogger(req, res, next) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.path} — IP: ${req.ip}`);
  next();
}

module.exports = { sanitizeBody, requestLogger };

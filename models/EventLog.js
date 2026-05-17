const { getDB, saveDB } = require('../db');

const EventLog = {
  create({ userId, userEmail, userRole, action, details = '', ip = 'unknown' }) {
    const db = getDB();
    db.run(
      'INSERT INTO event_logs (user_id, user_email, user_role, action, details, ip) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, userEmail, userRole, action, details, ip]
    );
    saveDB();
  },

  findAll(limit = 100) {
    const db = getDB();
    const res = db.exec(`SELECT * FROM event_logs ORDER BY timestamp DESC LIMIT ${limit}`);
    if (!res.length) return [];
    return res[0].values.map(row => {
      const obj = {};
      res[0].columns.forEach((col, i) => { obj[col] = row[i]; });
      obj.timestamp = new Date(obj.timestamp * 1000);
      return obj;
    });
  }
};

module.exports = EventLog;

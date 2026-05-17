const { getDB, saveDB } = require('../db');

const User = {
  findByEmail(email) {
    const db = getDB();
    const res = db.exec('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!res.length || !res[0].values.length) return null;
    return rowToObj(res[0].columns, res[0].values[0]);
  },

  findById(id) {
    const db = getDB();
    const res = db.exec('SELECT * FROM users WHERE id = ?', [id]);
    if (!res.length || !res[0].values.length) return null;
    return rowToObj(res[0].columns, res[0].values[0]);
  },

  create({ email, password, name, role = 'operator' }) {
    const db = getDB();
    db.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), password, name, role]
    );
    saveDB();
    const res = db.exec('SELECT last_insert_rowid() as id');
    const id = res[0].values[0][0];
    return this.findById(id);
  },

  incrementLoginAttempts(id) {
    const db = getDB();
    const user = this.findById(id);
    const attempts = user.login_attempts + 1;
    if (attempts >= 5) {
      const lockUntil = Date.now() + 15 * 60 * 1000;
      db.run('UPDATE users SET login_attempts = 0, lock_until = ? WHERE id = ?', [lockUntil, id]);
    } else {
      db.run('UPDATE users SET login_attempts = ? WHERE id = ?', [attempts, id]);
    }
    saveDB();
  },

  resetLoginAttempts(id) {
    const db = getDB();
    db.run('UPDATE users SET login_attempts = 0, lock_until = NULL WHERE id = ?', [id]);
    saveDB();
  },

  isLocked(user) {
    return user.lock_until && user.lock_until > Date.now();
  }
};

function rowToObj(columns, values) {
  const obj = {};
  columns.forEach((col, i) => { obj[col] = values[i]; });
  return obj;
}

module.exports = User;

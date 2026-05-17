const path = require('path');
const fs = require('fs');

// Використовуємо sql.js — працює без компіляції на Windows
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'substation.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();

  // Завантажуємо існуючу БД або створюємо нову
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Створюємо таблиці
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator',
      login_attempts INTEGER NOT NULL DEFAULT 0,
      lock_until INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS event_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_email TEXT NOT NULL,
      user_role TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT DEFAULT '',
      ip TEXT DEFAULT 'unknown',
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
  `);

  // Зберігаємо БД на диск після кожної зміни
  saveDB();
  console.log('SQLite (sql.js) база даних ініціалізована');
}

function saveDB() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB, saveDB };

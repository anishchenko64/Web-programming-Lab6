# Практична робота №6 — Безпека веб-додатків

**Варіант 1:** Система моніторингу електропідстанції 110/35/10 кВ  

## Стек
Node.js · Express · Passport.js · SQLite · bcrypt · Helmet.js

## Запуск
```bash
npm install
npm start
```

## Функціонал
- Автентифікація (Passport.js + сесії)
- Ролі: `operator` (перегляд), `dispatcher` (керування)
- Захист від XSS, brute-force, rate limiting
- Журнал подій

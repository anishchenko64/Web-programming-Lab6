# Практична робота №6 — Безпека веб-додатків

**Варіант 1:** Система моніторингу електропідстанції 110/35/10 кВ  
**Дисципліна:** Основи веб-програмування  
**Університет:** КПІ ім. Ігоря Сікорського

## Стек
Node.js · Express · Passport.js · MongoDB · bcrypt · Helmet.js

## Запуск
```bash
npm install
cp .env.example .env
npm run dev
```

## Функціонал
- Автентифікація (Passport.js + сесії)
- Ролі: `operator` (перегляд), `dispatcher` (керування)
- Захист від XSS, brute-force, rate limiting
- Журнал подій

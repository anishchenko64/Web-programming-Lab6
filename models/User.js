const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Ролі: operator (лише перегляд), dispatcher (зміна режимів)
  role: {
    type: String,
    enum: ['operator', 'dispatcher'],
    default: 'operator'
  },
  // Блокування після 5 невдалих спроб (rate limiting на рівні моделі)
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Перевірка чи акаунт заблоковано
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);

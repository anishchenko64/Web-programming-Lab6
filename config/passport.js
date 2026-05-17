const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = User.findByEmail(email);

      if (!user) {
        return done(null, false, { message: 'Невірний email або пароль' });
      }

      if (User.isLocked(user)) {
        return done(null, false, { message: 'Акаунт тимчасово заблоковано. Спробуйте через 15 хвилин.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        User.incrementLoginAttempts(user.id);
        return done(null, false, { message: 'Невірний email або пароль' });
      }

      User.resetLoginAttempts(user.id);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const user = User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

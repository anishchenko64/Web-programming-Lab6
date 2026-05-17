const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

passport.use(new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return done(null, false, { message: 'Невірний email або пароль' });
      }

      // Перевірка блокування акаунту
      if (user.isLocked) {
        return done(null, false, { message: 'Акаунт тимчасово заблоковано. Спробуйте пізніше.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        // Збільшуємо лічильник невдалих спроб
        user.loginAttempts += 1;
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // блок на 15 хв
          user.loginAttempts = 0;
        }
        await user.save();
        return done(null, false, { message: 'Невірний email або пароль' });
      }

      // Успішний вхід — скидаємо лічильник
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

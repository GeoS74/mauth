const LocalStrategy = require('passport-local').Strategy;

const db = require('../db');
const password = require('../password');

module.exports = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false,
  },
  (async (email, pass, done) => {
    try {
      const user = await _findUser(email);

      if (!user) {
        return done(null, false, 'user not found');
      }

      if (!await password.check(user, pass)) {
        return done(null, false, 'incorrect password');
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

async function _findUser(email) {
  return db.query('SELECT * FROM users WHERE email=$1', [email])
    .then((res) => res.rows[0]);
}

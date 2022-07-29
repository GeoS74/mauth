const {KoaPassport} = require('koa-passport');
const passport = new KoaPassport();
const LocalStrategy = require('./strategies/local');

passport.use(LocalStrategy);

module.exports = passport;
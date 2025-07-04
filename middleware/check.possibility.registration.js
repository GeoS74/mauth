const config = require('../config');

module.exports = async (ctx, next) => {
  if (config.registration.prohibited) {
    ctx.throw(403, 'registration is prohibited');
  }
  await next();
};

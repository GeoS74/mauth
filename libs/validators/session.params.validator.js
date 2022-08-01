const { validate: uuidValidate } = require('uuid');

module.exports.refreshToken = async (ctx, next) => {
  try {
    const token = ctx.get('Authorization').split(' ')[1];

    if (!uuidValidate(token)) {
      ctx.throw(401, 'invalid token');
    }
  } catch (error) {
    ctx.status = error.status;
    ctx.set('WWW-Authenticate', 'Bearer');
    ctx.body = {
      error: error.message,
    };
    return;
  }
  await next();
};

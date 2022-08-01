const { validate: uuidValidate } = require('uuid');
const jwt = require('jsonwebtoken');

const config = require('../../config')

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

module.exports.accessToken = async (ctx, next) => {
  try {
    const token = ctx.get('Authorization').split(' ')[1];
    jwt.verify(token, config.jwt.secretKey);
    ctx.user = jwt.decode(token).user;
  } catch (error) {
    console.log(error)
    ctx.status = 401;
    ctx.set('WWW-Authenticate', 'Bearer');
    ctx.body = {
      error: 'invalid token',
    };
    return;
  }
  await next();
};

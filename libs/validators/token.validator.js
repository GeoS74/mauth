const { validate: uuidValidate } = require('uuid');
const jwt = require('jsonwebtoken');

const config = require('../../config');

module.exports.accessToken = async (ctx, next) => {
  try {
    const token = ctx.get('Authorization').split(' ')[1];
    ctx.user = _jwtDecode(token).user;
  } catch (error) {
    ctx.status = 401;
    ctx.set('WWW-Authenticate', 'Bearer');
    ctx.body = {
      error: 'invalid access token',
    };
    return;
  }
  await next();
};

module.exports.refreshToken = async (ctx, next) => {
  try {
    const token = ctx.get('Authorization').split(' ')[1];
    _uuidValidate(token);
    ctx.token = token;
  } catch (error) {
    ctx.status = 401;
    ctx.set('WWW-Authenticate', 'Bearer');
    ctx.body = {
      error: error.message,
    };
    return;
  }
  await next();
};

module.exports.confirmToken = async (ctx, next) => {
  try {
    const { token } = ctx.params;
    _uuidValidate(token);
    ctx.token = token;
  } catch (error) {
    ctx.status = 401;
    ctx.set('WWW-Authenticate', 'Bearer');
    ctx.body = {
      error: error.message,
    };
    return;
  }
  await next();
};

module.exports.forgotToken = async (ctx, next) => {
  try {
    const { token } = ctx.params;
    _uuidValidate(token);
    ctx.token = token;
  } catch (error) {
    ctx.status = 401;
    ctx.set('WWW-Authenticate', 'Bearer');
    ctx.body = {
      error: error.message,
    };
    return;
  }
  await next();
};

function _uuidValidate(token) {
  if (!uuidValidate(token)) {
    throw new Error('invalid token');
  }
}

function _jwtDecode(token) {
  jwt.verify(token, config.jwt.secretKey);
  return jwt.decode(token);
}

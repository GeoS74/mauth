module.exports.signup = async (ctx, next) => {
  try {
    _checkMainParams.call(null, ctx);
    await next();
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.signin = async (ctx, next) => {
  try {
    _checkMainParams.call(null, ctx);
    await next();
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.signout = async (ctx, next) => {
  await next();
};

function _checkMainParams(ctx) {
  if (!_checkEmail(ctx.request.body.email)) {
    ctx.throw(400, 'invalid email');
  }
  if (!_checkPassword(ctx.request.body.password)) {
    ctx.throw(400, 'invalid password');
  }
}

function _checkEmail(email) {
  return /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/.test(email);
}

function _checkPassword(password) {
  if (!password) {
    return false;
  }
  return /[^\s]{5,}/.test(password);
}

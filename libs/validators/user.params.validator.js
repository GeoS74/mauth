module.exports.signup = async (ctx, next) => {
  try {
    _checkParams.call(null, ctx);
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
    return;
  }
  await next();
};

module.exports.signin = async (ctx, next) => {
  try {
    _checkParams.call(null, ctx);
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
    return;
  }
  await next();
};

module.exports.signout = async (ctx, next) => {
  await next();
};

function _checkParams(ctx) {
  if (!_checkEmail(ctx.request.body.email)) {
    ctx.throw(400, 'invalid email');
  }
  if (!_checkPassword(ctx.request.body.password)) {
    ctx.throw(400, 'invalid password');
  }
  if (!_checkName(ctx.request.body.name)) {
    ctx.throw(400, 'incorrect name');
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

function _checkName(name) {
  if (!name) {
    return true;
  }
  return /^\w[\d\s-.\w]{2,}/.test(name);
}

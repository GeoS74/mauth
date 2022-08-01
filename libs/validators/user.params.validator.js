module.exports.params = async (ctx, next) => {
  try {
    if (!_checkEmail(ctx.request.body.email)) {
      ctx.throw(400, 'invalid email');
    }
    if (!_checkPassword(ctx.request.body.password)) {
      ctx.throw(400, 'invalid password');
    }
    if (!_checkName(ctx.request.body.name)) {
      ctx.throw(400, 'incorrect name');
    }
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
    return;
  }
  await next();
};

module.exports.email = async (ctx, next) => {
  try {
    if (!_checkEmail(ctx.request.body.email)) {
      ctx.throw(400, 'invalid email');
    }
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
    return;
  }
  await next();
};

module.exports.password = async (ctx, next) => {
  try {
    if (!_checkPassword(ctx.request.body.password)) {
      ctx.throw(400, 'invalid password');
    }
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
    return;
  }
  await next();
};

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

const { v4: uuid } = require('uuid');

const config = require('../config');
const db = require('../libs/db');
const password = require('../libs/password');
const mapper = require('../mappers/user.mapper');
const sendMail = require('../libs/send.mail');
const passport = require('../libs/passport');

module.exports.signup = async (ctx) => {
  try {
    const user = await _createUser(ctx.request.body);
    await _sendVerifyToken(user);

    ctx.status = 201;
    ctx.body = mapper(user);
  } catch (error) {
    if (error.code === '23505') { // unique_violation
      ctx.throw(400, 'email is not unique');
    }
    throw error;
  }
};

module.exports.signin = async (ctx, next) => {
  await _autenticateUser.call(null, ctx);
  await _delRecoveryToken(ctx.user.id);
  await next();
};

module.exports.confirm = async (ctx) => {
  const row = await _confirmAccount(ctx.token);
  if (!row?.id) {
    ctx.throw(400, 'invalid verification token');
  }

  const user = await _findUserById(row.id);
  if (!user) {
    ctx.throw(400, 'invalid verification token');
  }

  ctx.status = 200;
  ctx.body = {
    message: `you have successfully verified your ${user.email} email address`,
  };
};

module.exports.forgot = async (ctx) => {
  const user = await _createRecoveryToken(ctx.request.body.email);
  if (!user) {
    ctx.throw(404, 'user not found');
  }

  await _sendRecoveryToken(user);

  ctx.status = 200;
  ctx.body = {
    message: `password reset link has been sent to your ${user.email} email address`,
  };
};

module.exports.resetPassword = async (ctx) => {
  const tempPassword = password.random();
  const user = await _temporaryPassword(ctx.token, tempPassword);
  if (!user) {
    ctx.throw(400, 'invalid recovery token');
  }

  await _sendTemporaryPassword(user, tempPassword);

  ctx.status = 200;
  ctx.body = {
    message: `you have successfully reset your password. A new login password sent to ${user.email}`,
  };
};

module.exports.changepass = async (ctx) => {
  await _setNewPassword(ctx.user.email, ctx.request.body.password);
  ctx.status = 200;
  ctx.body = {
    message: 'password changed successfully',
  };
};

module.exports.me = async (ctx) => {
  const user = await _findUserByEmail(ctx.user.email);
  if (!user) {
    ctx.throw(404, 'user not found');
  }
  ctx.status = 200;
  ctx.body = mapper(user);
};

async function _setNewPassword(email, pass) {
  const salt = await password.salt();
  const passwordHash = await password.generate(pass, salt);
  return db.query(`UPDATE users
    SET 
      passwordhash=$2,
      salt=$3,
      updatedat=DEFAULT
    WHERE email=$1
    `, [email, passwordHash, salt]);
}

async function _temporaryPassword(recoveryToken, tempPassword) {
  const salt = await password.salt();
  const passwordHash = await password.generate(tempPassword, salt);
  return db.query(`UPDATE users
    SET 
      passwordhash=$2,
      salt=$3,
      recoverytoken=NULL, 
      updatedat=DEFAULT
    WHERE recoverytoken=$1
    RETURNING *
    `, [recoveryToken, passwordHash, salt])
    .then((res) => res.rows[0]);
}

async function _createUser(data) {
  const salt = await password.salt();
  const passwordHash = await password.generate(data.password, salt);
  const user = {
    email: data.email,
    passwordHash,
    salt,
    verificationToken: uuid(),
    name: data.name || null,
  };
  return db.query(
    `INSERT INTO users 
      (${Object.keys(user).join(',')})
    VALUES 
      (${Object.keys(user).map((_, i) => `$${i + 1}`)})
    RETURNING *`,
    Object.values(user),
  )
    .then((res) => res.rows[0]);
}

async function _createRecoveryToken(email) {
  return db.query(`UPDATE users
    SET recoverytoken=$1
    WHERE email=$2
    RETURNING recoverytoken, email
  `, [uuid(), email])
    .then((res) => res.rows[0]);
}

async function _confirmAccount(token) {
  return db.query(`UPDATE users 
      SET verificationtoken=NULL 
      WHERE verificationtoken=$1
      RETURNING id`, [token])
    .then((res) => res.rows[0]);
}

async function _findUserById(id) {
  return db.query('SELECT * FROM users WHERE id=$1', [id])
    .then((res) => res.rows[0]);
}

async function _findUserByEmail(email) {
  return db.query('SELECT * FROM users WHERE email=$1', [email])
    .then((res) => res.rows[0]);
}

async function _delRecoveryToken(userId) {
  return db.query(`UPDATE users 
      SET recoverytoken=NULL, updatedat=DEFAULT
      WHERE id=$1
      `, [userId]);
}

async function _autenticateUser(ctx) {
  await passport.authenticate('local', async (error, user, info) => {
    if (error) {
      ctx.status = 500;
      throw error;
    }

    if (!user) {
      ctx.throw(400, info);
    }

    ctx.user = user;
  })(ctx);
}

async function _sendVerifyToken(user) {
  return sendMail({
    to: user.email,
    subject: 'Подтверждение email',
    template: 'confirmation',
    locals: { host: config.server.domain, token: user.verificationtoken },
  });
}

async function _sendRecoveryToken(user) {
  return sendMail({
    to: user.email,
    subject: 'Восстановление пароля',
    template: 'recovery',
    locals: { host: config.server.domain, token: user.recoverytoken },
  });
}

async function _sendTemporaryPassword(user, tempPassword) {
  return sendMail({
    to: user.email,
    subject: 'Временный пароль',
    template: 'change',
    locals: { host: config.server.domain, password: tempPassword },
  });
}

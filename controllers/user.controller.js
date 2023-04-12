const { v4: uuid } = require('uuid');

const config = require('../config');
const db = require('../libs/db');
const pass = require('../libs/password');
const passport = require('../libs/passport');
const sendMail = require('../libs/send.mail');
const mapper = require('../mappers/user.mapper');

module.exports.signup = async (ctx, next) => {
  const user = await _createUser(ctx.request.body);

  ctx.user = user;

  if (!config.verification.ignore) {
    await _sendVerifyToken(user.email, user.verificationtoken);
  } else {
    await next();
    ctx.user = await _findUserById(user.id);
  }

  ctx.status = 201;
  ctx.body = mapper(ctx.user);
};

module.exports.signin = async (ctx, next) => {
  await _autenticateUser.call(null, ctx);
  await _delRecoveryToken(ctx.user.id);
  await next();
};

module.exports.confirm = async (ctx, next) => {
  const user = await _confirmAccount(ctx.token);
  if (!user) {
    ctx.throw(400, 'invalid verification token');
  }

  ctx.user = user;

  ctx.status = 200;
  ctx.body = {
    message: `you have successfully verified your ${ctx.user.email} email address`,
  };
  await next();
};

module.exports.firstUserMustBeAdmin = async (ctx) => {
  const accaunts = await _countAccaunts();

  if (+accaunts.count === 1) {
    await firstUserIsAdmin(ctx.user.id);
  }
};

async function firstUserIsAdmin(userId) {
  return db.query(`UPDATE users 
      SET rank='admin' 
      WHERE id=$1`, [userId])
    .then((res) => res.rows[0]);
}

async function _countAccaunts() {
  return db.query(`SELECT COUNT(*) FROM users
  WHERE verificationtoken IS NULL `)
    .then((res) => res.rows[0]);
}

module.exports.forgot = async (ctx) => {
  const user = await _createRecoveryToken(ctx.request.body.email);
  if (!user) {
    ctx.throw(404, 'user not found');
  }

  await _sendRecoveryToken(user.email, user.recoverytoken);

  ctx.status = 200;
  ctx.body = {
    message: `password reset link has been sent to your ${user.email} email address`,
  };
};

module.exports.resetPassword = async (ctx) => {
  const tempPassword = pass.random();
  const user = await _temporaryPassword(ctx.token, tempPassword);
  if (!user) {
    ctx.throw(400, 'invalid recovery token');
  }

  await _sendTemporaryPassword(user.email, tempPassword);

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

async function _setNewPassword(email, password) {
  const salt = await pass.salt();
  const passwordHash = await pass.generate(password, salt);
  return db.query(`UPDATE users
    SET 
      passwordhash=$2,
      salt=$3,
      updatedat=DEFAULT
    WHERE email=$1
    `, [email, passwordHash, salt]);
}

async function _temporaryPassword(recoveryToken, tempPassword) {
  const salt = await pass.salt();
  const passwordHash = await pass.generate(tempPassword, salt);
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

async function _createUser({ email, password, name }) {
  const salt = await pass.salt();
  const passwordHash = await pass.generate(password, salt);
  const verificationToken = config.verification.ignore ? null : uuid();
  return db.query(
    `INSERT INTO users 
      ( 
        email, 
        passwordhash,
        salt,
        verificationtoken,
        name
      )
    VALUES 
      ($1, $2, $3, $4, $5)
    RETURNING *`,
    [email, passwordHash, salt, verificationToken, name],
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
      AND updatedat > NOW() - INTERVAL '${config.verification.ttl}'
      RETURNING *`, [token])
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

async function _sendVerifyToken(to, verificationtoken) {
  return sendMail({
    to,
    subject: 'Подтверждение email',
    template: 'confirmation',
    locals: { host: config.server.domain, token: verificationtoken, path: config.template.confirm },
  });
}

async function _sendRecoveryToken(to, recoverytoken) {
  return sendMail({
    to,
    subject: 'Восстановление пароля',
    template: 'recovery',
    locals: { host: config.server.domain, token: recoverytoken, path: config.template.recovery },
  });
}

async function _sendTemporaryPassword(to, tempPassword) {
  return sendMail({
    to,
    subject: 'Временный пароль',
    template: 'change',
    locals: { host: config.server.domain, password: tempPassword },
  });
}

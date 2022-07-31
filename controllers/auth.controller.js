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
    if (error.code === '23505') { //unique_violation
      ctx.status = 400;
      ctx.body = {
        error: 'email is not unique',
      };
      return;
    }

    if (!error.status) {
      console.log(error);
    }

    ctx.status = error.status || 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.signin = async (ctx) => {
  try {
    await _autenticateUser.call(null, ctx);
    await _delRecoveryToken(ctx.user.id);

    ctx.status = 200;
    ctx.body = mapper(ctx.user);
  } catch (error) {
    if (!error.status) {
      console.log(error);
    }

    ctx.status = error.status || 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.signout = (ctx) => {
  ctx.status = 501;
  ctx.body = {
    message: 'Not implemented',
  };
};

module.exports.confirm = async (ctx) => {
  try {
    const row = await _confirmAccount(ctx.params.token);
    if (!row?.id) {
      ctx.throw(400, 'invalid verification token');
    }

    const user = await _findUser(row.id);
    if (!user) {
      ctx.throw(400, 'invalid verification token');
    }

    ctx.status = 200;
    ctx.body = {
      message: `you have successfully verified your ${user.email} email address`,
    };
  } catch (error) {
    if (!error.status) {
      console.log(error);
    }

    ctx.status = error.status || 500;
    ctx.body = {
      error: error.message,
    };
  }
};

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

async function _sendVerifyToken(user) {
  return sendMail({
    from: config.mailer.user,
    to: user.email,
    subject: 'Подтверждение email',
    html: `Вы зарегестрировались на ${config.server.domain},
    для подтверждения регистрации перейдите по ссылке:<br>
    <a href="http://${config.server.domain}/confirm/${user.verificationtoken}">${config.server.domain}/confirm/${user.verificationtoken}</a>`,
  });
}

async function _confirmAccount(token) {
  return db.query(`UPDATE users 
      SET verificationtoken=NULL 
      WHERE verificationtoken=$1
      RETURNING id`, [token])
    .then((res) => res.rows[0]);
}

async function _findUser(id) {
  return db.query(`SELECT * FROM users WHERE id=$1`, [id])
    .then((res) => res.rows[0]);
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

async function _delRecoveryToken(userId) {
  return db.query(`UPDATE users 
      SET recoverytoken=NULL, updatedat=DEFAULT
      WHERE id=$1
      RETURNING *`, [userId])
    .then((res) => res.rows[0]);
}

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
    if (error.code === '23505') {
      ctx.status = 400;
      ctx.throw(null, 'email is not unique')
    }

    if (!ctx.status) {
      console.log(error);
    }

    ctx.status = ctx.status ? ctx.status : 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.signin = async (ctx, next) => {
  try {
    const user = await _autenticateUser.call(null, ctx)

    ctx.status = 200;
    ctx.body = mapper(ctx.user);
  } catch (error) {
    if (!ctx.status) {
      console.log(error);
    }

    ctx.status = ctx.status ? ctx.status : 500;
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

module.exports.confirm = async ctx => {
  try {
    const user = await _confirmAccount(ctx.params.token)

    if (!user) {
      ctx.status = 400;
      ctx.throw(null, 'invalid verification token')
    }

    ctx.status = 200;
    ctx.body = {
      message: `you have successfully verified your ${user.email} email address`
    }
  } catch (error) {
    if (!ctx.status) {
      console.log(error);
    }

    ctx.status = ctx.status ? ctx.status : 500;
    ctx.body = {
      error: error.message,
    };
  }
}

module.exports.resetRecoveryToken = async ctx => {

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

async function _sendVerifyToken(user) {
  return sendMail({
    from: config.mailer.user,
    to: user.email,
    subject: 'Подтверждение email',
    html: `Вы зарегестрировались на ${config.server.domain},
    для подтверждения регистрации перейдите по ссылке:<br>
    <a href="http://${config.server.domain}/confirm/${user.verificationtoken}">${config.server.domain}/confirm/${user.verificationtoken}</a>`
  })
}

async function _confirmAccount(token) {
  return db.query(`UPDATE users 
      SET verificationtoken=NULL 
      WHERE verificationtoken=$1
      RETURNING *`, [token])
    .then((res) => res.rows[0]);
}

async function _autenticateUser(ctx) {
  await passport.authenticate('local', async (error, user, info) => {

    if (error) {
      ctx.status = 500;
      throw error;
    }

    if (!user) {
      ctx.status = 400;
      ctx.throw(null, info);
    }

    ctx.user = user;
  })(ctx)
}
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

module.exports.signin = async (ctx, next) => {
  try {
    await _autenticateUser.call(null, ctx);
    await _delRecoveryToken(ctx.user.id);
  } catch (error) {
    if (!error.status) {
      console.log(error);
    }

    ctx.status = error.status || 500;
    ctx.body = {
      error: error.message,
    };
    return;
  }
  await next();
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

module.exports.forgot = async (ctx) => {
  try {
    const user = await _createRecoveryToken(ctx.request.body.email);
    await _sendRecoveryToken(user);

    ctx.status = 200;
    ctx.body = {
      message: `password reset link has been sent to your ${user.email} email address`,
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

module.exports.resetPassword = async (ctx) => {
  try {
    const tempPassword = password.random();

    const user = await _temporaryPassword(ctx.params.token, tempPassword);
    if (!user) {
      ctx.throw(400, 'invalid recovery token');
    }

    await _sendTemporaryPassword(user, tempPassword);

    ctx.status = 200;
    ctx.body = {
      message: `you have successfully reset your password. A new login password sent to ${user.email}`,
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
}

async function _temporaryPassword(recoveryToken, tempPassword){
  const salt = await password.salt();
  const passwordHash = await password.generate(tempPassword, salt);
  return db.query(`UPDATE users
    SET 
      passwordhash=$2,
      salt=$3,
      recoverytoken=NULL, 
      updatedat=DEFAULT
    WHERE recoverytoken=$1
    RETURNING *`, [recoveryToken, passwordHash, salt])
    .then(res => res.rows[0]);
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
    .then(res => res.rows[0]);
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

async function _sendRecoveryToken(user) {
  return sendMail({
    from: config.mailer.user,
    to: user.email,
    subject: 'Восстановление пароля',
    html: `Кто-то запросил сброс пароля на ${config.server.domain},
    для подтверждения перейдите по ссылке:<br>
    <a href="http://${config.server.domain}/forgot/${user.recoverytoken}">${config.server.domain}/forgot/${user.recoverytoken}</a>
    <br>Если это не Вы, то проигнорируйте это письмо.`,
  });
}

async function _sendTemporaryPassword(user, tempPassword) {
  return sendMail({
    from: config.mailer.user,
    to: user.email,
    subject: 'Временный пароль',
    html: `Ваш пароль на ${config.server.domain} был изменён.<br>
    Ваш новый пароль: ${tempPassword}<br>
    `,
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
  return db.query('SELECT * FROM users WHERE id=$1', [id])
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
      `, [userId]);
}

const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');

const config = require('../config');
const db = require('../libs/db');
const userMapper = require('../mappers/user.mapper');
const tokenMapper = require('../mappers/token.mapper');

module.exports.start = async (ctx) => {
  const tokens = _generateTokens(userMapper(ctx.user));
  await _checkMaxCountSessions(ctx.user.id);
  await _createSession(ctx.user.id, tokens.refresh);

  ctx.status = 200;
  ctx.body = tokenMapper(tokens);
};

module.exports.refresh = async (ctx) => {
  const session = await _findSession(ctx.token);
  if (!session) {
    ctx.set('WWW-Authenticate', 'Bearer');
    ctx.throw(401, 'invalid token');
  }

  const tokens = _generateTokens(userMapper(session));
  await _refreshSession(session.sid, tokens.refresh);

  ctx.status = 200;
  ctx.body = tokenMapper(tokens);
};

module.exports.destroy = async (ctx) => {
  await _destroySession(ctx.token);

  ctx.status = 200;
  ctx.body = {
    message: 'session destroyed',
  };
};

module.exports.destroyUserSession = async (ctx) => {
  await _destroySessionByEmail(ctx.request.body.email);

  ctx.status = 200;
  ctx.body = {
    message: 'session destroyed',
  };
};

function _generateTokens(user) {
  return {
    refresh: uuid(),
    access: jwt.sign(
      { user },
      config.jwt.secretKey,
      { expiresIn: config.jwt.ttl },
    ),
  };
}

async function _createSession(userId, token) {
  return db.query(`INSERT INTO sessions 
      (id_user, token)  
    VALUES
      ($1, $2)
    `, [userId, token]);
}

async function _refreshSession(sessionId, token) {
  return db.query(`UPDATE sessions
    SET 
      token=$2, 
      lastvisit=DEFAULT
    WHERE id=$1
    `, [sessionId, token]);
}

async function _findSession(token) {
  return db.query(`SELECT S.id as sid, * 
    FROM sessions AS S
    LEFT JOIN users AS U
    ON U.id=S.id_user
    WHERE 
      S.token=$1 
      AND 
      lastvisit > NOW() - INTERVAL '${config.session.ttl}'
  `, [token])
    .then((res) => res.rows[0]);
}

async function _destroySessionByEmail(email) {
  return db.query(`DELETE FROM sessions
      where id_user=(SELECT id FROM users WHERE email=$1 LIMIT 1)
  `, [email]);
}

async function _destroySession(token) {
  return db.query(`DELETE FROM sessions
    WHERE token=$1
  `, [token]);
}

async function _checkMaxCountSessions(userId) {
  const countSession = await db.query(
    'SELECT COUNT(*) FROM sessions WHERE id_user=$1',
    [userId],
  ).then((res) => res.rows[0].count);

  if (+countSession >= config.session.max) {
    await db.query(
      'DELETE FROM sessions WHERE id_user=$1',
      [userId],
    );
  }
}

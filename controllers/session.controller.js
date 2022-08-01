const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');

const config = require('../config');
const db = require('../libs/db');
const userMapper = require('../mappers/user.mapper');
const tokenMapper = require('../mappers/token.mapper');

module.exports.start = async (ctx) => {
  try {
    const tokens = _generateTokens(userMapper(ctx.user));
    await _checkMaxCountSessions(ctx.user.id);
    await _createSession(ctx.user.id, tokens.refresh);

    ctx.status = 201;
    ctx.body = tokenMapper(tokens);
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

module.exports.access = async (ctx) => {
  try {
    const token = ctx.get('Authorization').split(' ')[1];
    jwt.verify(token, config.jwt.secretKey);

    ctx.status = 200;
    ctx.body = jwt.decode(token).user
  } catch (error) {
    ctx.status = 401;
    ctx.set('WWW-Authenticate', 'Bearer');
    ctx.body = {
      error: 'invalid token',
    };
  }
};

module.exports.refresh = async (ctx) => {
  try {
    const refreshToken = ctx.get('Authorization').split(' ')[1];
    const session = await _findSession(refreshToken);
    if(!session){
      throw new Error();
    }

    const tokens = _generateTokens(userMapper(session));
    await _refreshSession(session.sid, tokens.refresh);
    
    ctx.status = 200;
    ctx.body = tokenMapper(tokens);
  } catch (error) {
    ctx.status = 401;
    ctx.set('WWW-Authenticate', 'Bearer');
    ctx.body = {
      error: 'invalid token',
    };
  }
}

module.exports.destroy = async (ctx) => {
  try {
    const refreshToken = ctx.get('Authorization').split(' ')[1];
    await _destroySession(refreshToken);

    ctx.status = 200;
    ctx.body = {
      message: 'session destroyed'
    }
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
  RETURNING *`, [userId, token]);
}

async function _refreshSession(sessionId, token){
  return db.query(`UPDATE sessions
    SET token=$2, lastvisit=DEFAULT
    WHERE id=$1`, [sessionId, token]);
}

async function _findSession(token){
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
  ;
}

async function _destroySession(token){
  return db.query(`DELETE FROM sessions
    WHERE token=$1
  `, [token]);
  ;
}

async function _checkMaxCountSessions(userId) {
  const countSession = await db.query(
    `SELECT COUNT(*) FROM sessions WHERE id_user=$1`,
    [userId],
  ).then((res) => res.rows[0].count);

  if (+countSession >= config.session.max) {
    await db.query(
      `DELETE FROM sessions WHERE id_user=$1`,
      [userId],
    ).then((res) => res.rows[0]);
  }
}

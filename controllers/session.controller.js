const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');

const config = require('../config');
const db = require('../libs/db');

module.exports.start = async (ctx) => {
  try {
    const tokens = _generateTokens();
    await _checkMaxCountSessions(ctx.user.id);
    await _createSession(ctx.user.id, tokens.refresh);

    ctx.status = 201;
    ctx.body = tokens;
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
    const decoded = jwt.verify(token, config.jwt.secretKey);
    console.log(decoded);

    ctx.status = 200;
    ctx.body = {};
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

async function _checkMaxCountSessions(userId) {
  const countSession = await db.query(
    `SELECT COUNT(*) 
  FROM sessions
  WHERE id_user=$1`,
    [userId],
  ).then((res) => res.rows[0].count);

  if (+countSession > config.session.max) {
    await db.query(
      `DELETE FROM sessions
    WHERE id_user=$1`,
      [userId],
    ).then((res) => res.rows[0]);
  }
}

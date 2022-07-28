const { v4: uuid } = require('uuid');

const db = require('../libs/db');

module.exports.signup = async (ctx) => {
  try {
    const token = uuid();

    const foo = await _createUser();

    ctx.status = 201;
    ctx.body = {
      rows: foo.rows,
    };
  } catch (error) {
    console.log(error);
    ctx.status = 500;
    ctx.body = {
      error: error.message,
    };
  }
};

module.exports.signin = (ctx) => {
  ctx.status = 501;
  ctx.body = {
    message: 'Not implemented',
  };
};

module.exports.signout = (ctx) => {
  ctx.status = 501;
  ctx.body = {
    message: 'Not implemented',
  };
};

async function _createUser() {
  return db.query(`
   SELECT NOW()
  `);
}

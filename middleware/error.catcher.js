const logger = require('../libs/logger');

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    if (error.status) {
      ctx.status = error.status;
      ctx.body = {
        error: error.message,
      };
      return;
    }

    if (error.code) { // errors PostgreSQL
      ctx.status = 400;
      if (error.code === '23505') { // unique_violation
        ctx.body = {
          error: 'email is not unique',
        };
        return;
      }
    }

    logger.error(error.message);

    ctx.status = 500;
    ctx.body = {
      error: 'internal server error',
    };
  }
};

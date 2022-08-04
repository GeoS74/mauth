const log4js = require('log4js');
const path = require('path');

const config = require('../config');

log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: {
      type: 'file',
      filename: path.join(__dirname, `../log/${config.log.file}`),
    },
  },
  categories: {
    default: {
      appenders: ['out', 'app'],
      level: 'all',
    },
  },
});

const logger = log4js.getLogger();

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

    logger.error(error.message);
    ctx.status = 500;
    ctx.body = {
      error: 'internal server error',
    };
  }
};

const bunyan = require('bunyan');
const path = require('path');

const logger = bunyan.createLogger({
  name: 'logger',
  streams: [{
    path: path.join(__dirname, '../log/mauth.log'),
  }, {
    stream: process.stdout,
  }],
  // src: true,
});

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

    logger.info(error);
    ctx.status = 500;
    ctx.body = {
      error: 'internal server error',
    };
  }
};

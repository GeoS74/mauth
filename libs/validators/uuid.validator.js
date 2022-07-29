const { validate: uuidValidate } = require('uuid');

module.exports = async (ctx, next) => {
  try {
    if (!uuidValidate(ctx.params.id)) {
      ctx.throw(404, 'user not found');
    }
    await next();
  } catch (error) {
    ctx.status = error.status;
    ctx.body = {
      error: error.message,
    };
  }
};

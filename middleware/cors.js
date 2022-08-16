module.exports = async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:3000')
  await next();
}

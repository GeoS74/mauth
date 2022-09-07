const Koa = require('koa');

const authRoutes = require('./routes/auth.routes');
const errorInterceptor = require('./middleware/error.interceptor');

const app = new Koa();

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', 'http://localhost:3000')
  await next();
})
app.use(errorInterceptor);
app.use(authRoutes);

module.exports = app;

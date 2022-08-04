const Koa = require('koa');

const authRoutes = require('./routes/auth.routes');
const errorInterceptor = require('./middleware/error.interceptor');

const app = new Koa();

app.use(errorInterceptor);
app.use(authRoutes);

module.exports = app;

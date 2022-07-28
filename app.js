const Koa = require('koa');
const authRoutes = require('./routes/auth.routes');

const app = new Koa();

app.use(authRoutes);

module.exports = app;

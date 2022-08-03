const Koa = require('koa');

const authRoutes = require('./routes/auth.routes');
const logger = require('./libs/logger');

const app = new Koa();

app.use(logger);
app.use(authRoutes);

module.exports = app;

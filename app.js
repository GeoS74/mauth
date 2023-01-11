const Koa = require('koa');

const errorCatcher = require('./middleware/error.catcher');
const authRoutes = require('./routes/auth.routes');

const app = new Koa();

app.use(errorCatcher);
app.use(authRoutes);

module.exports = app;

const Koa = require('koa');
const cors = require('@koa/cors')

const config = require('./config');
const errorCatcher = require('./middleware/error.catcher');
const authRoutes = require('./routes/auth.routes');

const app = new Koa();

app.use(errorCatcher);
if (config.node.env === 'dev') {
  app.use(cors());
}
app.use(authRoutes);

module.exports = app;

const config = require('./config');
const app = require('./app');

app.listen(config.server.port, (error) => {
  if (error) {
    console.log(error.message);
    return;
  }
  console.log(`server run http://${config.server.host}:${config.server.port}`);
});

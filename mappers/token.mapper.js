const config = require('../config');

module.exports = (data) => ({
  access: data.access,
  type: 'Bearer',
  expires: config.jwt.ttl,
  refresh: data.refresh,
});

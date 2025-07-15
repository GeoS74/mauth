const { Pool } = require('pg');

const config = require('../config');
const logger = require('./logger');
const pass = require('./password');

const data = {
  user: config.postgres.user,
  host: config.postgres.host,
  database: config.postgres.database,
  password: config.postgres.password,
  port: config.postgres.port,
};

(async () => {
  const pool = new Pool(data);
  const email = process.argv[2];
  const defaultPass = 'admin';
  const salt = await pass.salt();
  const passwordHash = await pass.generate(defaultPass, salt);
  const verificationToken = null;

  await pool.query('SELECT id FROM users WHERE rank=\'admin\'')
    .then((result) => {
      if (result.rows.length > 0) throw new Error('admin has been created');
    })
    .catch((error) => {
      logger.warn(error.message);
      process.exit(0);
    });

  await pool.query(
    `INSERT INTO users 
      ( 
        email, 
        passwordhash,
        salt,
        verificationtoken,
        rank
      )
    VALUES 
      ($1, $2, $3, $4, $5)`,
    [email, passwordHash, salt, verificationToken, 'admin'],
  )
    .then(() => logger.info(`create default user in "${config.postgres.database}"`))
    .catch((error) => logger.warn(error.message))
    .finally(() => process.exit(0));
})();

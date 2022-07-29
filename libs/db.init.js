const { Pool } = require('pg');

const config = require('../config');

const data = {
  user: config.postgres.user,
  host: config.postgres.host,
  database: '',
  password: config.postgres.password,
  port: config.postgres.port,
};

(async () => {
  let pool = new Pool(data);

  await pool.query(`CREATE DATABASE ${config.postgres.database}`)
    .then(() => console.log(`database "${config.postgres.database}" create`))
    .catch((error) => console.log(error.message));

  // connect new database
  data.database = config.postgres.database;
  pool = new Pool(data);

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      passwordHash text NOT NULL,
      salt text NOT NULL,
      rank text NOT NULL DEFAULT 'user',
      verificationToken text NULL,
      recoveryToken text NULL,
      name text NULL,
      createdAt TIMESTAMP DEFAULT NOW(),
      updatedAt TIMESTAMP DEFAULT NOW()
    );
  `)
    .then(() => console.log('table "users" create'))
    .catch((error) => console.log(error.message));

  console.log('...ok...');
  process.exit();
})();

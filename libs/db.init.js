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
      passwordhash text NOT NULL,
      salt text NOT NULL,
      rank text NOT NULL DEFAULT 'user',
      verificationtoken text NULL,
      recoverytoken text NULL,
      name text NULL,
      createdat timestamp DEFAULT NOW(),
      updatedat timestamp DEFAULT NOW()
    );
  `)
    .then(() => console.log('table "users" create'))
    .catch((error) => console.log(error.message));


  await pool.query(`
    CREATE OR REPLACE FUNCTION expire_del_old_rows() RETURNS trigger
      LANGUAGE plpgsql
      AS $$
    BEGIN
      DELETE FROM users WHERE updatedat < NOW() - INTERVAL '30 minute';
      RETURN NEW;
    END;
    $$;

    CREATE OR REPLACE TRIGGER expire_del_old_rows_trigger
      AFTER UPDATE OF verificationtoken ON users
      EXECUTE PROCEDURE expire_del_old_rows();
  `)
    .then(() => console.log('function "expire_del_old_rows()" create'))
    .catch((error) => console.log(error.message));
  console.log('...ok...');
  process.exit();
})();

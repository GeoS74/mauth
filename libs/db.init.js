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
    .then(() => console.log(`create database "${config.postgres.database}"`))
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
    .then(() => console.log('create table "users"'))
    .catch((error) => console.log(error.message));

  await pool.query(`
    CREATE OR REPLACE FUNCTION expire_del_old_rows() RETURNS trigger
      LANGUAGE plpgsql
      AS $$
    BEGIN
      DELETE FROM users 
        WHERE 
          verificationtoken IS NULL
          AND
          updatedat < NOW() - INTERVAL '${config.verification.ttl}';
      RETURN NEW;
    END;
    $$;

    CREATE OR REPLACE TRIGGER expire_del_old_rows_trigger
      AFTER INSERT OR UPDATE OF verificationtoken ON users
      EXECUTE PROCEDURE expire_del_old_rows();
  `)
    .then(() => console.log('create trigger "expire_del_old_rows_trigger"'))
    .catch((error) => console.log(error.message));

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE TABLE sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_user uuid NOT NULL,
      token text NOT NULL,
      lastvisit timestamp DEFAULT NOW()
    );
  `)
    .then(() => console.log('create table "sessions"'))
    .catch((error) => console.log(error.message));

  await pool.query(`
    CREATE OR REPLACE FUNCTION expire_del_old_sessions() RETURNS trigger
      LANGUAGE plpgsql
      AS $$
    BEGIN
      DELETE FROM sessions WHERE lastvisit < NOW() - INTERVAL '${config.session.ttl}';
      RETURN NEW;
    END;
    $$;

    CREATE OR REPLACE TRIGGER expire_del_old_sessions_trigger
      AFTER INSERT OR UPDATE ON sessions
      EXECUTE PROCEDURE expire_del_old_sessions();
  `)
    .then(() => console.log('create trigger "expire_del_old_sessions_trigger"'))
    .catch((error) => console.log(error.message));

  console.log('database init complete');
  process.exit();
})();

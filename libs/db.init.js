const { Pool } = require('pg');

const config = require('../config');
const logger = require('./logger')('init');

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
    .then(() => logger.info(`create database "${config.postgres.database}"`))
    .catch((error) => logger.warn(error.message));

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
    .then(() => logger.info('create table "users"'))
    .catch((error) => logger.warn(error.message));

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
    .then(() => logger.info('create trigger "expire_del_old_rows_trigger"'))
    .catch((error) => logger.warn(error.message));

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE TABLE sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      id_user uuid NOT NULL,
      token text NOT NULL,
      lastvisit timestamp DEFAULT NOW()
    );
  `)
    .then(() => logger.info('create table "sessions"'))
    .catch((error) => logger.warn(error.message));

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
    .then(() => logger.info('create trigger "expire_del_old_sessions_trigger"'))
    .catch((error) => logger.warn(error.message));

  logger.info('database init complete');
  process.exit();
})();

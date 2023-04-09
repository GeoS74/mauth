#!/bin/bash

psql -U ${POSTGRES_USER} <<-END
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
CREATE OR REPLACE FUNCTION expire_del_old_rows() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    DELETE FROM users 
      WHERE 
        verificationtoken IS NOT NULL
        AND
        updatedat < NOW() - INTERVAL ${VERIFICATION_TTL};
    RETURN NEW;
  END;
  $$;
CREATE OR REPLACE TRIGGER expire_del_old_rows_trigger
  AFTER INSERT OR UPDATE OF verificationtoken ON users
  EXECUTE PROCEDURE expire_del_old_rows();
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user uuid NOT NULL,
  token text NOT NULL,
  lastvisit timestamp DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION expire_del_old_sessions() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    DELETE FROM sessions WHERE lastvisit < NOW() - INTERVAL ${SESSION_TTL};
    RETURN NEW;
  END;
  $$;
CREATE OR REPLACE TRIGGER expire_del_old_sessions_trigger
  AFTER INSERT OR UPDATE ON sessions
  EXECUTE PROCEDURE expire_del_old_sessions();
END

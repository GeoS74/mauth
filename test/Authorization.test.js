const { expect } = require('chai');
const fetch = require('node-fetch');
const { validate: uuidValidate } = require('uuid');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './secret.env' });

const config = require('../config');

if (config.node.env !== 'dev') {
  console.log('Error: нельзя запускать тесты в производственной среде, это может привести к потере данных');
  process.exit();
}

const app = require('../app');
const db = require('../libs/db');

describe('/test/Authorization.test.js', () => {
  let _server;

  before(async () => {
    _server = app.listen(config.server.port);
  });

  after(async () => {
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM sessions');
    _server.close();
  });

  describe('sign -in -up -out', () => {
    const user = {
      email: 't@e.st',
      password: '12345',
    };
    const optional = {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({}),
    };

    it('signup with verification', async function test() {
      this.timeout(10000);

      await db.query('DELETE FROM users');
      config.verification.ignore = false;

      let response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 'w' });
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 't@e.st' });
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify(user);
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 201);
      expectSignupMessage.call(this, response.data);
      expect(response.data.rank, 'первый user до потверждения должен быть user').to.be.equal('user');

      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      const token = await db.query('SELECT verificationtoken FROM users WHERE email=$1', [user.email])
        .then((res) => {
          if (!res?.rows.length) {
            throw new Error('сервер создаёт пользователя');
          }
          return res.rows[0].verificationtoken;
        });
      expect(uuidValidate(token), 'verificationtoken должен быть валидным uuid')
        .equal(true);

      await fetch(`http://localhost:${config.server.port}/api/mauth/confirm/${token}`);

      const rank = await db.query(`
        SELECT rank FROM users WHERE email=$1`, [user.email])
        .then((res) => res.rows[0].rank);
      expect(rank, 'первый user после потверждения долджен стать admin').to.be.equal('admin');
    });

    it('signup without verification', async function test() {
      this.timeout(10000);

      optional.body = JSON.stringify({});

      await db.query('DELETE FROM users');
      config.verification.ignore = true;

      let response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 'w' });
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 't@e.st' });
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify(user);
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 201);
      expectSignupMessage.call(this, response.data);
      expect(response.data.rank, 'первый user должен быть admin').to.be.equal('admin');

      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      config.verification.ignore = false;
    });

    it('signin', async () => {
      await db.query('DELETE FROM users');
      optional.body = JSON.stringify(user);
      await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional);

      optional.body = JSON.stringify({});
      let response = await fetch(`http://localhost:${config.server.port}/api/mauth/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 'w' });
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 't@e.st' });
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify(user);
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      // confirm test email
      await db.query('UPDATE users SET verificationtoken=NULL WHERE email=$1', [user.email]);

      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expectSigninMessage.call(this, response.data);

      const token = await db.query(`SELECT token 
        FROM users U
        LEFT JOIN sessions S
        ON U.id=S.id_user
        WHERE U.email=$1`, [user.email]).then((res) => res.rows[0].token);
      expect(uuidValidate(token), 'token сессии должен быть валидным uuid')
        .equal(true);
    });

    it('signout', async () => {
      const token = await db.query(`SELECT token 
      FROM users U
      LEFT JOIN sessions S
      ON U.id=S.id_user
      WHERE U.email=$1`, [user.email]).then((res) => res.rows[0].token);

      optional.method = 'DELETE';
      let response = await fetch(`http://localhost:${config.server.port}/api/mauth/signout`, optional)
        .then(result);
      expectStatus.call(this, response.status, 401);
      expectErrorMessage.call(this, response.data);

      optional.headers.Authorization = 'Bearer 123';

      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signout`, optional)
        .then(result);
      expectStatus.call(this, response.status, 401);
      expectErrorMessage.call(this, response.data);

      optional.headers.Authorization = `Bearer ${token}`;
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signout`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expect(response.data, 'сервер возвращает объект')
        .that.is.an('object')
        .to.have.property('message');

      const sessionCount = await db.query(`SELECT * FROM sessions
      WHERE token=$1`, [token]).then((res) => res.rows.length);
      expect(sessionCount, 'signup удаляет сессию').equal(0);
    });

    it('confirm', async function test() {
      this.timeout(10000);

      await db.query('DELETE FROM users');
      optional.method = 'POST';
      optional.body = JSON.stringify(user);
      let response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional);

      const verificationToken = await db.query(`
        SELECT verificationtoken FROM users WHERE email=$1`, [user.email])
        .then((res) => res.rows[0].verificationtoken);

      optional.method = 'GET';
      optional.body = null;
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/confirm/123`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/api/mauth/confirm/${verificationToken}`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expectInfoMessage.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/api/mauth/confirm/${verificationToken}`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      const token = await db.query('SELECT verificationtoken FROM users WHERE email=$1', [user.email])
        .then((res) => res.rows[0].verificationtoken);
      expect(token, 'verificationtoken должен удалятся при подтверждении email')
        .equal(null);
    });

    it('access', async () => {
      optional.method = 'POST';
      optional.body = JSON.stringify(user);
      const accessToken = await fetch(`http://localhost:${config.server.port}/api/mauth/signin`, optional)
        .then(async (res) => await res.json())
        .then((res) => res.access);

      optional.method = 'GET';
      optional.body = null;
      let response = await fetch(`http://localhost:${config.server.port}/api/mauth/access`, optional)
        .then(result);
      expectStatus.call(this, response.status, 401);
      expectErrorMessage.call(this, response.data);

      optional.headers.Authorization = `Bearer ${accessToken}`;

      response = await fetch(`http://localhost:${config.server.port}/api/mauth/access`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expectSignupMessage.call(this, response.data);
    });

    it('refresh', async () => {
      optional.method = 'POST';
      optional.body = JSON.stringify(user);
      const tokens = await fetch(`http://localhost:${config.server.port}/api/mauth/signin`, optional)
        .then(async (res) => await res.json());

      optional.method = 'GET';
      optional.body = null;
      optional.headers.Authorization = `Bearer ${tokens.access}`;
      let response = await fetch(`http://localhost:${config.server.port}/api/mauth/refresh`, optional)
        .then(result);
      expectStatus.call(this, response.status, 401);
      expectErrorMessage.call(this, response.data);

      optional.headers.Authorization = `Bearer ${tokens.refresh}`;
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/refresh`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expectSigninMessage.call(this, response.data);
      expect(response.data.access, 'сервер обновляет access токен').not.equal(tokens.access);
      expect(response.data.refresh, 'сервер обновляет refresh токен').not.equal(tokens.refresh);
    });

    it('change password', async function test() {
      optional.method = 'POST';
      optional.body = JSON.stringify(user);
      const tokens = await fetch(`http://localhost:${config.server.port}/api/mauth/signin`, optional)
        .then(async (res) => await res.json());

      optional.method = 'PATCH';
      optional.headers.Authorization = 'Bearer 123';
      user.password = '54321';
      optional.body = JSON.stringify(user);

      let response = await fetch(`http://localhost:${config.server.port}/api/mauth/password`, optional)
        .then(result);
      expectStatus.call(this, response.status, 401);
      expectErrorMessage.call(this, response.data);

      optional.headers.Authorization = `Bearer ${tokens.access}`;
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/password`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expectInfoMessage.call(this, response.data);

      optional.method = 'POST';
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expectSigninMessage.call(this, response.data);
    });

    it('forgot', async function test() {
      this.timeout(10000);

      optional.method = 'PATCH';
      optional.body = JSON.stringify({});

      let response = await fetch(`http://localhost:${config.server.port}/api/mauth/forgot`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 'w' });
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/forgot`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify(user);

      response = await fetch(`http://localhost:${config.server.port}/api/mauth/forgot`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expectInfoMessage.call(this, response.data);

      let token = await db.query('SELECT recoverytoken FROM users WHERE email=$1', [user.email])
        .then((res) => res.rows[0].recoverytoken);
      expect(uuidValidate(token), 'recoverytoken должен быть валидным uuid')
        .equal(true);

      optional.method = 'GET';
      optional.body = null;
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/forgot/123`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/api/mauth/forgot/${token}`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expectInfoMessage.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/api/mauth/forgot/${token}`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      token = await db.query('SELECT recoverytoken FROM users WHERE email=$1', [user.email])
        .then((res) => res.rows[0].recoverytoken);
      expect(token, 'сервер удаляет ключ recoverytoken')
        .equal(null);
    });

    it('verification ttl', async function test() {
      this.timeout(10000);

      // установить время верификации в 1 секунду
      const currentVerificationTtl = config.verification.ttl;
      config.verification.ttl = '1 second';
      await db.query(`
        CREATE OR REPLACE FUNCTION expire_del_old_rows_test() RETURNS trigger
          LANGUAGE plpgsql
          AS $$
        BEGIN
          DELETE FROM users 
            WHERE 
              verificationtoken IS NOT NULL
              AND
              updatedat < NOW() - INTERVAL '${config.verification.ttl}';
          RETURN NEW;
        END;
        $$;
      `);

      await db.query('DELETE FROM users');
      optional.method = 'POST';
      optional.body = JSON.stringify(user);
      let response = await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional);

      let verificationToken = await db.query(`
        SELECT verificationtoken FROM users WHERE email=$1`, [user.email])
        .then((res) => res.rows[0].verificationtoken);

      await new Promise((res) => setTimeout(() => res(), 2000));

      optional.method = 'GET';
      optional.body = null;
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/confirm/${verificationToken}`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      // установить прежнее значение конфига
      config.verification.ttl = currentVerificationTtl;
      await db.query(`
        CREATE OR REPLACE FUNCTION expire_del_old_rows_test() RETURNS trigger
          LANGUAGE plpgsql
          AS $$
        BEGIN
          DELETE FROM users 
            WHERE 
              verificationtoken IS NOT NULL
              AND
              updatedat < NOW() - INTERVAL '${config.verification.ttl}';
          RETURN NEW;
        END;
        $$;
      `);

      await db.query('DELETE FROM users');
      optional.method = 'POST';
      optional.body = JSON.stringify(user);
      await fetch(`http://localhost:${config.server.port}/api/mauth/signup`, optional);

      verificationToken = await db.query(`
        SELECT verificationtoken FROM users WHERE email=$1`, [user.email])
        .then((res) => res.rows[0].verificationtoken);

      await new Promise((res) => setTimeout(() => res(), 2000));

      optional.method = 'GET';
      optional.body = null;
      response = await fetch(`http://localhost:${config.server.port}/api/mauth/confirm/${verificationToken}`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expectInfoMessage.call(this, response.data);
    });
  });
});

async function result(response) {
  return {
    status: response.status,
    data: await response.json(),
  };
}

function expectStatus(resStatus, status) {
  expect(resStatus, `сервер возвращает статус ${status}`).to.be.equal(status);
}

function expectErrorMessage(data) {
  expect(data, 'сервер возвращает описание ошибки')
    .that.is.an('object')
    .to.have.property('error');
}

function expectInfoMessage(data) {
  expect(data, 'сервер возвращает сообщение об успешном выполнении')
    .that.is.an('object')
    .to.have.property('message');
}

function expectSignupMessage(data) {
  expect(data, 'сервер возвращает данные пользователя')
    .that.is.an('object')
    .to.have.keys(['email', 'rank', 'name', 'createdAt', 'updatedAt']);
}

function expectSigninMessage(data) {
  expect(data, 'сервер возвращает токены доступа')
    .that.is.an('object')
    .to.have.keys(['access', 'type', 'expires', 'refresh']);
  expect(data.type, 'type должен быть Bearer').equal('Bearer');
  expect(data.expires, 'type должен быть числом').that.is.an('number');
  expect(uuidValidate(data.refresh), 'refresh токен должен быть валидным uuid')
    .equal(true);
  try {
    expect(jwt.verify(data.access, config.jwt.secretKey), 'access токен должен быть валидным jwt')
      .that.is.an('object');
  } catch (error) {
    throw new Error('access токен должен быть валидным jwt');
  }
}

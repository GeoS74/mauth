const { expect } = require('chai');
const fetch = require('node-fetch');
const { validate: uuidValidate } = require('uuid');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './secret.env' });

if (process.env.NODE_ENV !== 'develop') {
  console.log('Error: нельзя запускать тесты в производственной среде, это может привести к потере данных');
  process.exit();
}

const config = require('../config');
const app = require('../app');
const db = require('../libs/db');

describe('/test/Authorization.test.js', () => {
  let _server;

  before(async () => {
    _server = app.listen(config.server.port);
  });

  after(async () => {
    await db.query(`DELETE FROM users`)
    await db.query(`DELETE FROM sessions`)
    _server.close();
  });

  describe('sign -in -up -out', () => {
    const user = {
      email: 't@e.st',
      password: '12345',
    };
    const optional = {
      headers: { 'Content-Type': 'application/json', },
      method: 'POST',
      body: JSON.stringify({}),
    };


    it('signup', async () => {
      let response = await fetch(`http://localhost:${config.server.port}/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 'w' });
      response = await fetch(`http://localhost:${config.server.port}/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 't@e.st' });
      response = await fetch(`http://localhost:${config.server.port}/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify(user);
      response = await fetch(`http://localhost:${config.server.port}/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 201);
      expectSignupMessage.call(this, response.data);

      response = await fetch(`http://localhost:${config.server.port}/signup`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      const token = await db.query(`SELECT verificationtoken FROM users WHERE email=$1`, [user.email])
        .then(res => {
          if (!res?.rows.length) {
            throw new Error('сервер создаёт пользователя')
          }
          return res.rows[0].verificationtoken;
        });
      expect(uuidValidate(token), 'verificationtoken должен быть валидным uuid')
        .equal(true);
    });



    it('signin', async () => {
      optional.body = JSON.stringify({});
      let response = await fetch(`http://localhost:${config.server.port}/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 'w' });
      response = await fetch(`http://localhost:${config.server.port}/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify({ email: 't@e.st' });
      response = await fetch(`http://localhost:${config.server.port}/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      optional.body = JSON.stringify(user);
      response = await fetch(`http://localhost:${config.server.port}/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 400);
      expectErrorMessage.call(this, response.data);

      //confirm test email
      await db.query(`UPDATE users SET verificationtoken=NULL WHERE email=$1`, [user.email])

      response = await fetch(`http://localhost:${config.server.port}/signin`, optional)
        .then(result);
      expectStatus.call(this, response.status, 201);
      expectSigninMessage.call(this, response.data);

      const token = await db.query(`SELECT token 
        FROM users U
        LEFT JOIN sessions S
        ON U.id=S.id_user
        WHERE U.email=$1`, [user.email]).then(res => res.rows[0].token);
      expect(uuidValidate(token), 'token сессии должен быть валидным uuid')
        .equal(true);
    });

    it('signout', async () => {
      const token = await db.query(`SELECT token 
      FROM users U
      LEFT JOIN sessions S
      ON U.id=S.id_user
      WHERE U.email=$1`, [user.email]).then(res => res.rows[0].token);

      optional.method = 'DELETE';
      let response = await fetch(`http://localhost:${config.server.port}/signout`, optional)
        .then(result);
      expectStatus.call(this, response.status, 401);
      expectErrorMessage.call(this, response.data);

      optional.headers.Authorization = `Bearer 123`;

      response = await fetch(`http://localhost:${config.server.port}/signout`, optional)
        .then(result);
      expectStatus.call(this, response.status, 401);
      expectErrorMessage.call(this, response.data);

      optional.headers.Authorization = `Bearer ${token}`;
      response = await fetch(`http://localhost:${config.server.port}/signout`, optional)
        .then(result);
      expectStatus.call(this, response.status, 200);
      expect(response.data, 'сервер возвращает объект')
        .that.is.an('object')
        .to.have.property('message');

      const sessionCount = await db.query(`SELECT * FROM sessions
      WHERE token=$1`, [token]).then(res => res.rows.length);
      expect(sessionCount, 'signup удаляет сессию').equal(0);
    });


  })

});





async function result(response) {
  return {
    status: response.status,
    data: await response.json(),
  }
}

function expectStatus(resStatus, status) {
  expect(resStatus, `сервер возвращает статус ${status}`).to.be.equal(status);
}

function expectErrorMessage(data) {
  expect(data, 'сервер возвращает описание ошибки')
    .that.is.an('object')
    .to.have.property('error');
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
    throw new Error('access токен должен быть валидным jwt')
  }
}
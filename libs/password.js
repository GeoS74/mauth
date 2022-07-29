const crypto = require('crypto');

const config = require('../config');

module.exports.generate = async (password, salt) => {
  salt = salt || await this.salt();
  const pass = await _generatePassword(password, salt);
  return pass;
};

module.exports.check = async (user, password) => {
  if (!password) {
    return false;
  }

  const hash = await this.generate(password, user.salt);
  return hash === user.passwordhash;
};

module.exports.salt = async () => new Promise((resolve, reject) => {
  crypto.randomBytes(
    config.crypto.length,
    (error, buffer) => {
      if (error) {
        reject(error.message);
      }
      resolve(buffer.toString('hex'));
    },
  );
});

function _generatePassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      config.crypto.iterations,
      config.crypto.length,
      config.crypto.digest,
      (error, buffer) => {
        if (error) {
          reject(error.message);
        }
        resolve(buffer.toString('hex'));
      },
    );
  });
}

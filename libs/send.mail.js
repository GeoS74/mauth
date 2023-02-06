const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');

const config = require('../config');

const transport = nodemailer.createTransport({
  host: config.mailer.host,
  port: config.mailer.port,
  secure: config.mailer.secure,
  ignoreTLS: config.mailer.ignoreTLS,
  auth: {
    user: config.mailer.user,
    pass: config.mailer.pass,
  },
});

const foo = {
  host: config.mailer.host,
  port: config.mailer.port,
  secure: config.mailer.secure,
  ignoreTLS: config.mailer.ignoreTLS,
  auth: {
    user: config.mailer.user,
    pass: config.mailer.pass,
  },
}
console.log(foo)

module.exports = async (options) => {
  const html = pug.renderFile(
    `${path.join(__dirname, '../templates', options.template)}.pug`,
    options.locals || {},
  );

  return transport.sendMail({
    from: config.mailer.user,
    to: options.to,
    subject: options.subject,
    html,
  });
};

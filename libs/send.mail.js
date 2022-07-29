const nodemailer = require('nodemailer');

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

module.exports = async mail => {
  return transport.sendMail({
    from: mail.from,
    to: mail.to,
    subject: mail.subject,
    text: mail.text || '',
    html: mail.html || '',
  })
}
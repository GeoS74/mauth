require('dotenv').config({ path: './secret.env' });

module.exports = {
  node: {
    env: process.env.NODE_ENV || 'dev',
  },
  server: {
    host: process.env.SERVER_HOST || 'localhost',
    port: process.env.SERVER_PORT || 3001,
    domain: process.env.SERVER_DOMAIN || 'localhost:3001',
  },
  postgres: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'mauth',
    password: process.env.DB_PASS || 'admin',
    port: process.env.DB_PORT || 5432,
  },
  crypto: {
    iterations: (process.env.NODE_ENV === 'dev' ? 1 : 12000),
    length: 128,
    digest: 'sha512',
  },
  mailer: {
    host: process.env.MAIL_HOST || 'smtp.ethereal.email',
    port: +process.env.MAIL_PORT || 587,
    user: process.env.MAIL_USER || 'calista.ledner89@ethereal.email',
    pass: process.env.MAIL_PASS || 'K3peFMtyuEXehgba8r',
    secure: (process.env.MAIL_SECURE === 'true') || !(process.env.MAIL_SECURE === 'false') || false, // true for 465, false for other ports
    ignoreTLS: (process.env.IGNORE_TLS === 'true') || !(process.env.IGNORE_TLS === 'false') || false, // default true
  },
  jwt: {
    ttl: +process.env.JWT_TTL || 1800,
    secretKey: process.env.JWT_SECRET_KEY || 'any secret phrase',
  },
  session: {
    max: 5,
    ttl: process.env.SESSION_TTL || '30 day',
  },
  verification: {
    ttl: process.env.VERIFICATION_TTL || '10 minute',
  },
  log: {
    file: 'app.log',
  },
};

require('dotenv').config({ path: './secret.env' });

module.exports = {
  node: {
    env: process.env.NODE_ENV || 'dev',
  },
  server: {
    host: process.env.SERVER_HOST || 'localhost',
    port: process.env.SERVER_PORT || 3001,
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
    port: process.env.MAIL_PORT || 587,
    user: process.env.MAIL_USER || 'rusty.rolfson44@ethereal.email',
    pass: process.env.MAIL_PASS || 'n6nKgTFPEQ86p5xwTw',
    // docker compose не передаёт булево значение, взамен передаётся строка 'false' или 'true',
    secure: (process.env.MAIL_SECURE === 'true') || false, // true for 465, false for other ports
    ignoreTLS: (process.env.IGNORE_TLS === 'true') || false, // default true
  },
  template: {
    protocol: process.env.TPL_PROTOCOL || 'http',
    domain: process.env.TPL_DOMAIN || 'localhost:3001',
    path: {
      confirm: process.env.TPL_CONFIRM_PATH || '/api/mauth/confirm',
      recovery: process.env.TPL_RECOVERY_PATH || '/api/mauth/forgot',
    },
  },
  jwt: {
    ttl: +process.env.JWT_TTL || 1800,
    secretKey: process.env.JWT_SECRET_KEY || 'any_secret',
  },
  session: {
    max: 5,
    ttl: process.env.SESSION_TTL || '30 day',
  },
  verification: {
    ignore: process.env.VERIFICATION_IGNORE === 'true',
    ttl: process.env.VERIFICATION_TTL || '10 minute',
  },
  log: {
    file: 'app.log',
  },
};

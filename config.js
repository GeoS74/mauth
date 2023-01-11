require('dotenv').config({ path: './secret.env' });

module.exports = {
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
    iterations: (process.env.NODE_ENV === 'develop' ? 1 : 12000),
    length: 128,
    digest: 'sha512',
  },
  mailer: {
    host: process.env.MAILER_HOST || 'smtp.ethereal.email',
    port: process.env.MAILER_PORT || 587,
    user: process.env.MAILER_USER || 'mikel89@ethereal.email',
    pass: process.env.MAILER_PASS || 'E732fJnKjshE8RecwQ',
    // secure: false,
    // ignoreTLS: true,
  },
  jwt: {
    ttl: 1800,
    secretKey: process.env.JWT_SECRET_KEY || 'any secret phrase',
  },
  session: {
    max: 5,
    ttl: '30 day',
  },
  verification: {
    ttl: '10 minute',
  },
  log: {
    file: 'app.log',
  },
};

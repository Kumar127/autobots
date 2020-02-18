const path = require('path');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../.env'),
  sample: path.join(__dirname, '../.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_DAYS,
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  dbHost: process.env.DB_HOST,
  dbUserName: process.env.DB_USER,
  dbPassWord: process.env.DB_PASS,
  dbName: process.env.DB_DATABASE,
};

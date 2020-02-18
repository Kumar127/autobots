const mysql = require('mysql');
const envVar = require('../vars');

const connection = mysql.createPool({
  host: envVar.dbHost,
  user: envVar.dbUserName,
  password: envVar.dbPassWord,
  database: envVar.dbName,
});

module.exports = connection;

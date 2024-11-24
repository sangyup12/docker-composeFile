var mysql = require("mysql2");

var db = mysql.createConnection({
  host: mysql,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

db.connect();
module.exports = db;

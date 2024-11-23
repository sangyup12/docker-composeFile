var mysql = require("mysql2");

var db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "webdb2024",
  multipleStatements: true,
});

db.connect();
module.exports = db;

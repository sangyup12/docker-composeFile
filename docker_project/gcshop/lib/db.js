var mysql = require("mysql2");

var db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});
async function testDBConnection() {
  try {
    const connection = await mysql.createConnection({
      host: options.host,
      user: options.user,
      password: options.password,
      database: options.database,
    });
    console.log("MySQL connection successful.");
    await connection.end();
  } catch (err) {
    console.error("MySQL connection failed:", err);
  }
}
testDBConnection();
db.connect();
module.exports = db;

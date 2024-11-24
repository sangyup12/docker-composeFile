const express = require("express");
const app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

var db = require("./lib/db");
var authorRouter = require("./router/authorRouter");
var rootRouter = require("./router/rootRouter");
var codeRouter = require("./router/codeRouter");
var personRouter = require("./router/personRouter");
var productRouter = require("./router/productRouter");
var boardRouter = require("./router/boardRouter");
var purchaseRouter = require("./router/purchaseRouter");
var analRouter = require("./router/analRouter");

var session = require("express-session");
var MySqlStore = require("express-mysql-session")(session);
var bodyParser = require("body-parser");
var options = {
  host: process.env.DB_HOST || "127.0.0.1", // 환경 변수 우선 사용
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "webdb2024",
};
const mysql = require("mysql2/promise");

async function testDBConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "mysql",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "webdb2024",
    });
    console.log("Successfully connected to MySQL!");
    await connection.end();
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
  }
}
testDBConnection();
var sessionStore = new MySqlStore(options, (err) => {
  if (err) {
    console.error("Failed to connect to MySQL session store:", err);
  } else {
    console.log("Connected to MySQL session store.");
  }
});
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

app.use("/", rootRouter);
app.use("/auth", authorRouter);
app.use("/code", codeRouter);
app.use("/person", personRouter);
app.use("/product", productRouter);
app.use("/board", boardRouter);
app.use("/purchase", purchaseRouter);
app.use("/anal", analRouter);

app.get("/favicon.ico", (req, res) => res.writeHead(404));
app.listen(3000, () => console.log("GCshop app listening on port 3000"));

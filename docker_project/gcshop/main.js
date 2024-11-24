const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const MySqlStore = require("express-mysql-session")(session);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// MySQL 세션 스토어 옵션
var options = {
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "webdb2024",
};

// MySQL 세션 스토어 연결
var sessionStore = new MySqlStore(options, (err) => {
  if (err) {
    console.error("MySQL Session Store Error:", err.message);
  } else {
    console.log("MySQL Session Store connected.");
  }
});

// 세션 설정
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

// 라우터 로드
try {
  var authorRouter = require("./router/authorRouter");
  var rootRouter = require("./router/rootRouter");
  var codeRouter = require("./router/codeRouter");
  var personRouter = require("./router/personRouter");
  var productRouter = require("./router/productRouter");
  var boardRouter = require("./router/boardRouter");
  var purchaseRouter = require("./router/purchaseRouter");
  var analRouter = require("./router/analRouter");

  app.use("/", rootRouter);
  app.use("/auth", authorRouter);
  app.use("/code", codeRouter);
  app.use("/person", personRouter);
  app.use("/product", productRouter);
  app.use("/board", boardRouter);
  app.use("/purchase", purchaseRouter);
  app.use("/anal", analRouter);
} catch (err) {
  console.error("Error loading routers:", err.message);
  process.exit(1);
}

// 글로벌 에러 핸들링
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  res.status(500).send("Something went wrong!");
});

// 서버 시작
app.listen(3000, () => console.log("GCshop app listening on port 3000"));

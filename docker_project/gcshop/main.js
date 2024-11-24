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
  host: "mysql",
  user: "root",
  password: "root",
  database: "webdb2024",
};
var sessionStore = new MySqlStore(options);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);
console.log("Session Store Options:", options);
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

const express = require("express");
var router = express.Router();
var root = require("../lib/root");

router.get("/", (req, res) => {
  root.home(req, res);
});

router.get("/category/:categ", (req, res) => {
  root.category(req, res);
});

router.get("/search", (req, res) => {
  root.search(req, res);
});

router.get("/detail/:merId", (req, res) => {
  root.detail(req, res);
});

router.get("/table", (req, res) => {
  root.table(req, res);
});

router.get("/table/view/:table", (req, res) => {
  root.table_view(req, res);
});
module.exports = router;

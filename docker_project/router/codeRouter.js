const express = require("express");
var router = express.Router();
var code = require("../lib/code");

router.get("/view", (req, res) => {
  code.code(req, res);
});

router.get("/create", (req, res) => {
  code.code_create(req, res);
});

router.post("/create_process", (req, res) => {
  code.code_create_process(req, res);
});

router.get("/update/:main_id/:sub_id/:start/:end", (req, res) => {
  code.code_update(req, res);
});

router.post("/update_process", (req, res) => {
  code.code_update_process(req, res);
});

router.get("/delete/:main_id/:sub_id/:start/:end", (req, res) => {
  code.code_delete_process(req, res);
});

module.exports = router;

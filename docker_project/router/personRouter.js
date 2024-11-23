const express = require("express");
var router = express.Router();
var person = require("../lib/person");

router.get("/view", (req, res) => {
  person.person_view(req, res);
});

router.get("/create", (req, res) => {
  person.person_create(req, res);
});

router.post("/create_process", (req, res) => {
  person.person_create_process(req, res);
});

router.get("/update/:loginid", (req, res) => {
  person.person_update(req, res);
});

router.post("/update_process", (req, res) => {
  person.person_update_process(req, res);
});

router.get("/delete/:loginid", (req, res) => {
  person.person_delete_process(req, res);
});

module.exports = router;

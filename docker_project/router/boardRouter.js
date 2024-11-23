const express = require("express");
var router = express.Router();
var board = require("../lib/board");

router.get("/type/view", (req, res) => {
  board.boardtype_view(req, res);
});

router.get("/type/create", (req, res) => {
  board.type_create(req, res);
});

router.post("/type/create_process", (req, res) => {
  board.type_create_process(req, res);
});

router.get("/type/update/:type_id", (req, res) => {
  board.type_update(req, res);
});

router.post("/type/update_process", (req, res) => {
  board.type_update_process(req, res);
});

router.get("/type/delete/:type_id", (req, res) => {
  board.type_delete_process(req, res);
});

router.get("/view/:typeId", (req, res) => {
  board.board_view(req, res);
});

router.get("/create/:typeId", (req, res) => {
  board.board_create(req, res);
});

router.post("/create_process", (req, res) => {
  board.board_create_process(req, res);
});

router.get("/detail/:boardId", (req, res) => {
  board.board_detail(req, res);
});

router.get("/update/:boardId", (req, res) => {
  board.board_update(req, res);
});

router.post("/update_process/:boardId", (req, res) => {
  board.board_update_process(req, res);
});

router.get("/delete/:boardId", (req, res) => {
  board.board_delete(req, res);
});
module.exports = router;

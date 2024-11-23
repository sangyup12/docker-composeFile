const express = require("express");
var router = express.Router();
var purchase = require("../lib/purchase");

router.get("/detail/:merId", (req, res) => {
  purchase.purchasedetail(req, res);
});

router.post("/:merId", (req, res) => {
  purchase.purchase(req, res);
});

router.get("/list", (req, res) => {
  purchase.purchaseView(req, res);
});

router.get("/cancel/:purId", (req, res) => {
  purchase.cancel_process(req, res);
});

router.get("/cart/list", (req, res) => {
  purchase.cartView(req, res);
});

router.post("/cart/add/:merId", (req, res) => {
  purchase.cart(req, res);
});

router.post("/cart/delete", (req, res) => {
  purchase.cart_delete(req, res);
});

router.post("/cart/checkout", (req, res) => {
  purchase.cart_checkout(req, res);
});

router.get("/cart/view", (req, res) => {
  purchase.cartManageView(req, res);
});

router.get("/view", (req, res) => {
  purchase.purchaseManageView(req, res);
});

router.get("/view/update/:purId", (req, res) => {
  purchase.purchase_update(req, res);
});

router.post("/view/delete/:purId", (req, res) => {
  purchase.purchase_delete(req, res);
});

router.get("/cart/edit/:cartId", (req, res) => {
  purchase.cart_edit(req, res);
});

router.post("/cart/update/:cartId", (req, res) => {
  purchase.cart_edit_process(req, res);
});

router.post("/view/update/:purchase_id", (req, res) => {
  purchase.purchase_update_process(req, res);
});

module.exports = router;

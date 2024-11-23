const express = require("express");
var router = express.Router();
var product = require("../lib/product");
const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/images");
    },
    filename: function (req, file, cb) {
      var newFileName = Buffer.from(file.originalname, "latin1").toString(
        "utf-8"
      );
      cb(null, newFileName);
    },
  }),
});

router.get("/view", (req, res) => {
  product.product_view(req, res);
});

router.get("/create", (req, res) => {
  product.product_create(req, res);
});

router.post(
  "/create_process",
  upload.single("uploadFile"),
  product.product_create_process
);

router.get("/update/:mer_id", (req, res) => {
  product.product_update(req, res);
});

router.post(
  "/update_process",
  upload.single("uploadFile"),
  product.product_update_process
);

router.get("/delete/:mer_id", (req, res) => {
  product.product_delete_process(req, res);
});
module.exports = router;

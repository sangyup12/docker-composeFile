const db = require("./db");
var sanitizeHtml = require("sanitize-html");

function authIsOwner(req, res) {
  var name = "Guest";
  var login = false;
  var cls = "NON";
  if (req.session.is_logined) {
    name = req.session.name;
    login = true;
    cls = req.session.cls;
  }
  return { name, login, cls };
}

module.exports = {
  product_view: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var sql1 = ` SELECT * FROM boardtype;`;
    var sql2 = ` SELECT * FROM product;`;
    let sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sql1, (error1, types) => {
        if (error1) {
          throw error1;
        }
        db.query(sql2, (error, results) => {
          var context = {
            isRoot: false, // '/' 요청 아닐 때는 isRoot를 false로 설정
            /*********** mainFrame.ejs에 필요한 변수 ***********/
            who: name,
            login: login,
            body: "product.ejs",
            cls: cls,
            mer: results,
            categorys: codes,
            types: types,
          };
          res.render("mainFrame", context, (err, html) => {
            res.end(html);
          }); //render end
        }); //query
      });
    }); //query end
  },

  product_create: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var sql2 = ` SELECT * FROM product;`;
    var sql1 = ` SELECT * FROM code;`;
    var sql0 = ` SELECT * FROM boardtype;`;
    db.query(sql0, (error0, types) => {
      if (error0) {
        throw error0;
      }
      db.query(sql1, (error1, codes) => {
        if (error1) {
          throw error1;
        }
        db.query(sql2, (error, results) => {
          if (error) {
            throw error;
          }
          var context = {
            /*********** mainFrame.ejs에 필요한 변수 ***********/
            who: name,
            login: login,
            title: "입력",
            body: "productCU.ejs",
            cls: cls,
            categorys: codes,
            types: types,
            mer: [],
          };
          res.render("mainFrame", context, (err, html) => {
            res.end(html);
          }); //render end
        }); //query end
      });
    });
  },

  product_create_process: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var post = req.body;
    let category = post.category.split(",");

    let sanitizedMain_id = sanitizeHtml(category[0]);
    let sanitizedSub_id = sanitizeHtml(category[1]);

    let sanitizedName = sanitizeHtml(post.name);
    let sanitizedPrice = parseInt(sanitizeHtml(post.price)) || 0;
    let sanitizedStock = parseInt(sanitizeHtml(post.stock)) || 0;
    let sanitizedBrand = sanitizeHtml(post.brand);
    let sanitizedSupplier = sanitizeHtml(post.supplier);
    let sanitizedSale_yn = sanitizeHtml(post.sale_yn) || "N";
    let sanitizedSale_price = parseInt(sanitizeHtml(post.sale_price)) || 0;

    let sanitizedImage = req.file ? `/image/${req.file.filename}` : null;

    var sql2 = `
    INSERT INTO product (main_id, sub_id, name, price, stock, brand, supplier, image, sale_yn, sale_price)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    var sql1 = ` SELECT * FROM code;`;

    db.query(sql1, (error1, codes) => {
      if (error1) {
        throw error1;
      }
      db.query(
        sql2,
        [
          sanitizedMain_id,
          sanitizedSub_id,
          sanitizedName,
          sanitizedPrice,
          sanitizedStock,
          sanitizedBrand,
          sanitizedSupplier,
          sanitizedImage,
          sanitizedSale_yn,
          sanitizedSale_price,
        ],
        (error, results) => {
          if (error) {
            throw error;
          }
          res.redirect(`/product/view`);

          var context = {
            /*********** mainFrame.ejs에 필요한 변수 ***********/
            who: name,
            login: login,
            body: "prouctCU.ejs",
            cls: cls,
            mer: results,
            categorys: codes,
          };
          res.render("mainFrame", context, (err, html) => {
            res.end(html);
          }); //render end
        }
      ); //query end
    });
  },

  product_update: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    let mer_id = req.params.mer_id;

    var sql1 = ` SELECT * FROM code;`;
    var sql2 = ` SELECT * FROM product WHERE mer_id=${mer_id} ;`;
    var sql0 = ` SELECT * FROM boardtype;`;
    db.query(sql0, (error0, types) => {
      if (error0) {
        throw error0;
      }
      db.query(sql1, (error1, codes) => {
        if (error1) {
          throw error1;
        }
        db.query(sql2, (error, results) => {
          if (error) {
            throw error;
          }
          var context = {
            /*********** mainFrame.ejs에 필요한 변수 ***********/
            who: name,
            login: login,
            title: "수정",
            body: "productCU.ejs",
            cls: cls,
            categorys: codes,
            types: types,
            mer: results,
          };
          res.render("mainFrame", context, (err, html) => {
            if (err) {
              throw err;
            }
            res.end(html);
          }); //render end
        }); //query end
      });
    });
  },

  product_update_process: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var post = req.body;
    let category = post.category.split(",");
    let mer_id = post.original_id;

    let sanitizedMain_id = sanitizeHtml(category[0]);
    let sanitizedSub_id = sanitizeHtml(category[1]);

    let sanitizedName = sanitizeHtml(post.name);
    let sanitizedPrice = parseInt(sanitizeHtml(post.price)) || 0;
    let sanitizedStock = parseInt(sanitizeHtml(post.stock)) || 0;
    let sanitizedBrand = sanitizeHtml(post.brand);
    let sanitizedSupplier = sanitizeHtml(post.supplier);
    let sanitizedSale_yn = sanitizeHtml(post.sale_yn) || "N";
    let sanitizedSale_price = parseInt(sanitizeHtml(post.sale_price)) || 0;

    let sanitizedImage = req.file
      ? sanitizeHtml(req.file.filename)
      : post.currentImage;

    let sql2 = `
    UPDATE product 
      SET main_id = ?, sub_id = ?, name = ?, price = ?, stock = ?, brand = ?, supplier = ?, image = ?, sale_yn = ?, sale_price = ? 
      WHERE mer_id = ?
    `;
    let sql1 = `SELECT * FROM code;`;
    let sql0 = `SELECT * FROM boardtype;`;

    db.query(sql0, (error0, types) => {
      if (error0) {
        throw error0;
      }
      db.query(sql1, (error1, codes) => {
        if (error1) {
          throw error1;
        }
        db.query(
          sql2,
          [
            sanitizedMain_id,
            sanitizedSub_id,
            sanitizedName,
            sanitizedPrice,
            sanitizedStock,
            sanitizedBrand,
            sanitizedSupplier,
            sanitizedImage,
            sanitizedSale_yn,
            sanitizedSale_price,
            mer_id,
          ],
          (error, results) => {
            if (error) {
              throw error;
            }
            res.redirect(`/product/view`);

            var context = {
              /*********** mainFrame.ejs에 필요한 변수 ***********/
              who: name,
              login: login,
              isRoot: false, // '/' 요청 아닐 때는 isRoot를 false로 설정s
              body: "product.ejs",
              cls: cls,
              mer: results,
              types: types,
              categorys: codes,
            };
            res.render("mainFrame", context, (err, html) => {
              if (err) {
                throw err;
              }
              res.end(html);
            }); //render end
          }
        ); //query end
      });
    });
  },

  product_delete_process: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    let mer_id = req.params.mer_id;
    db.query(
      "DELETE FROM product WHERE mer_id = ? ",
      [mer_id],
      (error, result) => {
        if (error) {
          throw error;
        }
        res.writeHead(302, { Location: `/product/view` });
        res.end();
      }
    );
  },
};

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
  purchasedetail: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const merId = req.params.merId;
    var sql1 = ` SELECT * FROM boardtype;`;
    var sql2 = ` SELECT * FROM product WHERE mer_id = ${merId};`;
    let sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;

      db.query(sql1, (error, types) => {
        if (error) throw error;

        db.query(sql2, (error1, results) => {
          if (error1) throw error1;

          var context = {
            isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
            /*********** mainFrame.ejs에 필요한 변수 ***********/
            who: name,
            login: login,
            body: "purchaseDetail.ejs",
            cls: cls,
            mer: results,
            categorys: codes,
            types: types,
          };
          res.render("mainFrame", context, (err, html) => {
            if (err) throw err;
            res.end(html);
          }); //render end
        }); //query end
      }); //query end
    }); //query end
  },

  purchaseView: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const sql4 = `SELECT loginid FROM person WHERE name = ?;`; // 로그인한 사용자의 loginid 조회
    const purchaseSql = `SELECT * FROM purchase LEFT JOIN product ON purchase.mer_id = product.mer_id WHERE purchase.loginid = ?;`;
    const sql1 = `SELECT * FROM boardtype;`;
    const sql2 = `SELECT * FROM product;`;
    const sql3 = `SELECT * FROM code;`;

    db.query(sql4, [name], (error4, personResults) => {
      if (error4) throw error4;

      if (personResults.length === 0) {
        return res.send(
          `<script>
                    alert('사용자 정보를 찾을 수 없습니다.');
                    window.location.href = '/';
                </script>`
        );
      }

      const loginID = personResults[0].loginid; // person 테이블에서 조회한 loginid

      db.query(sql3, (error3, codes) => {
        if (error3) throw error3;

        db.query(sql1, (error1, types) => {
          if (error1) throw error1;

          db.query(sql2, (error2, results) => {
            if (error2) throw error2;

            db.query(purchaseSql, [loginID], (error5, purchases) => {
              if (error5) throw error5;

              var context = {
                isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
                /*********** mainFrame.ejs에 필요한 변수 ***********/
                who: name,
                login: login,
                body: "purchase.ejs",
                cls: cls,
                mer: results,
                pur: purchases,
                categorys: codes,
                types: types,
              };

              res.render("mainFrame", context, (err, html) => {
                if (err) throw err;
                res.end(html);
              }); // render end
            }); // query end
          }); // query end
        }); // query end
      }); // query end
    });
  },

  purchase: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var post = req.body;
    const merId = req.params.merId;

    const getLoginIdSql = `SELECT loginid FROM person WHERE name = ?;`; // name으로 loginid 조회
    const purchaseSql = `INSERT INTO purchase (loginid, mer_id, date, price, point, qty, total)
    VALUES(?, ?, ?, ?, ?, ?, ?);`;
    const sql1 = `SELECT * FROM boardtype;`;
    const sql2 = `SELECT * FROM product WHERE mer_id = ?`;
    const sql3 = `SELECT * FROM code;`;

    db.query(getLoginIdSql, [name], (err, personResults) => {
      if (err) throw err;

      if (personResults.length === 0) {
        return res.send(
          `<script>
                    alert('사용자 정보를 찾을 수 없습니다.');
                    window.location.href = '/';
                </script>`
        );
      }

      const loginID = personResults[0].loginid; // person 테이블에서 조회한 loginid

      db.query(sql3, (error3, codes) => {
        if (error3) throw error3;

        db.query(sql1, (error1, types) => {
          if (error1) throw error1;

          db.query(sql2, [merId], (error2, productResults) => {
            if (error2) throw error2;

            const date = new Date()
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
            const price = productResults[0].price;
            const point = 0; // 포인트 초기값
            const qty = post.qty; // 요청 본문에서 수량 가져오기
            const total = price * qty; // 총 금액 계산

            db.query(
              purchaseSql,
              [loginID, merId, date, price, point, qty, total],
              (error3) => {
                if (error3) throw error3;

                res.redirect(`/purchase/list`);
              }
            ); // purchase INSERT query
          }); // product SELECT query
        }); // boardtype SELECT query
      }); // code SELECT query
    }); // person SELECT query
  },

  cancel_process: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const purchaseSql = `SELECT * FROM purchase WHERE purchase_id = ?;`;
    const cancelSql = `UPDATE purchase SET cancel = 'Y' WHERE purchase_id = ?;`;
    const sql1 = ` SELECT * FROM boardtype;`;
    const sql2 = ` SELECT * FROM product;`;
    const sql3 = `SELECT * FROM code;`;
    const purchasID = req.params.purId;
    db.query(purchaseSql, [purchasID], (error2, purchases) => {
      if (error2) throw error2;
      const purchaseID = purchases[0].purchase_id;
      db.query(cancelSql, [purchaseID], (error4) => {
        if (error4) throw error4;

        db.query(sql3, (error3, codes) => {
          if (error3) throw error3;

          db.query(sql1, (error, types) => {
            if (error) throw error;

            db.query(sql2, (error1, results) => {
              if (error1) throw error1;

              var context = {
                isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
                /*********** mainFrame.ejs에 필요한 변수 ***********/
                who: name,
                login: login,
                body: "purchase.ejs",
                cls: cls,
                mer: results,
                pur: purchases,
                categorys: codes,
                types: types,
              };

              res.redirect(`/purchase/list`);
            }); //query end
          }); //query end
        }); //query end
      }); //query end
    });
  },

  cartView: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const cartSql = `SELECT * FROM cart LEFT JOIN product ON cart.mer_id = product.mer_id`;

    var sql1 = ` SELECT * FROM boardtype;`;
    var sql2 = ` SELECT * FROM product;`;
    let sql3 = `SELECT * FROM code;`;

    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;

      db.query(sql1, (error, types) => {
        if (error) throw error;

        db.query(sql2, (error1, results) => {
          if (error1) throw error1;

          db.query(cartSql, (error2, carts) => {
            if (error2) throw error2;

            var context = {
              isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
              /*********** mainFrame.ejs에 필요한 변수 ***********/
              who: name,
              login: login,
              body: "cart.ejs",
              cls: cls,
              mer: results,
              car: carts,
              categorys: codes,
              types: types,
            };

            res.render("mainFrame", context, (err, html) => {
              if (err) throw err;
              res.end(html);
            }); //render end
          }); //query end
        }); //query end
      }); //query end
    });
  },

  cart: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res); // 현재 로그인한 사용자 정보
    const merId = req.params.merId;

    const checkCartSql = `SELECT * FROM cart WHERE loginid = ? AND mer_id = ?`;
    const cartSql = `INSERT INTO cart (loginid, mer_id, date) VALUES(?, ?, ?);`;
    const sql1 = `SELECT * FROM boardtype;`;
    const sql2 = `SELECT * FROM product WHERE mer_id = ?;`;
    const sql3 = `SELECT * FROM code;`;
    const sql4 = `SELECT loginid FROM person WHERE name = ?;`; // person 테이블에서 loginid를 가져오기 위한 SQL

    db.query(sql4, [name], (error4, personResults) => {
      if (error4) throw error4;

      if (personResults.length === 0) {
        // 사용자 이름으로 loginid를 찾을 수 없는 경우
        return res.send(
          `<script>
                    alert('사용자 정보를 찾을 수 없습니다.');
                    window.location.href = '/';
                </script>`
        );
      }

      const loginID = personResults[0].loginid; // person 테이블에서 조회한 loginid
      const date = new Date().toISOString().slice(0, 19).replace("T", " ");

      db.query(sql3, (error3, codes) => {
        if (error3) throw error3;

        db.query(sql1, (error1, types) => {
          if (error1) throw error1;

          db.query(sql2, [merId], (error2, productResults) => {
            if (error2) throw error2;

            db.query(checkCartSql, [loginID, merId], (error5, cartResults) => {
              if (error5) throw error5;

              if (cartResults.length > 0) {
                // 이미 장바구니에 존재하는 경우
                return res.send(
                  `<script>
                                    alert('장바구니에 이미 있는 제품입니다.');
                                    window.location.href = '/purchase/cart/list';
                                </script>`
                );
              } else {
                // 장바구니에 추가
                db.query(cartSql, [loginID, merId, date], (error6) => {
                  if (error6) throw error6;

                  res.redirect(`/purchase/cart/list`);
                });
              }
            });
          });
        });
      });
    });
  },

  cart_delete: (req, res) => {
    const { cartIds } = req.body;
    var { cls } = authIsOwner(req, res);
    // 선택된 항목이 없는 경우 처리
    if (!cartIds || cartIds.length === 0) {
      return res.send(
        "<script>alert('삭제할 상품을 선택하세요.'); history.back();</script>"
      );
    }

    // cartIds가 배열이 아닐 경우 배열로 변환
    const idsToDelete = Array.isArray(cartIds) ? cartIds : [cartIds];

    const deleteCartSql = `DELETE FROM cart WHERE cart_id IN (?);`;

    db.query(deleteCartSql, [idsToDelete], (err) => {
      if (err) {
        console.error("Error deleting items:", err);
        throw err;
      }
      if (cls === "CST") {
        res.redirect("/purchase/cart/list"); // 장바구니 페이지로 리다이렉트
      } else {
        res.redirect("/purchase/cart/view"); // 장바구니 페이지로 리다이렉트
      }
    });
  },

  cart_checkout: (req, res) => {
    const { login, name } = authIsOwner(req, res);
    const { cartIds, quantities } = req.body;

    if (!cartIds || cartIds.length === 0) {
      return res.send(
        "<script>alert('결제할 상품을 선택하세요.'); history.back();</script>"
      );
    }

    const selectCartSql = `
    SELECT cart.cart_id, cart.mer_id, product.price
    FROM cart
    LEFT JOIN product ON cart.mer_id = product.mer_id
    WHERE cart.cart_id IN (?);
  `;

    db.query(selectCartSql, [cartIds], (err, cartItems) => {
      if (err) throw err;

      const date = new Date().toISOString().slice(0, 19).replace("T", " ");
      const purchaseData = cartItems.map((item, index) => {
        const qty = quantities[index];
        return [name, item.mer_id, date, item.price, 0, qty, item.price * qty];
      });

      const insertPurchaseSql = `
      INSERT INTO purchase (loginid, mer_id, date, price, point, qty, total)
      VALUES ?;
    `;

      db.query(insertPurchaseSql, [purchaseData], (insertErr) => {
        if (insertErr) throw insertErr;

        const deleteCartSql = `DELETE FROM cart WHERE cart_id IN (?);`;
        db.query(deleteCartSql, [cartIds], (deleteErr) => {
          if (deleteErr) throw deleteErr;

          res.redirect("/purchase/list");
        });
      });
    });
  },

  cartManageView: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const cartSql = `SELECT cart.*, product.name AS product_name, person.name AS person_name FROM cart LEFT JOIN product ON cart.mer_id = product.mer_id LEFT JOIN person ON cart.loginid = person.loginid`;

    var sql1 = ` SELECT * FROM boardtype;`;
    var sql2 = ` SELECT * FROM product;`;
    let sql3 = `SELECT * FROM code;`;

    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;

      db.query(sql1, (error, types) => {
        if (error) throw error;

        db.query(sql2, (error1, results) => {
          if (error1) throw error1;

          db.query(cartSql, (error2, carts) => {
            if (error2) throw error2;

            var context = {
              isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
              /*********** mainFrame.ejs에 필요한 변수 ***********/
              who: name,
              login: login,
              body: "cartView.ejs",
              cls: cls,
              mer: results,
              car: carts,
              categorys: codes,
              types: types,
            };

            res.render("mainFrame", context, (err, html) => {
              if (err) throw err;
              res.end(html);
            }); //render end
          }); //query end
        }); //query end
      }); //query end
    });
  },

  cart_edit: (req, res) => {
    const cartIds = req.params.cartId;
    var { login, name, cls } = authIsOwner(req, res);
    const cartSql = `
                        SELECT * 
                        FROM cart 
                        LEFT JOIN product ON cart.mer_id = product.mer_id
                        LEFT JOIN person ON cart.loginid = person.loginid
                        WHERE cart.cart_id = ?
                      `;
    const sql1 = ` SELECT * FROM boardtype;`;
    const personSql = ` SELECT * FROM person;`;
    const productSql = ` SELECT * FROM product;`;
    const sql3 = `SELECT * FROM code;`;
    db.query(productSql, (error4, products) => {
      if (error4) throw error4;

      db.query(sql3, (error3, codes) => {
        if (error3) throw error3;

        db.query(sql1, (error, types) => {
          if (error) throw error;

          db.query(personSql, (error1, person) => {
            if (error1) throw error1;

            db.query(cartSql, [cartIds], (error2, carts) => {
              if (error2) throw error2;

              var context = {
                isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
                /*********** mainFrame.ejs에 필요한 변수 ***********/
                who: name,
                login: login,
                body: "cartU.ejs",
                cls: cls,
                man: person,
                mer: products,
                car: carts,
                categorys: codes,
                types: types,
              };

              res.render("mainFrame", context, (err, html) => {
                if (err) throw err;
                res.end(html);
              }); //render end
            }); //query end
          }); //query end
        }); //query end
      }); //query end
    });
  },

  cart_edit_process: (req, res) => {
    const { cartId } = req.params; // URL 파라미터에서 cartId 가져오기
    const { loginid, mer_id } = req.body; // 폼 데이터에서 loginid와 mer_id 가져오기

    const updateCartSql = `
        UPDATE cart
        SET loginid = ?, mer_id = ?
        WHERE cart_id = ?;
    `;

    db.query(updateCartSql, [loginid, mer_id, cartId], (err, results) => {
      if (err) {
        console.error("Error updating cart:", err);
        return res.send(
          `<script>
                    alert('카트 업데이트 중 문제가 발생했습니다.');
                    history.back();
                </script>`
        );
      }

      // 업데이트 성공 후 카트 목록으로 리다이렉트
      res.redirect("/purchase/cart/view");
    });
  },

  purchase_update: (req, res) => {
    const purId = req.params.purId;
    var { login, name, cls } = authIsOwner(req, res);
    const purSql = `
                        SELECT purchase.*, person.name AS person_name, product.name AS product_name 
                        FROM purchase 
                        LEFT JOIN product ON purchase.mer_id = product.mer_id
                        LEFT JOIN person ON purchase.loginid = person.loginid
                        WHERE purchase.purchase_id = ?
                      `;
    const sql1 = ` SELECT * FROM boardtype;`;
    const personSql = ` SELECT * FROM person;`;
    const productSql = ` SELECT * FROM product;`;
    const sql3 = `SELECT * FROM code;`;
    db.query(productSql, (error4, products) => {
      if (error4) throw error4;

      db.query(sql3, (error3, codes) => {
        if (error3) throw error3;

        db.query(sql1, (error, types) => {
          if (error) throw error;

          db.query(personSql, (error1, person) => {
            if (error1) throw error1;

            db.query(purSql, [purId], (error2, purs) => {
              if (error2) throw error2;

              var context = {
                isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
                /*********** mainFrame.ejs에 필요한 변수 ***********/
                who: name,
                login: login,
                body: "purchaseU.ejs",
                cls: cls,
                man: person,
                mer: products,
                pur: purs,
                categorys: codes,
                types: types,
              };

              res.render("mainFrame", context, (err, html) => {
                if (err) throw err;
                res.end(html);
              }); //render end
            }); //query end
          }); //query end
        }); //query end
      }); //query end
    });
  },

  purchase_update_process: (req, res) => {
    const purchaseId = req.params.purchase_id; // URL에서 구매 ID를 가져옴
    const { loginid, mer_id, price, point, qty, total, payYN, cancel, refund } =
      req.body; // 폼에서 제출된 데이터 가져오기

    // SQL 쿼리 작성
    const updateSql = `
      UPDATE purchase 
      SET loginid = ?, mer_id = ?, price = ?, point = ?, qty = ?, total = ?, 
          payYN = ?, cancel = ?, refund = ?
      WHERE purchase_id = ?;
    `;

    // 업데이트 실행
    db.query(
      updateSql,
      [
        loginid,
        mer_id,
        price,
        point,
        qty,
        total,
        payYN,
        cancel,
        refund,
        purchaseId,
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating purchase:", err);
          return res
            .status(500)
            .send("데이터베이스 오류로 인해 업데이트할 수 없습니다.");
        }

        // 업데이트 성공 후 구매 목록으로 리다이렉트
        res.redirect("/purchase/view");
      }
    );
  },

  purchase_delete: (req, res) => {
    const purIds = req.params.purId;
    const deletePurSql = `DELETE FROM purchase WHERE purchase_id = ?;`;

    db.query(deletePurSql, [purIds], (err) => {
      if (err) {
        console.error("Error deleting items:", err);
        throw err;
      }

      res.redirect("/purchase/view"); // 장바구니 페이지로 리다이렉트
    });
  },

  purchaseManageView: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const purchaseSql = `SELECT purchase.*, product.name AS product_name, person.name AS person_name FROM purchase LEFT JOIN product ON purchase.mer_id = product.mer_id LEFT JOIN person ON purchase.loginid = person.loginid`;

    var sql1 = ` SELECT * FROM boardtype;`;
    var sql2 = ` SELECT * FROM product;`;
    let sql3 = `SELECT * FROM code;`;

    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;

      db.query(sql1, (error, types) => {
        if (error) throw error;

        db.query(sql2, (error1, results) => {
          if (error1) throw error1;

          db.query(purchaseSql, (error2, purchase) => {
            if (error2) throw error2;

            var context = {
              isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
              /*********** mainFrame.ejs에 필요한 변수 ***********/
              who: name,
              login: login,
              body: "purchaseView.ejs",
              cls: cls,
              mer: results,
              pur: purchase,
              categorys: codes,
              types: types,
            };

            res.render("mainFrame", context, (err, html) => {
              if (err) throw err;
              res.end(html);
            }); //render end
          }); //query end
        }); //query end
      }); //query end
    });
  },
};

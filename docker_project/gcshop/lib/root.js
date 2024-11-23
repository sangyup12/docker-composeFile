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
  home: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var sql1 = ` SELECT * FROM boardtype;`;
    var sql2 = ` SELECT * FROM product;`;
    let sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) {
        throw error3;
      }
      db.query(sql1, (error, types) => {
        if (error) {
          throw error;
        }
        db.query(sql2, (error, results) => {
          var context = {
            isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
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
        }); //query end
      }); //query end
    }); //query end
  },

  category: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    let categ = req.params.categ;
    let m_id, s_id;
    // 8자리 숫자를 메인 ID와 서브 ID로 분리
    if (/^\d{8}$/.test(categ)) {
      // categ가 8자리 숫자인지 확인
      m_id = categ.slice(0, 4); // 첫 4자리
      s_id = categ.slice(4); // 나머지 4자리
    } else {
      // 에러 처리
      res
        .status(400)
        .json({ error: "Invalid categ format. Must be 8 digits." });
    }
    var sql1 = ` SELECT * FROM boardtype;`;
    var sql2 = ` SELECT * FROM product WHERE main_id = ${m_id} AND sub_id = ${s_id};`;
    let sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;

      db.query(sql1, (error, types) => {
        if (error) throw error;

        db.query(sql2, (error2, results) => {
          if (error2) throw error2;

          var context = {
            isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
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
        }); //query end
      });
    }); //query end
  },

  search: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    let searchText = req.query.search;
    var sql1 = ` SELECT * FROM boardtype;`;
    let sql3 = `SELECT * FROM code;`;
    let sql2 = `select * from product
                where name like '%${searchText}%' or
                brand like '%${searchText}%' or
                supplier like '%${searchText}%';`;

    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sql1, (error, types) => {
        if (error) throw error;
        db.query(sql2, (err2, results) => {
          if (err2) throw err2;
          var context = {
            isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
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
            if (err) throw err;
            res.end(html);
          }); //render end
        }); //query end
      }); //query end
    }); //query end
  },

  detail: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const merId = req.params.merId;
    console.log(merId);
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
            body: "productDetail.ejs",
            cls: cls,
            mer: results,
            categorys: codes,
            types: types,
          };
          res.render("mainFrame", context, (err, html) => {
            res.end(html);
          }); //render end
        }); //query end
      }); //query end
    }); //query end
  },

  table: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const merId = req.params.merId;
    var sql1 = ` SELECT * FROM boardtype;`;
    var sql2 = ` SELECT *
                  FROM INFORMATION_SCHEMA.TABLES
                  where table_schema = 'webdb2024';`;
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
            body: "tableManage.ejs",
            cls: cls,
            tables: results,
            categorys: codes,
            types: types,
          };
          res.render("mainFrame", context, (err, html) => {
            res.end(html);
          }); //render end
        }); //query end
      }); //query end
    }); //query end
  },

  table_view: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const tname = req.params.table;
    var sql1 = ` SELECT * FROM boardtype;`;
    var sql2 = ` SELECT *
                FROM information_schema.columns
                WHERE table_schema = 'webdb2024' AND table_name = '${tname}';`;
    var sql4 = ` SELECT *
                  FROM ${tname} `;
    let sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;

      db.query(sql1, (error, types) => {
        if (error) throw error;

        db.query(sql2, (error1, results) => {
          if (error1) throw error1;

          db.query(sql4, (error1, table) => {
            if (error1) throw error1;

            var context = {
              isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
              /*********** mainFrame.ejs에 필요한 변수 ***********/
              who: name,
              login: login,
              body: "tableView.ejs",
              cls: cls,
              tableName: tname,
              table: table,
              columns: results,
              categorys: codes,
              types: types,
            };
            res.render("mainFrame", context, (err, html) => {
              res.end(html);
            }); //render end
          }); //query end
        }); //query end
      }); //query end
    }); //query end
  },
};

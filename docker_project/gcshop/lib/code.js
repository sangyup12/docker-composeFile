const db = require("./db");
var sanitizeHtml = require("sanitize-html");
const { category } = require("./root");

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
  code: (req, res) => {
    const { login, name, cls } = authIsOwner(req, res);
    const sql1 = `SELECT * FROM boardtype;`;
    const sql2 = `SELECT * FROM code;`;

    Promise.all([
      new Promise((resolve, reject) => {
        db.query(sql1, (error, types) => {
          if (error) return reject(error);
          resolve(types);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(sql2, (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      }),
    ])
      .then(([types, codes]) => {
        const context = {
          who: name,
          login: login,
          body: "code.ejs",
          cls: cls,
          codes: codes,
          categorys: codes,
          types: types,
        };
        res.render("mainFrame", context);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Internal Server Error");
      });
  },

  code_create: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var sql2 = ` SELECT * FROM code;`;
    var sql0 = ` SELECT * FROM boardtype;`;
    db.query(sql0, (error0, types) => {
      if (error0) {
        throw error0;
      }
      db.query(sql2, (error, results) => {
        var context = {
          /*********** mainFrame.ejs에 필요한 변수 ***********/
          who: name,
          login: login,
          title: "입력",
          body: "codeCU.ejs",
          cls: cls,
          types: types,
          categorys: results,
          codes: null,
        };
        res.render("mainFrame", context, (err, html) => {
          res.end(html);
        }); //render end
      }); //query end
    });
  },

  code_create_process: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var post = req.body;
    let sanitizedMain_id = sanitizeHtml(post.main_id);
    let sanitizedSub_id = sanitizeHtml(post.sub_id);
    let sanitizedMain_name = sanitizeHtml(post.main_name);
    let sanitizedSub_name = sanitizeHtml(post.sub_name);
    let sanitizedStart = sanitizeHtml(post.start);
    let sanitizedEnd = sanitizeHtml(post.end);

    var sql2 = `
    INSERT INTO code (main_id, sub_id, main_name, sub_name, start, end)
    VALUES(?, ?, ?, ?, ?, ?)`;

    db.query(
      sql2,
      [
        sanitizedMain_id,
        sanitizedSub_id,
        sanitizedMain_name,
        sanitizedSub_name,
        sanitizedStart,
        sanitizedEnd,
      ],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.redirect(`/code/view`);

        var context = {
          /*********** mainFrame.ejs에 필요한 변수 ***********/
          who: name,
          login: login,
          body: "code.ejs",
          cls: cls,
          codes: results,
        };
        res.render("mainFrame", context, (err, html) => {
          res.end(html);
        }); //render end
      }
    ); //query end
  },

  code_update: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    let m_id = req.params.main_id;
    let s_id = req.params.sub_id;
    let s_date = req.params.start;
    let e_date = req.params.end;

    var sql1 = ` SELECT * FROM code;`;
    var sql2 = ` SELECT * FROM code WHERE main_id=${m_id} AND sub_id=${s_id} AND start=${s_date} AND end=${e_date};`;
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
            body: "codeCU.ejs",
            cls: cls,
            codes: results,
            categorys: codes,
            types: types,
          };
          res.render("mainFrame", context, (err, html) => {
            res.end(html);
          }); //render end
        }); //query end
      });
    });
  },

  code_update_process: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var post = req.body;
    let sanitizedMain_id = sanitizeHtml(post.main_id);
    let sanitizedSub_id = sanitizeHtml(post.sub_id);
    let sanitizedMain_name = sanitizeHtml(post.main_name);
    let sanitizedSub_name = sanitizeHtml(post.sub_name);
    let sanitizedStart = sanitizeHtml(post.start);
    let sanitizedEnd = sanitizeHtml(post.end);

    // 기존 값 (업데이트 시 WHERE 조건에 사용)
    let originalMain_id = post.original_main_id;
    let originalSub_id = post.original_sub_id;
    let originalStart = post.original_start;
    let originalEnd = post.original_end;

    var sql1 = ` SELECT * FROM code`;
    var sql2 = `
      UPDATE code 
      SET main_id = ?, sub_id = ?, main_name = ?, sub_name = ?, start = ?, end = ? 
      WHERE main_id = ? AND sub_id = ? AND start = ? AND end = ?
    `;
    db.query(sql1, (error1, codes) => {
      if (error1) {
        throw error1;
      }
      db.query(
        sql2,
        [
          sanitizedMain_id,
          sanitizedSub_id,
          sanitizedMain_name,
          sanitizedSub_name,
          sanitizedStart,
          sanitizedEnd,
          originalMain_id,
          originalSub_id,
          originalStart,
          originalEnd,
        ],
        (error, results) => {
          if (error) {
            throw error;
          }
          // 리다이렉트 후 별도의 추가 응답 없이 종료
          res.redirect(`/code/view`);
        }
      ); //query end
    });
  },

  code_delete_process: (req, res) => {
    let m_id = req.params.main_id;
    let s_id = req.params.sub_id;
    let s_date = req.params.start;
    let e_date = req.params.end;
    db.query(
      "DELETE FROM code WHERE main_id = ? AND sub_id = ? AND start = ? AND end = ?",
      [m_id, s_id, s_date, e_date],
      (error, result) => {
        if (error) {
          throw error;
        }
        res.writeHead(302, { Location: `/code/view` });
        res.end();
      }
    );
  },
};

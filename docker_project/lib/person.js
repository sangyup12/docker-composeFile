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
  person_view: (req, res) => {
    const { login, name, cls } = authIsOwner(req, res);
    const sql1 = `SELECT * FROM boardtype;`;
    const sql2 = `SELECT * FROM person;`;
    const sql3 = `SELECT * FROM code;`;

    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;

      db.query(sql1, (error1, types) => {
        if (error1) {
          console.error("Error executing sql1:", error1);
          return res.status(500).send("Internal Server Error");
        }

        db.query(sql2, (error2, results) => {
          if (error2) {
            console.error("Error executing sql2:", error2);
            return res.status(500).send("Internal Server Error");
          }

          const context = {
            who: name,
            login: login,
            body: "person.ejs",
            cls: cls,
            man: results,
            categorys: codes,
            types: types,
          };

          res.render("mainFrame", context, (err, html) => {
            if (err) {
              console.error("Error rendering template:", err);
              return res.status(500).send("Internal Server Error");
            }
            res.send(html);
          });
        });
      });
    });
  },

  person_create: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var sql2 = ` SELECT * FROM person;`;
    var sql0 = ` SELECT * FROM boardtype;`;
    const sql3 = `SELECT * FROM code;`;

    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sql0, (error0, types) => {
        if (error0) {
          throw error0;
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
            body: "personCU.ejs",
            cls: cls,
            types: types,
            categorys: codes,
            man: [],
          };
          res.render("mainFrame", context, (err, html) => {
            if (err) {
              throw err;
            }
            res.end(html);
          }); //render end
        });
      }); //query end
    });
  },

  person_create_process: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var post = req.body;
    let sanitizedLoginid = sanitizeHtml(post.loginid);
    let sanitizedPassword = sanitizeHtml(post.password);
    let sanitizedName = sanitizeHtml(post.name);
    let sanitizedAddress = sanitizeHtml(post.address);
    let sanitizedTel = sanitizeHtml(post.tel);
    let sanitizedBirth = sanitizeHtml(post.birth);
    let sanitizedClass = sanitizeHtml(post.class);
    let sanitizedGrade = sanitizeHtml(post.grade);

    var sql2 = `
    INSERT INTO person (loginid, password, name, address, tel, birth, class, grade)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql2,
      [
        sanitizedLoginid,
        sanitizedPassword,
        sanitizedName,
        sanitizedAddress,
        sanitizedStart,
        sanitizedTel,
        sanitizedBirth,
        sanitizedClass,
        sanitizedGrade,
      ],
      (error, results) => {
        if (error) {
          throw error;
        }
        res.redirect(`/person/view`);

        var context = {
          /*********** mainFrame.ejs에 필요한 변수 ***********/
          who: name,
          login: login,
          body: "person.ejs",
          cls: cls,
          man: results,
        };
        res.render("mainFrame", context, (err, html) => {
          res.end(html);
        }); //render end
      }
    ); //query end
  },

  person_update: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    let id = req.params.loginid;

    var sql2 = ` SELECT * FROM person WHERE loginid="${id}"`;
    var sql0 = ` SELECT * FROM boardtype;`;
    const sql3 = `SELECT * FROM code;`;

    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sql0, (error0, types) => {
        if (error0) {
          throw error0;
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
            body: "personCU.ejs",
            cls: cls,
            types: types,
            categorys: codes,
            man: results,
          };
          res.render("mainFrame", context, (err, html) => {
            res.end(html);
          }); //render end
        }); //query end
      });
    });
  },

  person_update_process: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var post = req.body;
    let sanitizedLoginid = sanitizeHtml(post.loginid);
    let sanitizedPassword = sanitizeHtml(post.password);
    let sanitizedName = sanitizeHtml(post.name);
    let sanitizedAddress = sanitizeHtml(post.address);
    let sanitizedTel = sanitizeHtml(post.tel);
    let sanitizedBirth = sanitizeHtml(post.birth);
    let sanitizedClass = sanitizeHtml(post.class);
    let sanitizedGrade = sanitizeHtml(post.grade);
    // 기존 값 (업데이트 시 WHERE 조건에 사용)
    let originalLogin_id = post.original_id;

    var sql2 = `
      UPDATE person 
      SET loginid = ?, password = ?, name = ? , address = ?, tel = ?, birth = ?, class = ?, grade = ?
      WHERE loginid = ?
    `;
    db.query(
      sql2,
      [
        sanitizedLoginid,
        sanitizedPassword,
        sanitizedName,
        sanitizedAddress,
        sanitizedTel,
        sanitizedBirth,
        sanitizedClass,
        sanitizedGrade,
        originalLogin_id,
      ],
      (error, results) => {
        if (error) {
          throw error;
        }
        // 리다이렉트 후 별도의 추가 응답 없이 종료
        res.redirect(`/person/view`);
      }
    ); //query end
  },

  person_delete_process: (req, res) => {
    let id = req.params.loginid;
    db.query("DELETE FROM person WHERE loginid = ?", [id], (error, result) => {
      if (error) {
        throw error;
      }
      res.writeHead(302, { Location: `/person/view` });
      res.end();
    });
  },
};

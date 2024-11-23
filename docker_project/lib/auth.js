var db = require("./db");
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
  login: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    const sqlTypes = `SELECT * FROM boardtype`;
    const sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sqlTypes, (error1, types) => {
        if (error1) throw error1;
        var context = {
          /*********** mainFrame.ejs에 필요한 변수 ***********/

          who: name,
          login: login,
          body: "login.ejs",
          cls: cls,
          categorys: codes,
          types: types,
        };
        req.app.render("mainFrame", context, (err, html) => {
          res.end(html);
        });
      });
    });
  },

  login_process: (req, res) => {
    var post = req.body;
    var sntzedLoginid = sanitizeHtml(post.loginid);
    var sntzedPassword = sanitizeHtml(post.password);
    db.query(
      "select count(*) as num from person where loginid = ? and password = ?",
      [sntzedLoginid, sntzedPassword],
      (error, results) => {
        if (results[0].num === 1) {
          db.query(
            "select name, class,loginid, grade from person where loginid = ? and password = ?",
            [sntzedLoginid, sntzedPassword],
            (error, result) => {
              req.session.is_logined = true;
              req.session.loginid = result[0].loginid;
              req.session.name = result[0].name;
              req.session.cls = result[0].class;
              req.session.grade = result[0].grade;
              res.redirect("/");
            }
          );
        } else {
          req.session.is_logined = false;
          req.session.name = "Guest";
          req.session.cls = "NON";
          res.redirect("/");
        }
      }
    );
  },

  logout_process: (req, res) => {
    req.session.destroy((err) => {
      res.redirect("/");
    });
  },

  register: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    const sqlTypes = `SELECT * FROM boardtype`;
    let sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sqlTypes, (error1, types) => {
        if (error1) throw error1;

        var context = {
          /*********** mainFrame.ejs에 필요한 변수 ***********/
          who: name,
          login: login,
          body: "personCU.ejs",
          categorys: codes,
          types: types,
          cls: cls,
          man: [],
        };
        req.app.render("mainFrame", context, (err, html) => {
          if (err) throw err;
          res.end(html);
        });
      });
    });
  },

  register_process: (req, res) => {
    var { cls } = authIsOwner(req, res);

    var post = req.body;

    var sntzedLoginid = sanitizeHtml(post.loginid);
    var sntzedPassword = sanitizeHtml(post.password);
    var sntzedName = sanitizeHtml(post.name);
    var sntzedAddress = sanitizeHtml(post.address);
    var sntzedTel = sanitizeHtml(post.tel);
    var sntzedBith = sanitizeHtml(post.birth);
    let sanitizedClass = cls === "MNG" ? post.class : "CST";
    let sanitizedGrade = cls === "MNG" ? post.grade : "S";

    db.query(
      `
      INSERT INTO person (loginid, password, name, address, tel, birth, class, grade)
      VALUES(?, ?, ?, ? ,? ,?, ?, ?)`,
      [
        sntzedLoginid,
        sntzedPassword,
        sntzedName,
        sntzedAddress,
        sntzedTel,
        sntzedBith,
        sanitizedClass,
        sanitizedGrade,
      ],
      (error, result) => {
        if (error) {
          throw error;
        }
        // res.writeHead(302, { Location: `/page/${result.insertId}` });
        if (cls === "MNG") {
          res.redirect(`/person/view`);
        } else {
          res.redirect(`/`);
        }
        res.end();
      }
    );
  },
};

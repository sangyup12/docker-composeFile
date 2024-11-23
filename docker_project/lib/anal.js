const db = require("./db");

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
  customer: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const merId = req.params.merId;
    const getAddress = `select address,ROUND(( count(*) / ( select count(*) from person )) * 100, 2) as rate
    from person group by address;`;
    var sql1 = ` SELECT * FROM boardtype;`;
    let sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;

      db.query(sql1, (error, types) => {
        if (error) throw error;

        db.query(getAddress, (error1, results) => {
          if (error1) throw error1;

          var context = {
            isRoot: true, // '/' 요청일 때는 isRoot를 true로 설정
            /*********** mainFrame.ejs에 필요한 변수 ***********/
            who: name,
            login: login,
            body: "ceoAnal.ejs",
            cls: cls,
            percentage: results,
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
};

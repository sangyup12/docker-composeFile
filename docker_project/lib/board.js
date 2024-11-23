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
  // boardtype 목록 보기
  boardtype_view: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const sql = `SELECT * FROM boardtype;`;
    const sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sql, (error, results) => {
        if (error) throw error;
        var context = {
          who: name,
          login: login,
          body: "boardtype.ejs",
          cls: cls,
          types: results,
          categorys: codes,
        };
        res.render("mainFrame", context, (err, html) => {
          if (err) throw err;
          res.end(html);
        });
      });
    });
  },

  // 게시판 생성
  type_create: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const sql = `SELECT * FROM boardtype;`;
    const sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sql, (error, results) => {
        if (error) throw error;
        var context = {
          who: name,
          login: login,
          title: "입력",
          body: "boardtypeCU.ejs",
          cls: cls,
          categorys: codes,
          types: results,
          typeInput: [],
        };
        res.render("mainFrame", context, (err, html) => {
          if (err) throw err;
          res.end(html);
        });
      });
    });
  },

  // 게시판 생성 프로세스
  type_create_process: (req, res) => {
    var post = req.body;
    let sanitizedTitle = sanitizeHtml(post.title);
    let sanitizedNumPerPage = sanitizeHtml(post.numPerPage);
    let sanitizedDescription = sanitizeHtml(post.description);
    let sanitizedWrite_YN = sanitizeHtml(post.write_YN);
    let sanitizedre_YN = sanitizeHtml(post.re_YN);

    const sql = `
      INSERT INTO boardtype (title, numPerPage, description, write_YN, re_YN)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        sanitizedTitle,
        sanitizedNumPerPage,
        sanitizedDescription,
        sanitizedWrite_YN,
        sanitizedre_YN,
      ],
      (error) => {
        if (error) throw error;
        res.redirect(`/board/type/view`);
      }
    );
  },

  // 게시판 수정
  type_update: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    let typeId = req.params.type_id;

    const sql2 = `SELECT * FROM boardtype WHERE type_id = ?`;
    const sql = `SELECT * FROM boardtype;`;
    const sql3 = `SELECT * FROM code;`;
    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sql, (error, types) => {
        if (error) throw error;
        db.query(sql2, [typeId], (error, results) => {
          if (error) throw error;
          var context = {
            who: name,
            login: login,
            title: "수정",
            body: "boardtypeCU.ejs",
            cls: cls,
            categorys: codes,
            types: types,
            typeInput: results,
          };
          res.render("mainFrame", context, (err, html) => res.end(html));
        });
      });
    });
  },

  // 게시판 수정 프로세스
  type_update_process: (req, res) => {
    var post = req.body;
    let sanitizedTitle = sanitizeHtml(post.title);
    let sanitizedNumPerPage = sanitizeHtml(post.numPerPage);
    let sanitizedDescription = sanitizeHtml(post.description);
    let sanitizedWrite_YN = sanitizeHtml(post.write_YN);
    let sanitizedre_YN = sanitizeHtml(post.re_YN);
    let typeId = post.type_id;

    const sql = `
      UPDATE boardtype 
      SET title = ?, numPerPage = ?, description = ?, write_YN = ?, re_YN = ?
      WHERE type_id = ?
    `;

    db.query(
      sql,
      [
        sanitizedTitle,
        sanitizedNumPerPage,
        sanitizedDescription,
        sanitizedWrite_YN,
        sanitizedre_YN,
        typeId,
      ],
      (error) => {
        if (error) throw error;
        res.redirect(`/board/type/view`);
      }
    );
  },

  // 게시판 삭제 프로세스
  type_delete_process: (req, res) => {
    let typeId = req.params.type_id;
    db.query(`DELETE FROM boardtype WHERE type_id = ?`, [typeId], (error) => {
      if (error) throw error;
      res.redirect(`/board/type/view`);
    });
  },

  // 게시판별 게시글 보기
  board_view: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    const typeId = req.params.typeId;
    const currentPage = parseInt(req.query.page) || 1; // 현재 페이지 (기본값: 1)

    const sqlBoards = `
      SELECT * FROM board 
      WHERE type_id = ? 
      ORDER BY date DESC 
      LIMIT ? OFFSET ?
    `;
    const sqlTypes = `SELECT * FROM boardtype`;
    const sqlTypes2 = `SELECT * FROM boardtype WHERE type_id = ?`;
    const totalPostsSql = `SELECT COUNT(*) AS totalCount FROM board WHERE type_id = ?`;
    const sql3 = `SELECT * FROM code;`;

    db.query(sqlTypes2, [typeId], (error3, typeclass) => {
      if (error3) throw error3;

      if (typeclass.length === 0) {
        return res.status(404).send("해당 게시판 타입을 찾을 수 없습니다.");
      }

      const itemsPerPage = typeclass[0].numPerPage || 10; // numPerPage 값, 기본값 10
      const offset = (currentPage - 1) * itemsPerPage; // OFFSET 계산

      db.query(sqlBoards, [typeId, itemsPerPage, offset], (error1, boards) => {
        if (error1) throw error1;
        db.query(sql3, (error3, codes) => {
          if (error3) throw error3;
          db.query(sqlTypes, (error2, types) => {
            if (error2) throw error2;

            db.query(totalPostsSql, [typeId], (error4, countResults) => {
              if (error4) throw error4;

              const totalCount = countResults[0].totalCount;
              const totalPages = Math.ceil(totalCount / itemsPerPage);

              const context = {
                who: name,
                login: login,
                body: "board.ejs",
                cls: cls,
                types: types,
                categorys: codes,
                posts: boards,
                currentTypeId: typeId,
                checktype: typeclass,
                currentPage: currentPage,
                totalPages: totalPages,
                itemsPerPage: itemsPerPage,
              };

              res.render("mainFrame", context, (err, html) => res.end(html));
            });
          });
        });
      });
    });
  },

  // 게시글 생성 화면
  board_create: (req, res) => {
    const { login, name, cls } = authIsOwner(req, res);
    const typeId = req.params.typeId;
    const sqlTypes = `SELECT * FROM boardtype`;
    const sql3 = `SELECT * FROM code;`;

    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sqlTypes, (error1, types) => {
        if (error1) throw error1;

        const context = {
          who: name,
          login: login,
          body: "boardCRU.ejs",
          cls: cls,
          types: types,
          typeId: typeId,
          categorys: codes,
          post: [], // 새 글 작성 모드일 경우 post는 null로 설정
        };

        res.render("mainFrame", context, (err, html) => {
          if (err) {
            throw err;
          }
          res.end(html);
        });
      });
    });
  },

  // 게시글 생성 프로세스
  board_create_process: (req, res) => {
    var post = req.body;
    let sanitizedType_id = sanitizeHtml(post.type_id);
    let sanitizedLoginid = sanitizeHtml(post.loginid);
    let sanitizedPassword = sanitizeHtml(post.password);
    let sanitizedTitle = sanitizeHtml(post.title);
    let sanitizedContent = sanitizeHtml(post.content);
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");

    const sql = `
      INSERT INTO board (type_id, loginid, password, title, date, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        sanitizedType_id,
        sanitizedLoginid,
        sanitizedPassword,
        sanitizedTitle,
        date,
        sanitizedContent,
      ],
      (error) => {
        if (error) throw error;
        res.redirect(`/board/view/${sanitizedType_id}`);
      }
    );
  },

  board_detail: (req, res) => {
    const { login, name, cls } = authIsOwner(req, res);
    const board_id = req.params.boardId;
    const typeId = req.params.typeId;
    const editMode = req.query.edit === "true"; // "edit" 모드를 boolean 값으로 설정
    const sql = `SELECT * FROM board WHERE board_id = ?`;
    const sql0 = ` SELECT * FROM boardtype;`;
    const sql3 = `SELECT * FROM code;`;

    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;
      db.query(sql0, (error0, types) => {
        if (error0) {
          throw error0;
        }
        db.query(sql, [board_id], (error, results) => {
          if (error) {
            throw error;
          }
          if (results.length === 0) {
            res.send("게시글을 찾을 수 없습니다.");
            return;
          }

          const context = {
            who: name,
            login: login,
            cls: cls,
            typeId: typeId,
            body: "boardCRU.ejs",
            types: types,
            categorys: codes,
            editMode,
            post: results[0],
          };

          res.render("mainFrame", context, (err, html) => {
            if (err) {
              throw err;
            }
            res.end(html);
          });
        });
      });
    });
  },

  board_update: (req, res) => {
    const { login, name, cls } = authIsOwner(req, res);
    const boardId = req.params.boardId;
    const typeId = req.params.typeId;
    const sqlTypes = `SELECT * FROM boardtype`;
    const sql = `SELECT * FROM board WHERE board_id = ?`;
    const sql3 = `SELECT * FROM code;`;

    db.query(sql3, (error3, codes) => {
      if (error3) throw error3;

      db.query(sqlTypes, (error1, types) => {
        if (error1) throw error1;

        db.query(sql, [boardId], (error, results) => {
          if (error) {
            throw error;
          }

          const context = {
            who: name,
            login: login,
            body: "boardCRU.ejs",
            cls: cls,
            types: types,
            typeId: typeId,
            categorys: codes,
            post: results[0], // 기존 글 수정 모드일 경우 post에 데이터를 설정
          };

          res.render("mainFrame", context, (err, html) => {
            if (err) {
              throw err;
            }
            res.end(html);
          });
        });
      });
    });
  },

  board_update_process: (req, res) => {
    const { type_id } = req.body;
    const { login, cls, name } = authIsOwner(req, res);
    const post = req.body;
    const boardId = req.params.boardId;

    // 입력 데이터
    let sanitizedType_id = sanitizeHtml(post.type_id);
    let sanitizedTitle = sanitizeHtml(post.title);
    let sanitizedContent = sanitizeHtml(post.content);
    let inputPassword = sanitizeHtml(post.password); // 입력된 비밀번호
    // 기존 게시글의 비밀번호를 가져오기 위한 쿼리
    const checkPasswordSql = `SELECT password, type_id FROM board WHERE board_id = ?`;
    const sql0 = ` SELECT * FROM boardtype;`;

    db.query(sql0, (error0, types) => {
      if (error0) {
        throw error0;
      }
      db.query(checkPasswordSql, [boardId], (err, results) => {
        if (err) {
          throw err;
        }

        // 게시글이 없을 경우
        if (results.length === 0) {
          return res.status(404).send("게시글을 찾을 수 없습니다.");
        }

        const storedPassword = results[0].password;

        // 비밀번호 검증 (관리자는 검증을 생략)
        if (cls === "MNG" || storedPassword === inputPassword) {
          const updateSql = `
                UPDATE board 
                SET title = ?, content = ?, password = ?, type_id = ?
                WHERE board_id = ?
            `;

          db.query(
            updateSql,
            [
              sanitizedTitle,
              sanitizedContent,
              inputPassword,
              sanitizedType_id,
              boardId,
            ],
            (updateErr, result) => {
              if (updateErr) {
                throw updateErr;
              }
              // 수정 완료 후 게시글 목록으로 리다이렉트
              res.redirect(`/board/view/${sanitizedType_id}`);
            }
          );
        } else {
          // 비밀번호가 일치하지 않을 경우 에러 메시지를 포함하여 수정 페이지로 돌아감
          res.render("mainFrame", {
            editMode: true,
            post: {
              board_id: boardId,
              title: sanitizedTitle,
              content: sanitizedContent,
            },
            typeId: type_id,
            body: "boardCRU.ejs",
            types: types,
            who: name,
            login: login,
            cls: cls,
            errorMessage: "비밀번호가 일치하지 않습니다. 다시 시도하세요.",
          });
        }
      });
    });
  },

  board_delete: (req, res) => {
    const { login, name, cls } = authIsOwner(req, res); // 로그인 정보 및 사용자 권한 확인
    const board_id = req.params.boardId; // router에서 받아온 boardId
    const inputPassword = req.query.password; // URL 쿼리로 전달된 비밀번호

    if (cls === "MNG") {
      // 관리자는 비밀번호 확인 없이 삭제 가능
      db.query(
        "DELETE FROM board WHERE board_id = ?",
        [board_id],
        (error, result) => {
          if (error) {
            console.error("Error deleting board:", error);
            throw error;
          }
          res.redirect(`/board/view/${req.query.type_id}`);
        }
      );
    } else {
      // 관리자가 아닌 경우 비밀번호 확인
      db.query(
        "SELECT password FROM board WHERE board_id = ?",
        [board_id],
        (error, results) => {
          if (error) {
            console.error("Error finding board:", error);
            throw error;
          }

          if (results.length === 0) {
            // 게시글이 존재하지 않는 경우
            res
              .status(404)
              .send(
                "<script>alert('게시글을 찾을 수 없습니다.'); history.back();</script>"
              );
            return;
          }

          const storedPassword = results[0].password;

          if (storedPassword === inputPassword) {
            // 비밀번호가 일치하는 경우 삭제
            db.query(
              "DELETE FROM board WHERE board_id = ?",
              [board_id],
              (error, result) => {
                if (error) {
                  console.error("Error deleting board:", error);
                  throw error;
                }
                res.redirect(`/board/view/${req.query.type_id}`);
              }
            );
          } else {
            // 비밀번호가 일치하지 않는 경우
            res.send(
              "<script>alert('비밀번호가 일치하지 않습니다.'); history.back();</script>"
            );
          }
        }
      );
    }
  },
};

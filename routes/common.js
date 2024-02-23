/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2024-02-21 16:43:36
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-02-23 13:24:57
 * @FilePath: /experience-book-server/routes/common.js
 * @Description:
 */
var express = require('express');
var router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { SuccessModel, ErrorModel } = require('../http/response-model');
const dayjs = require('dayjs');
const { sqlExec } = require('../mysql/exec');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (process.env.ENV == 'develop') {
        cb(null, `uploads/content/`); // 上传文件保存的目录
      } else {
        cb(null, `uploads/content/`); // 上传文件保存的目录
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `s${req.body.skillId}-n${req.body.noteId}-${+Date.now() + ext}`); // 上传文件重命名
    }
  })
}).single('file');

router.post('/upload', async (req, res, next) => {
  try {
    upload(req, res, async function (err) {
      console.log(`req.file`, req.file);

      if (!req.file) {
        res.send(new ErrorModel({ msg: `文件不存在，请选择一个文件！` }));
        return;
      }

      const sqlResult = await sqlExec(`
      INSERT INTO experience_book.file
      (upload_datetime, url, name, size, ext)
      VALUES( '${dayjs().format()}', '${req.file.path}', '${req.file.filename}', '${
        req.file.size
      }', '${path.extname(req.file.originalname).repeat('.', '')}');
      `);

      console.log(`sqlResult`, sqlResult);

      if (!sqlResult) {
        res.send(new ErrorModel({ msg: `文件上传失败` }));
      } else if (err instanceof multer.MulterError) {
        res.send(new ErrorModel({ msg: err }));
      } else if (err) {
        res.send(new ErrorModel({ msg: err }));
      } else {
        const data = {
          id: sqlResult.insertId,
          url: req.file.path,
          name: req.file.filename
        };

        res.send(new SuccessModel({ msg: '上传成功', data }));
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/export-data', async (req, res, next) => {
  const tableList = await sqlExec(`SHOW TABLES;`);

  const dataMaps = {};

  for (let i = 0; i < tableList.length; i++) {
    const table = tableList[i];

    dataMaps[table.Tables_in_experience_book] = [];

    const rows = await sqlExec(`SELECT * FROM ${table.Tables_in_experience_book};`);

    dataMaps[table.Tables_in_experience_book] = rows;
  }

  res.send(new SuccessModel({ msg: '查询成功', data: dataMaps }));
});

module.exports = router;

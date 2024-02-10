/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-24 22:24:56
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-02-10 20:59:11
 * @FilePath: /experience-book-server/routes/note.js
 * @Description:
 */

var express = require('express');
var router = express.Router();
const { sqlExec } = require('../mysql/exec');
const { SuccessModel, ErrorModel } = require('../http/response-model');
const dayjs = require('dayjs');

/**
 * 新增笔记
 */
router.post('/', async (req, res, next) => {
  const sqlResult = await sqlExec(`
  INSERT INTO experience_book.note
  (title, create_time, content, exp, remark, end_time, skill_id , type)
  VALUES('无标题', '${dayjs().format('YYYY-MM-DD HH:mm:ss')}', '', 0, '', NULL, ${
    req.body.skillId
  },1);
  `).catch(err => {
    console.log(err);
  });

  if (sqlResult && sqlResult.affectedRows) {
    res.send(new SuccessModel({ data: sqlResult }));
  } else {
    res.send(new ErrorModel({ msg: '新增笔记失败' }));
  }
});

/**
 * 删除笔记
 */
router.delete('/:id', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `DELETE FROM experience_book.note WHERE id=${req.params.id}`
  ).catch(err => {
    console.log(err);
  });

  if (sqlResult.affectedRows > 0) {
    res.send(new SuccessModel({ data: null }));
  } else {
    res.send(new ErrorModel({ msg: '删除笔记失败' }));
  }
});

/**
 * 编辑笔记或经验
 */
router.put('/:id', async (req, res, next) => {
  const { title, content, exp, remark, skillId } = req.body;

  const updateInfoSql = `title='${title}', content='${content}', remark='${remark}', skill_id=${skillId}`;
  const updateExpSql = `exp=${exp}`;

  const sqlResult = await sqlExec(
    `UPDATE experience_book.note
  SET ${Object.keys(req.body).findIndex(e => e == 'exp') > -1 ? updateExpSql : updateInfoSql}
  WHERE id=${req.params.id};`
  ).catch(err => {
    console.log(err);
  });

  if (sqlResult && sqlResult.affectedRows > 0) {
    res.send(new SuccessModel());
  } else {
    res.send(new ErrorModel({ msg: '修改笔记失败' }));
  }
});

/**
 * 获取笔记详情
 */
router.get('/:id', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `SELECT *,skill_id as skillId FROM experience_book.note WHERE id = ${req.params.id}`
  ).catch(err => {
    console.log(err);
  });

  if (sqlResult && sqlResult.length > 0) {
    res.send(new SuccessModel({ data: sqlResult[0] }));
  } else {
    res.send(new ErrorModel({ msg: '获取笔记详情失败' }));
  }
});

module.exports = router;

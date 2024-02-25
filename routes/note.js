/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-24 22:24:56
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-02-25 14:57:41
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
  INSERT INTO note
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
    `UPDATE note SET status=0 WHERE id=${req.params.id}`
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

  const sqlResult = await sqlExec(
    `UPDATE note
  SET ${updateInfoSql}
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
 * 更新经验
 */
router.put('/exp/update/:id', async (req, res, next) => {
  const noteList = await sqlExec(
    `
    SELECT * FROM note WHERE id = '${req.params.id}'
    `
  ).catch(err => {
    console.log(`err`, err);
  });

  let sql = '';

  // 获得经验日期不存在，经验大于0则更新时间和经验字段
  if (noteList[0].get_exp_datetime) {
    sql = `
       UPDATE 
         note 
       SET 
           exp = '${req.body.exp}' 
       WHERE id=${req.params.id};
       `;
  } else if (!noteList[0].get_exp_datetime && req.body.exp > 0) {
    sql = `
        UPDATE 
          note 
        SET 
            exp = '${req.body.exp}' ,
            get_exp_datetime = '${dayjs().format('YYYY-MM-DD HH:mm:ss')}' 
        WHERE id=${req.params.id};
      `;
  } else {
    res.send(new SuccessModel());
  }

  const sqlResult = await sqlExec(sql).catch(err => {
    console.log(err);
  });

  if (sqlResult && sqlResult.affectedRows > 0) {
    res.send(new SuccessModel({ msg: '新增经验值成功' }));
  } else {
    res.send(new ErrorModel({ msg: '更新经验失败' }));
  }
});

/**
 * 获取笔记详情
 */
router.get('/:id', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `SELECT *,skill_id as skillId FROM note WHERE id = ${req.params.id}`
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

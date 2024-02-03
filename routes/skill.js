/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-24 22:24:56
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-02-03 20:19:27
 * @FilePath: /experience-book-server/routes/skill.js
 * @Description:
 */

var express = require('express');
var router = express.Router();
const { sqlExec } = require('../mysql/exec');
const { SuccessModel, ErrorModel } = require('../http/response-model');
const dayjs = require('dayjs');
const { getPhaseInfo } = require('../utils/exp-helper');

/**
 * 新增技能
 */
router.post('/', async (req, res, next) => {
  console.log(`req----------`, req);
  const sqlResult = await sqlExec(`
    INSERT INTO experience_book.skill
    (name, description, create_time)
    VALUES('${req.body.name}', '${req.body.description}', '${dayjs().format()}');
  `).catch(err => {
    // err [ 'code', 'errno', 'sqlState', 'sqlMessage', 'sql' ]
    res.send(new ErrorModel({ msg: '新增技能失败' }));
  });

  // "fieldCount": 0,
  // "affectedRows": 1,
  // "insertId": 5,
  // "info": "",
  // "serverStatus": 2,
  // "warningStatus": 0,
  // "changedRows": 0
  if (sqlResult.affectedRows) {
    res.send(new SuccessModel({ data: sqlResult }));
  } else {
    res.send(new ErrorModel());
  }
});

/**
 * 删除技能
 */
router.delete('/:id', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `DELETE FROM experience_book.skill WHERE id=${req.params.id}`
  ).catch(err => {
    res.send(new ErrorModel({ msg: '删除技能失败' }));
  });

  if (sqlResult.affectedRows > 0) {
    res.send(new SuccessModel({ data: null }));
  } else {
    res.send(new ErrorModel());
  }
});

/**
 * 编辑技能
 */
router.put('/:id', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `UPDATE experience_book.skill
    SET name='${req.body.name}', description='${req.body.description}'
    WHERE id=${req.params.id};`
  ).catch(err => {
    res.send(new ErrorModel({ msg: '修改技能失败' }));
  });

  if (sqlResult.affectedRows > 0) {
    res.send(new SuccessModel({ data: null }));
  } else {
    res.send(new ErrorModel());
  }
});

/**
 * 获取技能列表
 */
router.get('/list', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `SELECT s.id,s.name as skill_name ,SUM(n.exp) as total_exp  FROM skill s left join note n on s.id =n.skill_id GROUP BY s.id`
  ).catch(err => {
    res.send(new ErrorModel({ msg: '查询技能列表失败' }));
  });

  let result = {};

  if (sqlResult) {
    result = sqlResult
      .map(e => {
        const newData = {};
        // newData.total_exp = e.total_exp == null ? 0 : parseInt(e.total_exp);

        const parseData = getPhaseInfo(parseInt(e.total_exp));

        if (!parseData) {
          return;
        }

        newData.id = e.id;
        newData.name = parseData.skill_name;
        newData.level = parseData.level;
        newData.levelName = parseData.name;
        newData.currentLevelExp = parseData.currentExp;
        newData.color = parseData.color;
        newData.range = parseData.range;

        return newData;
      })
      .filter(e => e);
  }

  if (sqlResult) {
    res.send(new SuccessModel({ data: result }));
  } else {
    res.send(new ErrorModel());
  }
});

/**
 * 获取技能选项列表
 */
router.get('/options', async (req, res, next) => {
  const sqlResult = await sqlExec(`SELECT id, name FROM experience_book.skill;`).catch(err => {
    res.send(new ErrorModel({ msg: '查询技能选项数据失败' }));
  });

  if (sqlResult) {
    res.send(new SuccessModel({ data: sqlResult }));
  } else {
    res.send(new ErrorModel());
  }
});

module.exports = router;

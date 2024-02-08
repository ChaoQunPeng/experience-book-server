/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-24 22:24:56
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-02-08 12:18:20
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
  const sqlResult = await sqlExec(`
    INSERT INTO experience_book.skill
    (name, description, create_time)
    VALUES('${req.body.name}', '${req.body.description}', '${dayjs().format()}');
  `).catch(err => {
    console.log(err);
  });

  if (sqlResult.affectedRows) {
    res.send(new SuccessModel({ data: sqlResult }));
  } else {
    res.send(new ErrorModel({ msg: '新增技能失败' }));
  }
});

/**
 * 删除技能
 */
router.delete('/:id', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `DELETE FROM experience_book.skill WHERE id=${req.params.id}`
  ).catch(err => {
    console.log(err);
  });

  if (sqlResult.affectedRows > 0) {
    res.send(new SuccessModel({ data: null }));
  } else {
    res.send(new ErrorModel({ msg: '删除技能失败' }));
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
    console.log(err);
  });

  if (sqlResult.affectedRows > 0) {
    res.send(new SuccessModel({ data: null }));
  } else {
    res.send(new ErrorModel({ msg: '更新技能失败' }));
  }
});

/**
 * 获取技能列表
 */
router.get('/list', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `SELECT s.id,s.name as skill_name ,SUM(n.exp) as total_exp  FROM skill s left join note n on s.id =n.skill_id GROUP BY s.id`
  ).catch(err => {
    console.log(err);
  });

  if (sqlResult === undefined) {
    return;
  }

  let result = {};

  result = sqlResult.map(e => {
    const newData = {};

    const parseData = getPhaseInfo(parseInt(e.total_exp ?? 0));

    if (!parseData) {
      return;
    }

    newData.id = e.id;
    newData.name = e.skill_name;
    newData.level = parseData.level;
    newData.levelName = parseData.name;
    newData.currentLevelExp = parseData.currentExp;
    newData.color = parseData.color;
    newData.range = parseData.range;

    return newData;
  });

  if (sqlResult) {
    res.send(new SuccessModel({ data: result }));
  } else {
    res.send(new ErrorModel({ msg: '获取技能列表失败' }));
  }
});

/**
 * 获取技能下拉选项
 */
router.get('/options', async (req, res, next) => {
  const sqlResult = await sqlExec(`SELECT id, name FROM experience_book.skill;`).catch(err => {
    console.log(err);
  });

  if (sqlResult) {
    res.send(new SuccessModel({ data: sqlResult }));
  } else {
    res.send(new ErrorModel({ msg: '获取下拉数据失败' }));
  }
});

/**
 * 获取技能列表
 */
router.get('/note-list/:id', async (req, res, next) => {
  const sqlResult = await sqlExec(`
  SELECT s.id,s.name,n.id as note_id, n.title , n.content ,n.exp  ,n.create_time as note_create_time
  FROM skill s left join note n 
  on s.id = n.skill_id 
  WHERE n.skill_id =${req.params.id}
  ORDER BY n.create_time DESC
  `).catch(err => {
    console.log(err);
  });

  const findSkill = await sqlExec(`
    SELECT * from skill WHERE id =${req.params.id}
  `).catch(err => {
    console.log(err);
  });

  const processData = (dataList, skillId) => {
    const data = {};

    const skillList = dataList.filter(e => e.id == skillId);

    data.id = skillId;
    data.name = findSkill[0].name;
    data.expTotal = 0;
    data.noteList = [];

    skillList.forEach(e => {
      data.expTotal = skillList.reduce((acc, cur) => {
        return (acc += cur.exp);
      }, 0);

      data.noteList = skillList.map(e => {
        return {
          id: e.note_id,
          title: e.title,
          exp: e.exp,
          summary: e.content.slice(0, 100),
          createDateTime: e.note_create_time
        };
      });
    });

    return data;
  };

  if (sqlResult) {
    res.send(new SuccessModel({ data: processData(sqlResult, req.params.id) }));
  } else {
    res.send(new ErrorModel({ msg: '获取笔记列表失败' }));
  }
});

/**
 * 获取技能详情
 */
router.get('/:id', async (req, res, next) => {
  const sqlResult = await sqlExec(`SELECT * FROM skill s WHERE id=${req.params.id}`).catch(err => {
    console.log(err);
  });

  if (sqlResult && sqlResult.length > 0) {
    res.send(new SuccessModel({ data: sqlResult[0] }));
  } else {
    res.send(new ErrorModel({ msg: '获取技能详情失败' }));
  }
});

module.exports = router;

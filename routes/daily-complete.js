/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-24 22:24:56
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-01-13 13:26:17
 * @FilePath: /experience-bood-server/routes/daily-complete.js
 * @Description: 打卡路由
 */

var express = require('express');
var router = express.Router();
const { SuccessModel, ErrorModel } = require('../http/response-model');
const { sqlExec } = require('../mysql/exec');
const dayjs = require('dayjs');
const _ = require('lodash');

/**
 * 获取打卡列表
 */
router.get('/', async (req, res, next) => {
  const resolveData = rawData => {
    const map = new Map();

    rawData.forEach(item => {
      if (map.has(item.id)) {
        const existingData = map.get(item.id);

        const punch = {
          id: item.punch_id,
          create_time: dayjs(item.punch_create_time).format('YYYY-MM-DD')
        };
        if (punch.id !== null) {
          existingData.punch_list.push(punch);
        }
      } else {
        const newData = {
          id: item.id,
          name: item.name,
          create_time: item.create_time,
          punch_list: []
        };

        const punch = {
          id: item.punch_id,
          create_time: dayjs(item.punch_create_time).format('YYYY-MM-DD')
        };

        if (punch.id !== null) {
          newData.punch_list.push(punch);
        }

        newData.today_punch_status =
          rawData.findIndex(
            e => dayjs(e.punch_create_time).format('YYYY-MM-DD') == dayjs().format('YYYY-MM-DD') && e.id == newData.id
          ) > -1;

        map.set(item.id, newData);
      }
    });

    return Array.from(map.values());
  };

  // 将Map对象转换为数组

  const sqlQueryResult = await sqlExec(`
  SELECT 
    dc.id,
    dc.name,
    dc.create_time ,
    dc.is_valid,
    dcp.id AS punch_id,
    dcp.create_time AS punch_create_time
FROM
	  experience_book.daily_complete dc 
LEFT JOIN 
	  experience_book.daily_complete_punch dcp on dc.id = dcp.daily_complete_id
WHERE
    dc.is_valid = 1
  `).catch(err => {
    res.json(new ErrorModel({ msg: '应用程序出错', data: err, writeInLog: true }));
  });

  if (sqlQueryResult) {
    res.json(new SuccessModel({ data: resolveData(sqlQueryResult) }));
  } else {
    res.json(new ErrorModel());
  }
});

/**
 * 新增打卡事项
 */
router.post('/', async (req, res, next) => {
  const result = await sqlExec(
    `INSERT INTO experience_book.daily_complete ( name, create_time, is_valid) 
     VALUES('${req.body.name}', '${dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')}', 1)`
  );

  if (result) {
    res.send(new SuccessModel({ data: result }));
  } else {
    res.send(new ErrorModel());
  }
});

/**
 * 编辑打卡事项
 */
router.put('/:id', async (req, res, next) => {
  console.log(`req.body`, req.body);
  const result = await sqlExec(
    `UPDATE experience_book.daily_complete SET name='${req.body.name}' WHERE id=${req.params.id};`
  );

  if (result) {
    res.send(new SuccessModel({ data: result }));
  } else {
    res.send(new ErrorModel());
  }
});

/**
 * 删除
 */
router.delete('/:id', async (req, res, next) => {
  // const result = await sqlExec(`DELETE FROM experience_book.daily_complete WHERE id=${req.params.id};`);
  const selectResult = await sqlExec(`SELECT * FROM experience_book.daily_complete WHERE id = ${req.params.id}`);

  let valid = selectResult.length > 0 ? 0 : 1;

  const result = await sqlExec(`
  UPDATE experience_book.daily_complete
  SET is_valid = ${valid} WHERE id=${req.params.id}`);

  if (result) {
    res.send(new SuccessModel({ data: result }));
  } else {
    res.send(new ErrorModel());
  }
});

/**
 * 修改打卡状态
 */
router.put('/status/:id', async (req, res, next) => {
  const sqlQuery = await sqlExec(
    `SELECT * FROM  experience_book.daily_complete_punch 
     WHERE 
     daily_complete_id  = ${req.params.id} 
     AND 
     DATE_FORMAT(create_time, '%Y-%m-%d') = '${dayjs().format('YYYY-MM-DD')}' 
     LIMIT 1`
  );

  const sqlQueryResult = sqlQuery.length > 0 ? sqlQuery[0] : null;

  let finalResult;

  if (sqlQueryResult) {
    finalResult = await sqlExec(`DELETE FROM experience_book.daily_complete_punch WHERE id=${sqlQueryResult.id}`);
  } else {
    finalResult = await sqlExec(
      `INSERT INTO 
      experience_book.daily_complete_punch
       (create_time, daily_complete_id) 
       VALUES
       ('${dayjs().format('YYYY-MM-DD HH:mm:ss')}',  ${req.params.id});`
    );
  }

  // if (result) {
  //   res.send(new SuccessModel({ data: result }));
  // } else {
  //   res.send(new ErrorModel());
  // }

  res.json({ name: 1 });
});

module.exports = router;

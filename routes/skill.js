/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-24 22:24:56
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2024-02-21 15:31:35
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
  const hasNote = await sqlExec(`
    SELECT * FROM experience_book.note WHERE skill_id=${req.params.id}
    `).catch(err => {
    console.log(err);
  });

  if (hasNote && hasNote.length > 0) {
    res.send(new ErrorModel({ msg: `技能下面有笔记，不能删除哦！` }));
  } else {
    const sqlResult = await sqlExec(
      `DELETE FROM experience_book.skill WHERE id=${req.params.id}`
    ).catch(err => {
      console.log(err);
    });

    if (sqlResult && sqlResult.affectedRows > 0) {
      res.send(new SuccessModel({ data: null }));
    } else {
      res.send(new ErrorModel({ msg: '删除技能失败' }));
    }
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
    `
    SELECT 
    s.id,s.name as skill_name ,SUM(n.exp) as exp_total,
    (SELECT COUNT(*) FROM note n2 WHERE skill_id=s.id AND n2.status=1) as note_total,
    (SELECT COUNT(*) FROM note n3 WHERE skill_id=s.id AND n3.exp=0 AND n3.status=1) as todo_note_total
  FROM 
    skill s 
  left join 
    note n on s.id =n.skill_id 
  GROUP BY 
    s.id
    `
  ).catch(err => {
    console.log(err);
  });

  if (sqlResult == undefined) {
    res.send(new ErrorModel({ msg: '获取技能列表失败' }));
    return;
  }

  let result = {};

  result = sqlResult.map(e => {
    const newData = {};

    const parseData = getPhaseInfo(parseInt(e.exp_total ?? 0));

    if (!parseData) {
      return;
    }

    newData.id = e.id;
    newData.name = e.skill_name;
    newData.noteTotal = e.note_total;
    newData.expTotal = e.exp_total;
    newData.todoNoteTotal = e.todo_note_total;

    newData.level = parseData.level;
    newData.levelName = parseData.name;
    newData.currentLevelExp = parseData.currentExp;
    newData.color = parseData.color;
    newData.range = parseData.range;
    newData.levelExpCap = parseData.levelExpCap;

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
 * 获取技能笔记列表
 */
router.get('/note-list/:id', async (req, res, next) => {
  const sqlResult = await sqlExec(`
  SELECT s.id,s.name,n.id as note_id, n.title , n.content ,n.exp  ,n.create_time as note_create_time
  FROM skill s left join note n 
  on s.id = n.skill_id 
  WHERE n.skill_id =${req.params.id} AND n.status=1
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
          createDateTime: dayjs(e.note_create_time).format('YYYY/MM/DD HH:mm')
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

/**
 * 获取技能经验统计
 */
router.get('/exp/statistics', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `SELECT s.name ,  SUM(n.exp) as total_exp  FROM skill s  left join note n on s.id = n.skill_id WHERE n.status = 1 GROUP BY s.id`
  ).catch(err => {
    console.log(err);
  });

  if (sqlResult) {
    const data = sqlResult.map(e => {
      return {
        name: e.name,
        totalExp: parseInt(e.total_exp)
      };
    });

    res.send(new SuccessModel({ data: data }));
  } else {
    res.send(new ErrorModel({ msg: '获取技能经验统计失败' }));
  }
});

/**
 * 获取技能笔记数量统计
 */
router.get('/note/statistics', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `SELECT * FROM note n left join skill s on n.skill_id = s.id WHERE n.status=1`
  ).catch(err => {
    console.log(err);
  });

  const getResult = (data, equalTo0) => {
    const resultMap = {};

    const filterData = equalTo0 ? data.filter(e => e.exp == 0) : data.filter(e => e.exp > 0);

    filterData.forEach(item => {
      const { name, exp } = item;

      if (resultMap[name]) {
        resultMap[name].total++;
        if (exp > 0) {
          resultMap[name].hasExp = 'exp>0的笔记数';
        }
      } else {
        resultMap[name] = {
          name,
          total: 1,
          hasExp: exp > 0 ? 'exp>0的笔记数' : 'exp=0的笔记数'
        };
      }
    });

    return Object.values(resultMap);
  };

  if (sqlResult) {
    const result = [...getResult(sqlResult, true), ...getResult(sqlResult, false)];
    res.send(new SuccessModel({ data: result }));
  } else {
    res.send(new ErrorModel({ msg: '获取技能笔记数统计失败' }));
  }
});

/**
 * 获取技能学习趋势
 */
router.get('/exp/trend', async (req, res, next) => {
  const sqlResult = await sqlExec(
    `SELECT s.name as skill ,n.get_exp_datetime, n.exp  FROM skill s LEFT JOIN note n on s.id = n.skill_id WHERE n.status =1`
  ).catch(err => {
    console.log(err);
  });

  if (!sqlResult) {
    res.send(new ErrorModel({ msg: '获取技能学习趋势失败' }));
    return;
  }

  sqlResult.forEach(e => {
    e.get_exp_datetime = dayjs(e.get_exp_datetime).format('YYYY-MM-DD');
  });

  const parseSkillExpTrendData2 = data => {
    // 构建日期范围
    const sdate = dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD');
    const edate = dayjs().startOf('week').add(7, 'day').format('YYYY-MM-DD');

    const startDate = new Date(sdate); // 开始日期
    const endDate = new Date(edate); // 结束日期

    const dateRange = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dateRange.push(currentDate.toISOString().slice(0, 10)); // 添加当前日期到日期范围数组
      currentDate.setDate(currentDate.getDate() + 1); // 增加一天
    }

    // 处理数据
    const result = dateRange.flatMap(date => {
      return [...new Set(data.map(item => item.skill))].map(skill => {
        const filteredItems = data.filter(item => {
          return dayjs(item.get_exp_datetime).format('YYYY-MM-DD') === date && item.skill === skill;
        });

        const totalExp = filteredItems.reduce((acc, curr) => acc + curr.exp, 0);

        return {
          get_exp_datetime: date,
          exp: totalExp,
          skill: skill
        };
      });
    });

    return result;
  };

  if (sqlResult) {
    const finalResult = parseSkillExpTrendData2(sqlResult);
    res.send(new SuccessModel({ data: finalResult }));
  } else {
    res.send(new ErrorModel({ msg: '获取技能学习趋势失败' }));
  }
});

module.exports = router;
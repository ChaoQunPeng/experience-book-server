/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-24 22:24:56
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2023-12-25 22:57:14
 * @FilePath: /experience-bood-server/routes/skill.js
 * @Description: 
 */

var express = require('express');
var router = express.Router();
const { SkillModel } = require('../model/skill');
const { SuccessModel, ErrorModel } = require('../http/response-model');

/**
 * 获取技能列表
 */
router.get('/', async (req, res, next) => {
  const result = await SkillModel.find({});

  if (result) {
    res.send(new SuccessModel({ data: result }));
  } else {
    res.send(new ErrorModel());
  }
});

/**
 * 新增技能
 */
router.post('/', async (req, res, next) => {
  const skill = new SkillModel(req.body);

  await skill.save();

  res.json('技能新增成功');
});

module.exports = router;
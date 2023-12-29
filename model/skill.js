/*
 * @Author: PengChaoQun 1152684231@qq.com
 * @Date: 2023-12-24 21:42:04
 * @LastEditors: PengChaoQun 1152684231@qq.com
 * @LastEditTime: 2023-12-25 22:53:53
 * @FilePath: /experience-bood-server/model/skill.js
 * @Description:技能
 */

const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: String
});

const SkillModel = mongoose.models['Skill'] || mongoose.model('Skill', SkillSchema, 'skill');
module.exports = {
  SkillModel
};
